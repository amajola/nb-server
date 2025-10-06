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
});

export default database;
