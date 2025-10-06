import { z } from "zod";
import { load } from "@std/dotenv";

// Load .env file
await load({ export: true });

const envSchema = z.object({
  DB_HOST: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  DB_PORT: z.string(),
  NODE_ENV: z.enum(["development", "production", "test"]),
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
