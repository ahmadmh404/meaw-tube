import { eq } from "drizzle-orm";

import {
  VideoAssetCreatedWebhookEvent,
  VideoAssetErroredWebhookEvent,
  VideoAssetReadyWebhookEvent,
  VideoAssetTrackReadyWebhookEvent,
} from "@mux/mux-node/resources/webhooks/webhooks.mjs";
import { headers } from "next/headers";
import { mux } from "@/lib/mux";
import { db } from "@/db";
import { videos } from "@/db/schema";

type WebhookType =
  | VideoAssetCreatedWebhookEvent
  | VideoAssetErroredWebhookEvent
  | VideoAssetReadyWebhookEvent
  | VideoAssetTrackReadyWebhookEvent;

const SIGNNING_SECRET = process.env.MUX_WEBHOOK_SECRET!;

export async function POST(req: Request) {
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

    default:
      break;
  }

  return new Response("Webhook Received!", { status: 200 });
}
