import * as z from "zod";

import { db } from "@/db";
import { and, count, desc, eq, getColumns, inArray, lt, or } from "drizzle-orm";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import {
  commentInsertSchema,
  commentReactions,
  comments,
  users,
} from "@/db/schema";
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

      const [createdComments] = await db
        .insert(comments)
        .values({
          userId,
          videoId: input.videoId,
          value: input.value,
        })
        .returning();

      return createdComments;
    }),

  remove: protectedProcedure
    .input(
      z.object({
        commentId: z.uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const [deletedComment] = await db
        .delete(comments)
        .where(
          and(eq(comments.id, input.commentId), eq(comments.userId, userId)),
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
    .query(async ({ ctx, input }) => {
      const { clerkUserId } = ctx;
      const { videoId, cursor, limit } = input;

      let userId: string;

      // get the real user from the database
      const [user] = await db
        .select({ id: users.id })
        .from(users)
        .where(inArray(users.clerkId, clerkUserId ? [clerkUserId] : []));

      if (user) {
        userId = user.id;
      }

      const userReactions = db.$with("comment_user_reactions").as(
        db
          .select({
            commentId: commentReactions.commentId,
            type: commentReactions.type,
          })
          .from(commentReactions)
          .where(inArray(commentReactions.userId, user.id ? [user.id] : [])),
      );

      // Total video comments count.
      const VideoCommentsCount = db
        .select({ value: count() })
        .from(comments)
        .where(eq(comments.videoId, videoId));

      const paginatedComments = db
        .with(userReactions)
        .select({
          ...getColumns(comments),
          likeCount: db.$count(
            commentReactions,
            and(
              eq(comments.id, commentReactions.commentId),
              eq(commentReactions.type, "like"),
            ),
          ),

          dislikeCount: db.$count(
            commentReactions,
            and(
              eq(comments.id, commentReactions.commentId),
              eq(commentReactions.type, "dislike"),
            ),
          ),

          user: {
            ...getColumns(users),
            userReactions: userReactions.type,
          },
        })

        .from(comments)

        .innerJoin(users, eq(users.id, comments.userId))
        .leftJoin(userReactions, eq(comments.id, userReactions.commentId))
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
        .orderBy(desc(comments.updatedAt))
        .limit(limit + 1);

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
