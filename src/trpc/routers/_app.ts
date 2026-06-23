import { createTRPCRouter } from "../init";

import { videosRouter } from "@/modules/videos/server/procedures";
import { studioRouter } from "@/modules/studio/server/procedures";
import { categoriesRouter } from "@/modules/categories/server/procedures";
import { videoViewsRouter } from "@/modules/videoViews/procedures";
import { videoReactionsRouter } from "@/modules/videoReactions/procedures";
import { subscriptionsRouter } from "@/modules/subscriptions/server/procedures";

export const appRouter = createTRPCRouter({
  videos: videosRouter,
  studio: studioRouter,
  videoViews: videoViewsRouter,
  categories: categoriesRouter,
  subscriptions: subscriptionsRouter,
  videoReactions: videoReactionsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
