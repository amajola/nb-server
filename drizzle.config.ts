import { defineConfig } from "drizzle-kit";
import { ENV } from "./src/utils/env";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/**/schema.ts",
  out: "./drizzle",
  dbCredentials: process.env.DATABASE_URL ? {
    url: process.env.DATABASE_URL,
    ssl: ENV.NODE_ENV === "production" ? true : false,
  } : {
    host: process.env.DB_HOST || "0.0.0.0",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "no-baddies",
    ssl: ENV.NODE_ENV === "production" ? true : false,
  },
});
