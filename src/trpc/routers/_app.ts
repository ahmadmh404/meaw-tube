import { createTRPCRouter } from "../init";

import { videosRouter } from "@/modules/videos/server/procedures";
import { studioRouter } from "@/modules/studio/server/procedures";
import { categoriesRouter } from "@/modules/categories/server/procedures";
import { videoViewsRouter } from "@/modules/videoViews/procedures";
import { videoReactionsRouter } from "@/modules/videoReactions/procedures";
import { subscriptionsRouter } from "@/modules/subscriptions/server/procedures";
import { CommentsRouter } from "@/modules/comments/server/procedure";
import { commentReactionsRouter } from "@/modules/commentReactions/server/procedures";

export const appRouter = createTRPCRouter({
  studio: studioRouter,
  videos: videosRouter,
  comments: CommentsRouter,
  videoViews: videoViewsRouter,
  categories: categoriesRouter,
  subscriptions: subscriptionsRouter,
  videoReactions: videoReactionsRouter,
  commentReactions: commentReactionsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
