import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/**/schema.ts",
  out: "./drizzle",
  dbCredentials: Deno.env.get("DATABASE_URL")
    ? {
        url: Deno.env.get("DATABASE_URL")!,
        ssl: false,
      }
    : {
        host: Deno.env.get("DB_HOST") || "0.0.0.0",
        user: Deno.env.get("DB_USER")!,
        password: Deno.env.get("DB_PASSWORD")!,
        database: Deno.env.get("DB_NAME") || "no-baddies",
        ssl: false,
      },
});
