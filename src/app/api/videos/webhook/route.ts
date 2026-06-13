import { and, eq } from "drizzle-orm";

import {
  VideoAssetCreatedWebhookEvent,
  VideoAssetDeletedWebhookEvent,
  VideoAssetErroredWebhookEvent,
  VideoAssetReadyWebhookEvent,
  VideoAssetTrackReadyWebhookEvent,
} from "@mux/mux-node/resources/webhooks/webhooks.mjs";
import { headers } from "next/headers";
import { mux } from "@/lib/mux";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { UTApi } from "uploadthing/server";

type WebhookType =
  | VideoAssetCreatedWebhookEvent
  | VideoAssetErroredWebhookEvent
  | VideoAssetReadyWebhookEvent
  | VideoAssetDeletedWebhookEvent
  | VideoAssetTrackReadyWebhookEvent;

const SIGNNING_SECRET = process.env.MUX_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const utApi = new UTApi();
  if (!SIGNNING_SECRET) {
    throw new Error("MUX_SIGNING_SECRET is not set");
  }

  const headersPayload = await headers();
  const muxSignature = headersPayload.get("mux-signature"); // Note: headers.get() is synchronous in Next.js App Router
  if (!muxSignature) {
    return new Response("No Signature Found", { status: 401 });
  }

  // 1. Get the exact, raw body string from the request
  const rawBody = await req.text();

  try {
    // 2. Pass the raw string directly to Mux for verification
    mux.webhooks.verifySignature(
      rawBody,
      { "mux-signature": muxSignature },
      SIGNNING_SECRET,
    );
  } catch (err) {
    return new Response("Invalid Signature", { status: 400 });
  }

  // 3. Now that it's verified, safely parse it to use the payload data
  const payload = JSON.parse(rawBody);

  switch (payload?.type as WebhookType["type"]) {
    case "video.asset.created":
      const data = payload?.data as VideoAssetCreatedWebhookEvent["data"];
      if (!data.upload_id) {
        return new Response("No Upload Found", { status: 400 });
      }

      await db
        .update(videos)
        .set({
          muxAssetId: data.id,
          muxStatus: data.status,
        })
        .where(eq(videos.muxUploadId, data.upload_id));

      break;

    case "video.asset.ready":
      const readyData = payload?.data as VideoAssetReadyWebhookEvent["data"];
      const playbackId = readyData.playback_ids?.[0].id;

      if (!readyData.upload_id) {
        return new Response("Missing Upload ID", { status: 400 });
      }

      if (!playbackId) {
        return new Response("Missing Playback Id", { status: 400 });
      }

      const tempThumbnailURL = `https://image.mux.com/${playbackId}/thumbnail.jpg`;
      const tempPreviewURL = `https://image.mux.com/${playbackId}/animated.gif`;
      const duration = readyData?.duration
        ? Math.round(readyData.duration * 1000)
        : 0;

      const [uploadedThumbnail, uploadedPreview] =
        await utApi.uploadFilesFromUrl([tempThumbnailURL, tempPreviewURL]);

      if (!uploadedThumbnail.data || !uploadedPreview.data) {
        return;
      }

      const { key: thumbnailKey, ufsUrl: thumbnailUrl } =
        uploadedThumbnail.data;
      const { key: previewKey, ufsUrl: previewUrl } = uploadedPreview.data;

      await db
        .update(videos)
        .set({
          muxStatus: readyData.status,
          muxPlaybackId: playbackId,
          muxAssetId: readyData.id,
          thumbnailUrl,
          thumbnailKey,
          previewUrl,
          previewKey,
          duration,
        })
        .where(eq(videos.muxUploadId, readyData.upload_id));

      break;

    case "video.asset.errored":
      const errorData = payload.data as VideoAssetErroredWebhookEvent["data"];
      if (!errorData.upload_id) {
        return new Response("Missing Upload ID", { status: 400 });
      }

      await db
        .update(videos)
        .set({
          muxStatus: errorData.status,
        })
        .where(eq(videos.muxUploadId, errorData.upload_id));

      break;

    case "video.asset.deleted":
      const deleteData = payload.data as VideoAssetDeletedWebhookEvent["data"];
      if (!deleteData.upload_id) {
        return new Response("Missing Upload ID", { status: 400 });
      }

      const [existingVideo] = await db
        .select({
          thumbnailKey: videos.thumbnailKey,
          previewKey: videos.previewKey,
        })
        .from(videos)
        .where(eq(videos.muxUploadId, deleteData.upload_id));

      if (existingVideo.thumbnailKey) {
        const res = await utApi.deleteFiles(existingVideo.thumbnailKey);
      }

      if (existingVideo.previewKey) {
        const res = await utApi.deleteFiles(existingVideo.previewKey);
      }

      await db
        .delete(videos)
        .where(eq(videos.muxUploadId, deleteData.upload_id));

      break;

    case "video.asset.track.ready":
      const trackData =
        payload.data as VideoAssetTrackReadyWebhookEvent["data"];

      if (!trackData.asset_id) {
        return new Response("Missing Asset ID", { status: 400 });
      }

      await db
        .update(videos)
        .set({ muxTrackId: trackData.id, muxTrackStatus: trackData.status })
        .where(eq(videos.muxAssetId, trackData.asset_id));

      break;

    default:
      break;
  }

  return new Response("Webhook Received!", { status: 200 });
}
