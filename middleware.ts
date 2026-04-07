import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Decode JWT token to extract claims.
 * Note: This doesn't verify the signature (that's done on the backend).
 * We're trusting the backend issued this token.
 */
function decodeJWT(token: string): Record<string, any> | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const payload = parts[1];
        const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
        return decoded;
    } catch (error) {
        return null;
    }
}

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Define protected routes (non-admin)
    const protectedRoutes = ['/create-listing', '/profile', '/sell', '/settings'];
    const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));

    // Define admin routes
    const isAdminRoute = path.startsWith('/admin');

    // Get token from cookies
    const token = request.cookies.get('access_token')?.value;

    // ──────────────────────────────────────────────────────────────
    // ADMIN ROUTE PROTECTION
    // ──────────────────────────────────────────────────────────────
    if (isAdminRoute) {
        if (!token) {
            // No token - redirect to login
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', path);
            return NextResponse.redirect(loginUrl);
        }

        // Decode token to check admin status
        const decoded = decodeJWT(token);
        if (!decoded || !decoded.is_admin) {
            // Not an admin - redirect to homepage or 403 page
            const homeUrl = new URL('/', request.url);
            return NextResponse.redirect(homeUrl);
        }

        // Admin token is valid, allow access
        return NextResponse.next();
    }

    // ──────────────────────────────────────────────────────────────
    // REGULAR PROTECTED ROUTES
    // ──────────────────────────────────────────────────────────────

    // Redirect unauthenticated users trying to access protected routes
    if (isProtectedRoute && !token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', path);
        return NextResponse.redirect(loginUrl);
    }

    // Redirect authenticated users away from auth pages
    const isAuthPage = path === '/login' || path === '/register';
    if (isAuthPage && token) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
