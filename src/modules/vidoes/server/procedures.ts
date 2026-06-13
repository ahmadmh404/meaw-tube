import z from "zod";
import { db } from "@/db";
import { mux } from "@/lib/mux";
import { UTApi } from "uploadthing/server";
import { videos, videoUpdateSchema } from "@/db/schema";

import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

import { and, eq } from "drizzle-orm";

export const videosRouter = createTRPCRouter({
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const { id: userId } = ctx.user;

    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        passthrough: userId,
        playback_policies: ["public"],
        inputs: [
          {
            generated_subtitles: [
              {
                language_code: "en",
                name: "English",
              },
            ],
          },
        ],
      },
      cors_origin: "*",
    });

    const [video] = await db
      .insert(videos)
      .values({
        userId,
        title: "Untitled_00",
        muxStatus: "waiting",
        muxUploadId: upload.id,
      })
      .returning();

    return { video, url: upload.url };
  }),

  update: protectedProcedure
    .input(videoUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const validatedData = videoUpdateSchema.safeParse(input);

      if (!validatedData.success || !input.id) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const [updated] = await db
        .update(videos)
        .set({
          title: input.title,
          description: input.description,
          categoryId: input.categoryId,
          visibility: input.visibility,
          updatedAt: new Date(),
        })
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
        .returning({ id: videos.id });

      if (!updated.id) {
        return new TRPCError({ code: "NOT_FOUND" });
      }

      return { updated };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { id: vidoeId } = input;

      const [deleted] = await db
        .delete(videos)
        .where(and(eq(videos.id, vidoeId), eq(videos.userId, userId)))
        .returning({
          id: videos.id,
          thumbnailKey: videos.thumbnailKey,
          previewKey: videos.previewKey,
        });

      if (!deleted.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Delete related uploadthing files.
      const utApi = new UTApi();

      if (deleted.thumbnailKey) {
        await utApi.deleteFiles(deleted.thumbnailKey);
      }

      if (deleted.previewKey) {
        await utApi.deleteFiles(deleted.previewKey);
      }

      // Delete the Mux Video File & It's info
      // TODO: later use fetchClient instead
      const response = await fetch(
        `https://api.mux.com/video/v1/assets/${deleted.id}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      return { deleted };
    }),

  restoreThumbnail: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { id: videoId } = input;

      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.userId, userId), eq(videos.id, videoId)));

      if (!existingVideo) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (!existingVideo.muxPlaybackId) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      if (existingVideo.thumbnailKey) {
        const utApi = new UTApi();
        const res = await utApi.deleteFiles(existingVideo.thumbnailKey);
        await db
          .update(videos)
          .set({
            thumbnailKey: null,
            thumbnailUrl: null,
          })
          .where(and(eq(videos.id, input.id), eq(videos.userId, userId)));
      }

      const utApi = new UTApi();

      const tempThumbnailURL = `https://image.mux.com/${existingVideo.muxPlaybackId}/thumbnail.jpg`;
      const uploadedThumbnail =
        await utApi.uploadFilesFromUrl(tempThumbnailURL);

      if (!uploadedThumbnail.data) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      const { key: thumbnailKey, ufsUrl: thumbnailUrl } =
        uploadedThumbnail.data;

      const [updatedVideo] = await db
        .update(videos)
        .set({
          thumbnailUrl,
          thumbnailKey,
          updatedAt: new Date(),
        })
        .returning();

      return updatedVideo;
    }),
});
