import { cookies } from "next/headers";

/**
 * Cookie Management Utility for CODEXEDOC Authentication Layer.
 *
 * Encapsulates all read, write, and delete operations for authentication
 * cookies using Next.js `cookies()` API. Providers must consume this utility
 * instead of manipulating cookies directly.
 *
 * @see ADR-002 — Authentication Architecture
 */

/** Canonical cookie identifier for authentication tokens. */
export const AUTH_COOKIE_NAME = "codexedoc_token";

/**
 * Read the raw session token from the HTTP cookie header.
 *
 * @returns The token string or `null` if the cookie is missing or empty.
 */
export async function getAuthCookie(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    return token && token.trim() !== "" ? token : null;
  } catch (error) {
    // Handling non-request context calls gracefully
    return null;
  }
}

/**
 * Write the authentication cookie to the response headers.
 *
 * @param token     - The session token.
 * @param expiresAt - ISO-8601 string when the cookie expires.
 */
export async function setAuthCookie(token: string, expiresAt: string): Promise<void> {
  const expiresDate = new Date(expiresAt);
  const maxAge = Math.max(0, Math.floor((expiresDate.getTime() - Date.now()) / 1000));

  const cookieStore = await cookies();
  cookieStore.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresDate,
    maxAge,
  });
}

/**
 * Delete the authentication cookie from client storage.
 */
export async function deleteAuthCookie(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.set({
      name: AUTH_COOKIE_NAME,
      value: "",
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      expires: new Date(0),
    });
  } catch (error) {
    // Ignore cookie deletion errors outside server request context
  }
}
