import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sessionStore } from "@/lib/auth/session/sessionStore";
import { AUTH_COOKIE_NAME } from "@/lib/auth/utils/cookies";

/**
 * Next.js 16 Route Protection Proxy.
 *
 * Implements optimistic route-level authentication checks before rendering.
 *
 * Mode Behavior:
 * - **Community Mode** (`USE_AUTH=false` / default):
 *   Allows open access to `/app` for local contributors with zero external setup.
 *
 * - **Production Mode** (`USE_AUTH=true`):
 *   - `/app/:path*` requires an active session in `sessionStore`.
 *     Unauthenticated or expired requests are redirected to `/auth`, and invalid cookies deleted.
 *   - `/auth/:path*` redirects authenticated users to `/app`.
 *
 * Invariant: Authoritative authorization occurs in Server Actions via `serverAuth.requireUser()`.
 * This proxy handles only optimistic routing redirects.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isEnforcedAuth = process.env.USE_AUTH === "true";

  // In Community Mode, bypass route restrictions for seamless local development
  if (!isEnforcedAuth) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  // Handling /auth routes for authenticated users
  if (pathname.startsWith("/auth")) {
    if (token) {
      const session = await sessionStore.getSession(token);
      if (session) {
        return NextResponse.redirect(new URL("/app", request.url));
      }
      // Stale/invalid token on auth page: delete cookie
      const res = NextResponse.next();
      res.cookies.delete(AUTH_COOKIE_NAME);
      return res;
    }
    return NextResponse.next();
  }

  // Protecting /app routes
  if (pathname.startsWith("/app")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    const session = await sessionStore.getSession(token);
    if (!session) {
      const res = NextResponse.redirect(new URL("/auth", request.url));
      res.cookies.delete(AUTH_COOKIE_NAME);
      return res;
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/auth/:path*"],
};
