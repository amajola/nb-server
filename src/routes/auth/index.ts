import { Hono } from "hono";
import { auth } from "../../lib/auth";

const Auth = new Hono()
  // Better Auth handles all the auth endpoints automatically
  // Mount all Better Auth routes
  .on(["GET", "POST"], "/api/auth/*", (c) => {
    return auth.handler(c.req.raw);
  })

  // Custom endpoint to get current session (optional - Better Auth provides this too)
  .get("/session", async (c) => {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session) {
      return c.json({ user: null, session: null });
    }

    return c.json(session);
  })

  // Custom endpoint for server-side sign up (if needed)
  .post("/signup", async (c) => {
    const body = await c.req.json();
    const { email, password, name } = body;

    const response = await auth.api.signUpEmail({
     	returnHeaders: true,
      body: {
        email,
        password,
        name,
      }
    });

    if (response.error) {
      return c.json({ error: response.error.message }, 400);
    }

    return c.json(response);
  })

  // Custom endpoint for server-side sign in (if needed)
  .post("/signin", async (c) => {
    const body = await c.req.json();
    const { email, password } = body;

    const response = await auth.api.signInEmail({
     	returnHeaders: true,
      body: {
        email,
        password,
      }
    });

    if (response.error) {
      return c.json({ error: response.error.message }, 401);
    }

    return c.json(response);
  });

export default Auth;
