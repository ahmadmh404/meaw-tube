import { db } from '@/db';
import { users } from '@/db/schema';
import { ratelimit } from '@/lib/rate-limit';
import { auth } from '@clerk/nextjs/server';
import { initTRPC, TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import superjson from 'superjson';


/**
 * This context creator accepts `headers` so it can be reused in both
 * the RSC server caller (where you pass `next/headers`) and the
 * API route handler (where you pass the request headers).
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
    // Keep this as light as possible
    const { userId } = await auth();

    return { clerkUserId: userId }
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC
    .context<Context>()
    .create({
        /**
         * @see https://trpc.io/docs/server/data-transformers
         */
        transformer: superjson,
    });

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;


// this should be used in authenticated rotuers
export const protectedProcedure = t.procedure.use(async function (opts) {
    const { ctx } = opts;

    if (ctx.clerkUserId == null) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
    }

    const [user] = await db.select().from(users).where(eq(users.clerkId, ctx.clerkUserId))

    if (user == null) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
    }

    const { success } = await ratelimit.limit(user.clerkId)

    if (!success) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS" })
    }

    return opts.next({
        ctx: { ...ctx, user }
    })
}) 