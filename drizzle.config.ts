import { defineConfig } from "drizzle-kit";

const databaseUrl = Deno.env.get("DATABASE_URL");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/**/schema.ts",
  out: "./drizzle",
  dbCredentials:
    databaseUrl && databaseUrl.trim() !== ""
      ? {
          url: databaseUrl,
          ssl: false,
        }
      : {
          host: Deno.env.get("POSTGRES_HOST") || "0.0.0.0",
          user: Deno.env.get("POSTGRES_USER")!,
          password: Deno.env.get("POSTGRES_PASSWORD")!,
          database: Deno.env.get("POSTGRES_DB") || "no-baddies",
          port: parseInt(Deno.env.get("POSTGRES_PORT") || "5432"),
          ssl: false,
        },
});
