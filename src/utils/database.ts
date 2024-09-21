// context.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { ENV } from "./env";
import { sessionTable, userTable, type User } from "../routes/auth/schema";
import { Client } from "pg";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { Lucia } from "lucia";
import { postTable } from "../routes/posts/schema";

const client = new Client({
  host: ENV.DB_HOST,
  port: Number(ENV.DB_PORT),
  user: ENV.DB_USER,
  password: ENV.DB_PASSWORD,
  database: ENV.DB_NAME,
  ssl: true,
});

const c = await client.connect();
console.log(c);

export const database = drizzle(client, {
  schema: { sessionTable, userTable, postTable },
});

export const AuthAdapter = new DrizzlePostgreSQLAdapter(
  database,
  sessionTable,
  userTable
);

export const lucia = new Lucia(AuthAdapter, {
  sessionCookie: {
    attributes: {
      secure: ENV.NODE_ENV === "production", // set `Secure` flag in HTTPS
    },
  },
  getUserAttributes: (attributes) => {
    return {
      // we don't need to expose the password hash!
      email: attributes.email,
    };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    UserId: number;
    email: string;
  }
}

export const createSession = async (
  user: User
): Promise<{ cookie: string; cookieId: string } | undefined> => {
  if (user.id) {
    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    return { cookie: sessionCookie.serialize(), cookieId: session.id };
  }
};

export default database;
