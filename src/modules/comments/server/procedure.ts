import * as z from "zod";

import { db } from "@/db";
import { eq, getColumns } from "drizzle-orm";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { commentInsertSchema, comments, users } from "@/db/schema";
import { TRPCError } from "@trpc/server/unstable-core-do-not-import";

export const CommentsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        value: commentInsertSchema.shape.value,
        videoId: commentInsertSchema.shape.videoId,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const validation = commentInsertSchema.safeParse({ ...input, userId });

      if (!validation.success) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const [createdComments] = await db
        .insert(comments)
        .values({
          ...validation.data,
        })
        .returning();

      return createdComments;
    }),

  getMany: baseProcedure
    .input(
      z.object({
        videoId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { videoId } = input;

      const videoComments = await db
        .select({
          ...getColumns(comments),
          user: users,
        })
        .from(comments)
        .where(eq(comments.videoId, videoId))
        .innerJoin(users, eq(users.id, comments.userId));

      return videoComments;
    }),
});
