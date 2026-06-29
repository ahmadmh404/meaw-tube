/**
 * Clean up video files workflow

* @param
 *  - `userId` - The current authenticated user's id
 *  -`videoId` - The video's id which the operation is going on.
 *  - `mode` - The mode of cleanup which can be `restore`, `update`, `generate`, `manual_delete` or `webhook_triggered_delete`
 *
 * @returns void
 */

import { CLEANUP_WORKFLOW_MODES } from "@/modules/videos/constants";
import { serve } from "@upstash/workflow/nextjs";
import { UTApi } from "uploadthing/server";

type CleanupModeType = (typeof CLEANUP_WORKFLOW_MODES)[number];

export interface CleanupDaaType {
  mode: CleanupModeType;
  data: { thumbnailKey: string; previewKey?: string; assetId?: string };
}

export interface ThumbnailCleanupDataType extends CleanupDaaType {
  mode: "thumbnail_cleanup";
  data: { thumbnailKey: string };
}

export interface ThumbnailAndPreviewCleanupDataType extends CleanupDaaType {
  mode: "thumbnail_preview_cleanup";
  data: { thumbnailKey: string; previewKey: string };
}

export interface FullCleanupDataType extends CleanupDaaType {
  mode: "full_cleanup";
  data: { thumbnailKey: string; previewKey: string; assetId: string };
}

type InputType =
  | ThumbnailCleanupDataType
  | ThumbnailAndPreviewCleanupDataType
  | FullCleanupDataType;

export const { POST } = serve(async (context) => {
  const input = context.requestPayload as InputType;
  const utApi = new UTApi();

  await context.run("cleanup-video-assets", async () => {});
  // Use Switch
  switch (input.mode) {
    case "thumbnail_cleanup":
      await utApi.deleteFiles(input.data.thumbnailKey);
      break;

    case "thumbnail_preview_cleanup":
      await utApi.deleteFiles(input.data.thumbnailKey);
      await utApi.deleteFiles(input.data.previewKey);
      break;

    case "full_cleanup":
      const tokenId = process.env.MUX_TOKEN_ID!;
      const tokenSecret = process.env.MUX_TOKEN_SECRET!;

      if (!tokenId || !tokenSecret) throw new Error("Missing Credentials!");

      const basicAuthCredentials = Buffer.from(
        `${tokenId}:${tokenSecret}`,
      ).toString("base64");

      const response = await fetch(
        `https://api.mux.com/video/v1/assets/${input.data.assetId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${basicAuthCredentials!}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Internal Server Error.");
      }

      await utApi.deleteFiles(input.data.thumbnailKey);
      await utApi.deleteFiles(input.data.previewKey);

      // delete the mux asset
      break;
  }

  return new Response("Success", { status: 200 });
});
