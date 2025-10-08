import { defineConfig } from "drizzle-kit";

// Always use individual connection parameters because connection string parsing
// has issues in Deno's npm compatibility layer
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/**/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    host: Deno.env.get("POSTGRES_HOST") || "0.0.0.0",
    port: parseInt(Deno.env.get("POSTGRES_PORT") || "5432"),
    user: Deno.env.get("POSTGRES_USER")!,
    password: Deno.env.get("POSTGRES_PASSWORD")!,
    database: Deno.env.get("POSTGRES_DB") || "no-baddies",
    ssl: false,
  },
});
