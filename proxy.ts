import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// ⚠️ Put this in .env.local
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET
);

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Only protect /app routes
  if (!pathname.startsWith('/app')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('codexedoc_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  try {
    await jwtVerify(token, JWT_SECRET);

    // Token is valid
    return NextResponse.next();
  } catch (error) {
    console.error('JWT verification failed:', error);

    // Clear invalid token and redirect to auth page
    const response = NextResponse.redirect(new URL('/auth', request.url));
    response.cookies.delete('codexedoc_token');
    return response;
  }
}

export const config = {
  matcher: ['/app', '/app/:path*'],
};