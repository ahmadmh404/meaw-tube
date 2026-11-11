import * as z from "zod";
import { db } from "@/db";
import { and, desc, eq, getColumns, lt, or } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { subscriptions, users } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const subscriptionsRouter = createTRPCRouter({
    getMany: protectedProcedure
    .input(
      z.object({
        cursor: z.object({
          creatorId: z.string().uuid(),
          updatedAt: z.date(),
        })
        .nullish(),
        limit: z.number().min(1).max(100),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { cursor, limit } = input;
      const { id: userId } = ctx.user;

      const data = await db
        .select({
          ...getColumns(subscriptions),
          user: {
            ...getColumns(users),
            subscriberCount: db.$count(
              subscriptions,
              eq(subscriptions.creatorId, users.id)
            ),
          }
        })
        .from(subscriptions)
        .innerJoin(users, eq(subscriptions.creatorId, users.id))
        .where(and(
          eq(subscriptions.viewerId, userId),
          cursor
            ? or(
                lt(subscriptions.updatedAt, cursor.updatedAt),
                  and(
                    eq(subscriptions.updatedAt, cursor.updatedAt),
                    lt(subscriptions.creatorId, cursor.creatorId)
                  )
                )
            : undefined,
        )).orderBy(desc(subscriptions.updatedAt), desc(subscriptions.creatorId))
        // Add 1 to the limit to check if there is more data
        .limit(limit + 1)

      const hasMore = data.length > limit;
      // Remove the last item if there is more data
      const items = hasMore ? data.slice(0, -1) : data;
      // Set the next cursor to the last item if there is more data
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore 
        ? {
          creatorId: lastItem.creatorId,
          updatedAt: lastItem.updatedAt,
        }
        : null;

      return {
        items,
        nextCursor,
      };
    }),
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
