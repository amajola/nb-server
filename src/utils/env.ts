import { z } from "zod";
import { load } from "@std/dotenv";

// Load .env file
await load({ export: true });

const envSchema = z.object({
  POSTGRES_HOST: z.string(),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),
  POSTGRES_PORT: z.string(),
  NODE_ENV: z.enum(["development", "production", "test", "github_action"]),
  JWT_SECRET: z.string(),
  ENCRYPTION_KEY: z.string(),
  BETTER_AUTH_SECRET: z.string().min(32), // Required for Better Auth
  BETTER_AUTH_URL: z.string().url().optional(), // Optional, defaults to localhost in dev
});

// Parse and validate environment variables using Deno.env
const env = envSchema.safeParse(Deno.env.toObject());

// Check for errors
if (!env.success) {
  console.error("Invalid environment variables:", env.error.format());
  Deno.exit(1);
}

// Access validated environment variables
export const ENV = env.data;
