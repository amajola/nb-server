import { defineConfig } from "drizzle-kit";

const databaseUrl = Deno.env.get("DATABASE_URL");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/**/schema.ts",
  out: "./drizzle",
  dbCredentials: databaseUrl && databaseUrl.trim() !== ""
    ? {
        url: databaseUrl,
        ssl: false,
      }
    : {
        host: Deno.env.get("DB_HOST") || Deno.env.get("POSTGRES_HOST") || "0.0.0.0",
        user: Deno.env.get("DB_USER") || Deno.env.get("POSTGRES_USER")!,
        password: Deno.env.get("DB_PASSWORD") || Deno.env.get("POSTGRES_PASSWORD")!,
        database: Deno.env.get("DB_NAME") || Deno.env.get("POSTGRES_DB") || "no-baddies",
        port: parseInt(Deno.env.get("DB_PORT") || Deno.env.get("POSTGRES_PORT") || "5432"),
        ssl: false,
      },
});
