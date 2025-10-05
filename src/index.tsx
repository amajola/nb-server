import { Hono } from "hono";
import { cors } from "hono/cors";
import Auth from "./routes/auth";
import Post from "./routes/posts";
import { auth } from "./lib/auth";
import Top from "./client";

export type Variables = {
  user: typeof auth.$Infer.User | null;
  session: typeof auth.$Infer.Session | null;
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

app.get("/auth", (c) => {
  const messages = ["Good Morning", "Good Evening", "Good Night"];
  return c.html(<Top messages={messages} />);
});

const routes = app.route("/auth", Auth).route("/posts", Post);

export type AppType = typeof routes;
export default app;