import { db } from "@/db";
import { videos } from "@/db/schema";
import { and, eq } from "drizzle-orm";

import { UTApi } from "uploadthing/server";
import { serve } from "@upstash/workflow/nextjs";

import { ai } from "@/lib/gen-ai";
import { MINIMUM_THUMBNAIL_SVG_SIZE_BYTES } from "@/modules/videos/constants";

interface InputType {
  userId: string;
  videoId: string;
  prompt: string;
}

export const { POST } = serve(async (context) => {
  const input = context.requestPayload as InputType;

  const video = await context.run("get-existing-video", async () => {
    if (!input.userId || !input.videoId) {
      throw new Error("Bad Request");
    }

    const [existingVideo] = await db
      .select()
      .from(videos)
      .where(
        and(eq(videos.userId, input.userId), eq(videos.id, input.videoId)),
      );

    if (!existingVideo) throw new Error("Not Found");

    return existingVideo;
  });

  // generate the thumbnail, validate nad transform it to a file.
  const thumbnail = await context.run("generate-thumbnail", async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image",
      contents: input.prompt,
      config: {
        imageConfig: {
          // best for web applications
          // outputMimeType: "svg",
          // horizontal shape fo the image.
          aspectRatio: "16:9",
        },
      },
    });

    const data = response.candidates?.at(0)?.content;

    if (!data || !data?.parts) {
      throw new Error("Internal Server Error");
    }

    // store chunks
    const chunks = [] as Blob[];

    // map the parts and store the chunks
    data.parts.forEach((part) => {
      if (part.inlineData && part.inlineData?.data) {
        const imageData = part.inlineData.data;
        const buffer = Buffer.from(imageData, "base64");
        chunks.push(new Blob([buffer], { type: "text/plain" }));
      }
    });

    // summing all chunks together
    const thumbnailBlob = new Blob(chunks);

    // check if the generated image is not empty and the AI generated a real graphic
    if (thumbnailBlob.size < MINIMUM_THUMBNAIL_SVG_SIZE_BYTES) {
      throw new Error("Generated image is too small or empty.");
    }

    // turn the Blob into a valid file
    const thumbnailFile = new File([thumbnailBlob], "thumbnail");

    return thumbnailFile;
  });

  await context.run("update-video-thumbnail", async () => {
    const utApi = new UTApi();

    // upload the new thumbnail
    const { data, error } = await utApi.uploadFiles(thumbnail);

    // checking for an error
    if (error || !data) {
      throw new Error("Failed Uploading File...");
    }

    if (video.thumbnailKey) {
      await utApi.deleteFiles(video.thumbnailKey);
    }

    await db
      .update(videos)
      .set({
        thumbnailKey: data.key,
        thumbnailUrl: data.ufsUrl,
      })
      .where(
        and(eq(videos.id, input.videoId), eq(videos.userId, input.userId)),
      );

    return { success: true };
  });
});
