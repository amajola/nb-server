import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  authSignInInputSchema,
  authSignupInputSchema,
  userTable,
} from "./schema";
import { hash, verify } from "@node-rs/argon2";
import database, { createSession } from "../../utils/database";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

const Auth = new Hono()
  .post(
    "/signup",
    zValidator("json", authSignupInputSchema, (result, c) => {
      if (!result.success) {
        return c.text("Invalid!", 400);
      }
    }),
    async (c) => {
      const { email, password, name } = c.req.valid("json");

      const passwordHash = await hash(password, {
        // recommended minimum parameters
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1,
      });

      const [user] = await database
        .insert(userTable)
        .values({ email, password: passwordHash, name })
        .returning({
          id: userTable.id,
          email: userTable.email,
          name: userTable.name,
        });

      if (!user)
        throw new HTTPException(401, { message: "This user already exists" });

      let Authorization;
      const session = await createSession(user);
      if (session) {
        if (session) {
          const [_, cookieValue] = session?.cookie.split("=");
          Authorization = cookieValue.split(";")[0];
          c.res.headers.set("Set-Cookie", session.cookie);
          c.res.headers.set("Authorization", cookieValue.split(";")[0]);
        }
      }

      return c.json({
        email: user.email,
        id: user.id,
        name: user.name,
        token: Authorization,
      });
    }
  )
  .post(
    "/signin",
    zValidator("json", authSignInInputSchema, (result, c) => {
      if (!result.success) {
        return c.text("Invalid!", 400);
      }
    }),
    async (c) => {
      const { email, password } = c.req.valid("json");

      const user = await database.query.userTable.findFirst({
        where: eq(userTable.email, email),
      });

      if (!user) throw new HTTPException(401, { message: "User not found" });

      const validPassword = await verify(user.password, password, {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1,
      });
      if (!validPassword) throw new Error("User not found");

      const session = await createSession(user);
      let Authorization;
      if (session) {
        const [_, cookieValue] = session?.cookie.split("=");
        c.header("Set-Cookie", session.cookie);
        Authorization = cookieValue.split(";")[0];
        c.header("Authorization", cookieValue.split(";")[0]);
      }

      return c.json({
        email: user.email,
        id: user.id,
        name: user.name,
        token: Authorization,
      });
    }
  );

export default Auth;
