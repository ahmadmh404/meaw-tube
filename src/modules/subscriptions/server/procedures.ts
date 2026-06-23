import * as z from "zod";
import { db } from "@/db";
import { and, eq } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { subscriptions } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const subscriptionsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        creatorId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { creatorId } = input;

      if (userId === creatorId) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      //   const [existingSubscription] = await db
      //     .select()
      //     .from(subscriptions)
      //     .where(
      //       and(
      //         eq(subscriptions.viewerId, userId),
      //         eq(subscriptions.creatorId, creatorId),
      //       ),
      //     );

      //   if (existingSubscription) {
      //     const [deletedLike] = await db
      //       .delete(subscriptions)
      //       .where(
      //         and(
      //           eq(subscriptions.viewerId, userId),
      //           eq(subscriptions.creatorId, creatorId),
      //         ),
      //       )
      //       .returning();

      //     return deletedLike;
      //   }

      const [createdSubscriptions] = await db
        .insert(subscriptions)
        .values({
          viewerId: userId,
          creatorId,
        })
        .returning();

      return createdSubscriptions;
    }),

  remove: protectedProcedure
    .input(
      z.object({
        creatorId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { creatorId } = input;

      if (userId === creatorId) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const [deletedSubscription] = await db
        .delete(subscriptions)
        .where(
          and(
            eq(subscriptions.viewerId, userId),
            eq(subscriptions.creatorId, creatorId),
          ),
        )
        .returning();

      return deletedSubscription;
    }),
});
