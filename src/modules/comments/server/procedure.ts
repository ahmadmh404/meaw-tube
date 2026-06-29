import * as z from "zod";

import { db } from "@/db";
import { and, count, desc, eq, getColumns, lt, or } from "drizzle-orm";
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

  remove: protectedProcedure
    .input(
      z.object({
        videoId: commentInsertSchema.shape.videoId,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const [deletedComment] = await db
        .delete(comments)
        .where(
          and(eq(comments.videoId, input.videoId), eq(comments.userId, userId)),
        )
        .returning();

      if (!deletedComment) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return deletedComment;
    }),

  getMany: baseProcedure
    .input(
      z.object({
        videoId: z.string(),
        cursor: z
          .object({
            id: z.uuid(),

            // Sorting by updatedAt
            updatedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      }),
    )
    .query(async ({ input }) => {
      const { videoId, cursor, limit } = input;

      const paginatedComments = db
        .select({
          ...getColumns(comments),
          user: users,
        })
        .from(comments)
        .where(
          and(
            eq(comments.videoId, videoId),
            cursor
              ? or(
                  lt(comments.updatedAt, cursor.updatedAt),
                  and(
                    eq(comments.updatedAt, cursor.updatedAt),
                    lt(comments.id, cursor.id),
                  ),
                )
              : undefined,
          ),
        )
        .innerJoin(users, eq(users.id, comments.userId))
        .orderBy(desc(comments.updatedAt))
        .limit(limit + 1);

      const VideoCommentsCount = db
        .select({ value: count() })
        .from(comments)
        .where(eq(comments.videoId, videoId));

      const [data, [{ value }]] = await db.batch([
        paginatedComments,
        VideoCommentsCount,
      ]);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            updatedAt: lastItem.updatedAt,
          }
        : null;

      return {
        items,
        nextCursor,
        count: value,
      };
    }),
});
