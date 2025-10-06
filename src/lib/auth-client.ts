import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: "http://localhost:8000", // Your server URL
  // Add any client-specific plugins here
});

export type { Session, User } from "./auth.ts";
