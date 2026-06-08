import { db } from '@/db'
import { videos } from '@/db/schema'
import { createTRPCRouter, protectedProcedure } from '@/trpc/init'

import { eq, and, or, lt, desc } from 'drizzle-orm';
import { z } from 'zod'

export const studioRouter = createTRPCRouter({
    getMany: protectedProcedure
        .input(z.object({
            cursor: z.object({
                id: z.uuid(),
                updatedAt: z.date()
            }).nullish(),
            limit: z.number().min(1).max(100),
        }))
        .query(async ({ ctx, input }) => {
            const { cursor, limit } = input
            const { id: usreId } = ctx.user

            const data = await db
                .select().from(videos)
                .where(and(
                    eq(videos.userId, usreId),
                    cursor
                        ? or(
                            lt(videos.updatedAt, cursor.updatedAt),
                            and(
                                eq(videos.updatedAt, cursor.updatedAt),
                                lt(videos.id, cursor.id)
                            )
                        )
                        : undefined
                ))
                .orderBy(desc(videos.updatedAt), desc(videos.id))
                .limit(limit + 1);

            const hasMore = data.length > limit;

            // Remove the last item From The Data (It wasn't meant for the user, it's for our ops to find out if there is more data. )
            const itmes = hasMore ? data.slice(0, -1) : data;


            // Set the cursor vlue to the last item's ID (look at the top` lt(videos.id, cursor.id)`)
            const lastItem = itmes[itmes.length - 1];
            const nextCursor = hasMore ?
                {
                    id: lastItem.id,
                    updatedAt: lastItem.updatedAt,
                }
                : null

            return {
                itmes,
                nextCursor
            };
        }),
});