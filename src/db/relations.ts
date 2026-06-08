import { defineRelations } from "drizzle-orm";

import * as schema from './schema'

export const relations = defineRelations(schema, (r) => ({
    users: {
        videos: r.many.videos({
            from: r.users.id,
            to: r.videos.userId,
        })
    },

    videos: {
        user: r.one.users({
            from: r.videos.userId,
            to: r.users.id
        }),

        category: r.one.categories({
            from: r.videos.categoryId,
            to: r.categories.id,
            optional: true
        })
    }
}))