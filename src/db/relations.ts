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

    videoReactions: r.many.videoReactions({
      from: r.users.id,
      to: r.videoReactions.userId,
    }),

    // viewer fkey
    subscriptions: r.many.subscriptions({
      from: r.users.id,
      to: r.subscriptions.viewerId,
      alias: "subscriptions_viewer_id_fkey",
    }),

    // creator fkey
    subscribers: r.many.subscriptions({
      from: r.users.id,
      to: r.subscriptions.creatorId,
      alias: "subscriptions_creator_id_fkey",
    }),

    comments: r.many.comments({
      from: r.users.id,
      to: r.comments.userId,
    }),

    commentReactions: r.many.commentReactions({
      from: r.users.id,
      to: r.commentReactions.userId,
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

    reactions: r.many.videoReactions({
      from: r.videos.id,
      to: r.videoReactions.videoId,
    }),

    comments: r.many.comments({
      from: r.videos.id,
      to: r.comments.userId,
    }),
  },

  comments: {
    user: r.one.users({
      from: r.comments.userId,
      to: r.users.id,
    }),

    video: r.one.videos({
      from: r.comments.videoId,
      to: r.videos.id,
    }),

    reactions: r.many.commentReactions({
      from: r.comments.id,
      to: r.commentReactions.commentId,
    }),
  },

  commentReactions: {
    user: r.one.users({
      from: r.commentReactions.userId,
      to: r.users.id,
    }),

    comment: r.one.comments({
      from: r.commentReactions.commentId,
      to: r.comments.id,
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

  videoReactions: {
    viewer: r.one.users({
      from: r.videoReactions.userId,
      to: r.users.id,
    }),

    video: r.one.videos({
      from: r.videoReactions.videoId,
      to: r.videos.id,
    }),
  },

  subscriptions: {
    viewer: r.one.users({
      from: r.subscriptions.viewerId,
      to: r.users.id,
      alias: "subscriptions_viewer_id_fkey",
    }),

    creator: r.one.users({
      from: r.subscriptions.creatorId,
      to: r.users.id,
      alias: "subscriptions_creator_id_fkey",
    }),
  },
}));
