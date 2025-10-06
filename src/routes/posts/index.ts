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
  const token = c.req.header("Authorization");

  const sessionId = lucia.readBearerToken(token ?? "");
  const { session } = await lucia.validateSession(sessionId ?? "");
  if (!session) {
    c.set("authStatus", 401);
    c.set("authError", "User not Authorized");
  }
  c.set("session", session);
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
      const session = c.get("session");
      if (!user) {
        return c.json({ error: "User not found" }, 401);
      }
      const input = c.req.valid("json");
      const [post] = await database
        .insert(postTable)
        .values({
          ...input,
          userId: session.userId,
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
    }
  )
  .get("/", async (c) => {
    if (c.var.authStatus === 401) {
      return c.json({ error: "User is not authenticated" }, 401);
    }
    if (!user) {
      return c.json({ error: "User not found" }, 401);
    }

    const session = c.get("session");
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
      .where(eq(postTable.userId, session.userId))
      .orderBy(desc(postTable.createdAt))
      .rightJoin(userTable, eq(postTable.userId, userTable.id))
      .execute();

    return c.json({ posts, error: null }, 200);
  });

export default Post;
