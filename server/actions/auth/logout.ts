"use server";

import { serverAuth } from "@/lib/auth/gateway/serverAuth";
import { redirect } from "next/navigation";

/**
 * Logout Server Action
 *
 * Resolves current session from HTTP-only cookie, invalidates the persistent
 * session in the store / database, clears the authentication cookie, and
 * redirects the user to `/auth`.
 *
 * @see ADR-002 — Authentication Architecture
 */
export async function logoutAction(): Promise<void> {
  await serverAuth.logout();
  redirect("/auth");
}
