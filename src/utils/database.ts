import { drizzle } from "drizzle-orm/postgres-js";
import { ENV } from "./env.ts";
import { userTable, sessionTable, accountTable, verificationTable } from "../routes/auth/schema.ts";
import postgres from "postgres";
import { postTable } from "../routes/posts/schema.ts";

const connectionString = `postgres://${ENV?.DB_USER}:${ENV?.DB_PASSWORD}@${ENV?.DB_HOST}:${ENV?.DB_PORT}/${ENV?.DB_NAME}`;

const sql = postgres(connectionString, {
  ssl: false, // SSL disabled for local/containerized postgres
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const database = drizzle(sql, {
  schema: {
    user: userTable,
    session: sessionTable,
    account: accountTable,
    verification: verificationTable,
    post: postTable
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
