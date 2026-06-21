import { defineRelations } from "drizzle-orm";

import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  users: {
    videos: r.many.videos({
      from: r.users.id,
      to: r.videos.userId,
    }),

    // the suser views
    videoViews: r.many.videoViews({
      from: r.users.id,
      to: r.videoViews.userId,
    }),
  },

  videos: {
    user: r.one.users({
      from: r.videos.userId,
      to: r.users.id,
    }),

    category: r.one.categories({
      from: r.videos.categoryId,
      to: r.categories.id,
      optional: true,
    }),

    views: r.many.videoViews({
      from: r.videos.id,
      to: r.videoViews.videoId,
    }),
  },

  videoViews: {
    viewer: r.one.users({
      from: r.videoViews.userId,
      to: r.users.id,
    }),

    video: r.one.videos({
      from: r.videoViews.videoId,
      to: r.videos.id,
    }),
  },
}));
