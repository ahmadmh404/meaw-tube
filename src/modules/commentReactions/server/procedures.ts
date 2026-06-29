import z from "zod";

import { db } from "@/db";
import { commentReactions, commentReactionsInsertSchema } from "@/db/schema";
import { and, count, desc, eq, getColumns } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";

export const commentReactionsRouter = createTRPCRouter({
  like: protectedProcedure
    .input(
      z.object({
        commentId: z.uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      //   Checking if the user reaction exists on this comment
      const [existingUserReaction] = await db
        .select()
        .from(commentReactions)
        .where(
          and(
            eq(commentReactions.userId, userId),
            eq(commentReactions.commentId, input.commentId),
            eq(commentReactions.type, "like"),
          ),
        );

      if (existingUserReaction) {
        const [deletedUserReaction] = await db
          .delete(commentReactions)
          .where(
            and(
              eq(commentReactions.userId, userId),
              eq(commentReactions.commentId, input.commentId),
              eq(commentReactions.type, "like"),
            ),
          )
          .returning();

        if (!deletedUserReaction) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }

        return deletedUserReaction;
      }

      const [createdUserReaction] = await db
        .insert(commentReactions)
        .values({
          userId,
          commentId: input.commentId,
          type: "like",
        })
        .returning();

      if (!createdUserReaction) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      return createdUserReaction;
    }),

  dislike: protectedProcedure
    .input(
      z.object({
        commentId: z.uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      //   Checking if the user reaction exists on this comment
      const [existingUserReaction] = await db
        .select()
        .from(commentReactions)
        .where(
          and(
            eq(commentReactions.userId, userId),
            eq(commentReactions.commentId, input.commentId),
            eq(commentReactions.type, "dislike"),
          ),
        );

      if (existingUserReaction) {
        const [deletedUserReaction] = await db
          .delete(commentReactions)
          .where(
            and(
              eq(commentReactions.userId, userId),
              eq(commentReactions.commentId, input.commentId),
              eq(commentReactions.type, "dislike"),
            ),
          )
          .returning();

        if (!deletedUserReaction) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }

        return deletedUserReaction;
      }

      const [createdUserReaction] = await db
        .insert(commentReactions)
        .values({
          userId,
          commentId: input.commentId,
          type: "dislike",
        })
        .returning();

      if (!createdUserReaction) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      return createdUserReaction;
    }),
});
