import { cookies } from "next/headers";

/**
 * Helper to set the auth cookie consistently from server code.
 */
export function setAuthCookie(token: string) {
  cookies().set({
    name: 'codexedoc_token',
    value: token,
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
  });
}
