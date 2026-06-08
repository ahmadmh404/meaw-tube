import { db } from '@/db'
import { videos } from '@/db/schema'
import { createTRPCRouter, protectedProcedure } from '@/trpc/init'


export const videosRouter = createTRPCRouter({
    create: protectedProcedure.mutation(async ({ ctx }) => {
        const { user: { id: userId } } = ctx;

        console.log("the user ", userId, "is creating a video...");

        const [video] = await db.insert(videos).values({
            userId,
            title: "Untitled3"
        }).returning();

        console.log("The user has created this video successfully: ", video)

        return { video };
    }),
});