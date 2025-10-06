import { Hono } from "hono";
import Auth from "./routes/auth/index.ts";
import Post from "./routes/posts/index.ts";
import { auth } from "./lib/auth.ts";
import { cors } from "hono/cors";

export type Variables = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};

const app = new Hono<{ Variables: Variables }>();

app.use("/*", cors());

// Mount Better Auth on all auth routes
app.on(["GET", "POST"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

// Optional: Add session middleware for protected routes
app.use("*", async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  c.set("user", session?.user || null);
  c.set("session", session?.session || null);

  await next();
});

const routes = app.route("/auth", Auth).route("/posts", Post);

export type AppType = typeof routes;

// Export default with fetch for Deno.serve
export default {
  fetch: app.fetch,
  port: Number(Deno.env.get("PORT")) || 8000,
};
