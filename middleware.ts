import { type NextRequest, NextResponse } from 'next/server';

/**
 * Next.js middleware.
 * Phase 2+: Will handle Supabase auth session refresh and route protection.
 *
 * Current behavior: passes all requests through unchanged.
 */
export async function middleware(_request: NextRequest) {
  // Phase 2: Implement auth session refresh via Supabase middleware helper
  return NextResponse.next();
}

/**
 * Routes the middleware should run on.
 * Excludes static assets and API routes that handle their own auth.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
