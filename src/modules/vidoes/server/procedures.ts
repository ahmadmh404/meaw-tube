import { db } from "@/db";
import { videos, videoUpdateSchema } from "@/db/schema";
import { mux } from "@/lib/mux";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import z from "zod";

export const videosRouter = createTRPCRouter({
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const {
      user: { id: userId },
    } = ctx;

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

    console.log("The user has created this video successfully: ", video);

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

      const updated = await db
        .update(videos)
        .set({
          title: input.title,
          description: input.description,
          categoryId: input.categoryId,
          visibility: input.visibility,
          updatedAt: new Date(),
        })
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)));

      if (!updated) {
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
        .returning();

      if (!deleted) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return { deleted };
    }),
});
