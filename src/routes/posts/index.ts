import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { insertPostSchema, postTable } from "./schema.ts";
import database from "../../utils/database.ts";
import { type Variables } from "../../index.ts";
import { createMiddleware } from "hono/factory";
import { desc, eq } from "drizzle-orm";
import { userTable } from "../auth/schema.ts";
import { auth } from "../../lib/auth.ts";

export const authProtected = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session?.user) {
    return c.json({ error: "User not authenticated" }, 401);
  }

  c.set("user", session.user);
  c.set("session", session.session);
  await next();
});

const Post = new Hono<{ Variables: Variables }>()
  .use(authProtected)
  .post(
    "/create",
    zValidator("json", insertPostSchema, (result, c) => {
      if (!result.success) {
        return c.text("Invalid!", 400);
      }
    }),
    async (c) => {
      const user = c.get("user");
      if (!user) {
        return c.json({ error: "User not found" }, 401);
      }
      const input = c.req.valid("json");

      const [post] = await database
        .insert(postTable)
        .values({
          ...input,
          userId: user.id,
        })
        .returning();

      return c.json({
        post,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    },
  )
  .get("/", async (c) => {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "User not found" }, 401);
    }

    const posts = await database
      .select({
        user: {
          id: userTable.id,
          name: userTable.name,
          email: userTable.email,
        },
        post: {
          id: postTable.id,
          userId: postTable.userId,
          header: postTable.header,
          content: postTable.content,
          createdAt: postTable.createdAt,
        },
      })
      .from(postTable)
      .where(eq(postTable.userId, user.id))
      .orderBy(desc(postTable.createdAt))
      .rightJoin(userTable, eq(postTable.userId, userTable.id))
      .execute();

    return c.json({ posts, error: null }, 200);
  });

export default Post;
