import { drizzle } from "drizzle-orm/postgres-js";
import { ENV } from "./env.ts";
import { userTable, sessionTable, accountTable, verificationTable } from "../routes/auth/schema.ts";
import postgres from "postgres";
import { postTable } from "../routes/posts/schema.ts";

// Use individual connection parameters instead of connection string
// because Deno's URL parsing has issues with some password characters
const sql = postgres({
  host: ENV.POSTGRES_HOST,
  port: parseInt(ENV.POSTGRES_PORT),
  user: ENV.POSTGRES_USER,
  password: ENV.POSTGRES_PASSWORD,
  database: ENV.POSTGRES_DB,
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
