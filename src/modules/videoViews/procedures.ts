import { db } from "@/db";
import { and, eq } from "drizzle-orm";
import { videoViews } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

import * as z from "zod";

export const videoViewsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        videoId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { videoId } = input;

      const [existingVideoView] = await db
        .select()
        .from(videoViews)
        .where(
          and(eq(videoViews.userId, userId), eq(videoViews.videoId, videoId)),
        );

      // returning this without throwing an error,-fetch over and overthrowing an error will cause Tanstack to re
      // we could throw 409 for conflict but it mostly would cause refetching the query.
      // there are some way so we can block this in he frontend.
      if (existingVideoView) {
        return existingVideoView;
      }

      const [createdVideoView] = await db
        .insert(videoViews)
        .values({
          userId,
          videoId,
        })
        .returning();

      return createdVideoView;
    }),
});
