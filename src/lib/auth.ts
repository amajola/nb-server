import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { database } from "../utils/database.ts";
import { ENV } from "../utils/env.ts";

export const auth = betterAuth({
  database: drizzleAdapter(database, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  secret: ENV?.BETTER_AUTH_SECRET,
  baseURL: ENV?.BETTER_AUTH_URL || "http://localhost:8000",
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:5173", // Add your frontend URLs
  ],
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
