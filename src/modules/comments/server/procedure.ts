import * as z from "zod";

import { db } from "@/db";
import {
  aliasedTable,
  and,
  count,
  desc,
  eq,
  getColumns,
  inArray,
  isNotNull,
  isNull,
  lt,
  or,
  sql,
} from "drizzle-orm";
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
        parentId: commentInsertSchema.shape.parentId,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const [existingComment] = await db
        .select({ parentId: comments.parentId })
        .from(comments)
        .where(inArray(comments.id, input.parentId ? [input.parentId] : []));

      // Test 1: the comment doesn't exists and parent id does (replying to a comment that does not exist/deleted)
      if (!existingComment && input.parentId) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Test 2: the comment exist and it already has a parent Id
      if (existingComment?.parentId && input.parentId) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const [createdComments] = await db
        .insert(comments)
        .values({
          userId,
          parentId: input.parentId,
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
        parentId: z.uuid().nullish(),
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
          .where(inArray(commentReactions.userId, user ? [user.id] : [])),
      );

      // Total video comments count.
      const VideoCommentsCount = db
        .select({ value: count() })
        .from(comments)
        .where(eq(comments.videoId, videoId));

      // The parent ids and it's replies
      const replies = db.$with("replies").as(
        db
          .select({
            parentId: comments.parentId,
            count: count(comments.id).as("count"),
          })
          .from(comments)
          .where(and())
          .groupBy(comments.parentId),
      );

      const paginatedComments = db
        .with(userReactions, replies)
        .select({
          ...getColumns(comments),
          repliesCount: replies.count,
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
        .leftJoin(replies, eq(comments.id, replies.parentId))
        .where(
          and(
            input.parentId
              ? eq(comments.parentId, input.parentId)
              : isNull(comments.parentId),
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
