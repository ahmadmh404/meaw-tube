import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkId: text("clerk_id").unique(),
    name: text("name").notNull(),
    //   TODO: Add Banners
    imageUrl: text("image_url").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  // Query Faster
  (t) => [uniqueIndex("clerk_id_idx").on(t.clerkId)],
);
