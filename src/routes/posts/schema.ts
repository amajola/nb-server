import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { userTable } from "../auth/schema";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const postTable = pgTable("post", {
  id: serial("id").primaryKey().notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => userTable.id),
  qoute: text("title").notNull(),
  isCountDown: boolean("is_count_down").notNull(),
  countDownDate: timestamp("count_down_date", {
    withTimezone: true,
    mode: "date",
  }),
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
    countDownDate: z.string().or(z.null()),
  });

export type PostTypeInfer = z.infer<typeof PostType>;

export const insertPostSchema = createInsertSchema(postTable, {
  countDownDate: z.string(),
}).pick({
  qoute: true,
  content: true,
  isCountDown: true,
  countDownDate: true,
});
