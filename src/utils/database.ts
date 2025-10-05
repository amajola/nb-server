import { drizzle } from "drizzle-orm/node-postgres";
import { ENV } from "./env";
import { userTable, sessionTable, accountTable, verificationTable } from "../routes/auth/schema";
import { Client } from "pg";
import { postTable } from "../routes/posts/schema";

const client = new Client({
  host: ENV.DB_HOST,
  port: Number(ENV.DB_PORT),
  user: ENV.DB_USER,
  password: ENV.DB_PASSWORD,
  database: ENV.DB_NAME,
  ssl: ENV.NODE_ENV === "production" ? true : false,
});

const c = await client.connect();

export const database = drizzle(client, {
  schema: { 
    user: userTable,
    session: sessionTable, 
    account: accountTable,
    verification: verificationTable,
    post: postTable 
  },
});

export default database;