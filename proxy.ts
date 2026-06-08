import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("codexedoc_token")?.value;

  // If user is logged in and tries to access /auth, redirect to /app
  if (pathname.startsWith("/auth") && token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.redirect(new URL("/app", request.url));
    } catch {
      const res = NextResponse.redirect(new URL("/auth", request.url));
      res.cookies.delete("codexedoc_token");
      return res;
    }
  }

  // Protect /app routes
  if (pathname.startsWith("/app")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch {
      const res = NextResponse.redirect(new URL("/auth", request.url));
      res.cookies.delete("codexedoc_token");
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/auth/:path*"],
};
