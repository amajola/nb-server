import {
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { userTable } from "../auth/schema.ts";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const postTable = pgTable("post", {
  id: serial("id").primaryKey().notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => userTable.id),
  header: text("header").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .defaultNow()
    .notNull(),
});

export const PostType = createInsertSchema(postTable)
  .required()
  .extend({
    createdAt: z.string(),
  });

export type PostTypeInfer = z.infer<typeof PostType>;

export const insertPostSchema = createInsertSchema(postTable).pick({
  header: true,
  content: true,
});
