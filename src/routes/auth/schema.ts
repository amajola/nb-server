import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { postTable } from "../posts/schema";

export const userTable = pgTable("user", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  description: text("description"),
});

export const sessionTable = pgTable("session", {
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export const userRelations = relations(userTable, ({ many }) => ({
  posts: many(postTable),
}));

export const SessionType = createInsertSchema(sessionTable);
export const UserType = createInsertSchema(userTable).pick({
  id: true,
  name: true,
  email: true,
});

export type User = z.infer<typeof UserType>;

export const authSignupInputSchema = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string(),
});

export const authSignInInputSchema = authSignupInputSchema.omit({
  name: true,
});
