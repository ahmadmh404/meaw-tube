import { db } from "@/db";
import { videos } from "@/db/schema";
import { ai } from "@/lib/gen-ai";
import { TITLE_SYSTEM_PROMPT } from "@/modules/videos/constants";
import { serve } from "@upstash/workflow/nextjs";
import { and, eq } from "drizzle-orm";

interface InputType {
  userId: string;
  videoId: string;
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

  if (!video.muxPlaybackId || !video.muxTrackId) {
    throw new Error("This Service Is Unavailable At This Moment.");
  }

  const transcript = await context.run("get-transcript", async () => {
    const transcriptUrl = `https://stream.mux.com/${video.muxPlaybackId}/text/${video.muxTrackId}.txt`;
    const response = await fetch(transcriptUrl);
    const text = response.text();

    if (!text) {
      throw new Error("Internal Server Error");
    }

    return text;
  });

  const updatedTitle = await context.run("generate-title", async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: transcript,
      config: {
        systemInstruction: TITLE_SYSTEM_PROMPT,
      },
    });

    return response.text ?? video.title;
  });

  await context.run("update-video-title", async () => {
    const [updated] = await db
      .update(videos)
      .set({
        title: updatedTitle,
        updatedAt: new Date(),
      })
      .where(and(eq(videos.userId, video.userId), eq(videos.id, video.id)))
      .returning({ id: videos.id });

    if (!updated.id) {
      throw new Error("Error updating title...");
    }

    return { success: true };
  });
});
