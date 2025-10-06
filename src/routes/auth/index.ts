import { Hono } from "hono";
import { auth } from "../../lib/auth.ts";

const Auth = new Hono()
  // Better Auth handles all the auth endpoints automatically
  // This mounts all better-auth routes:
  // - POST /api/auth/sign-up/email
  // - POST /api/auth/sign-in/email
  // - POST /api/auth/sign-out
  // - GET /api/auth/session
  // and more...
  .on(["GET", "POST"], "/api/auth/*", (c) => {
    return auth.handler(c.req.raw);
  });

export default Auth;
