import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware de protección de rutas
 * - Protege /dashboard si no hay sesión
 * - Redirige /login si ya hay sesión
 */

const protectedRoutes = ['/dashboard'];
const publicRoutes = ['/login'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('auth-token')?.value;
    const isAuthenticated = !!token;

    // Proteger rutas del dashboard
    if (protectedRoutes.some(route => pathname.startsWith(route))) {
        if (!isAuthenticated) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // Redirigir si intenta acceder a login estando autenticado
    if (publicRoutes.some(route => pathname.startsWith(route))) {
        if (isAuthenticated) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    // Permitir acceso a APIs
    if (pathname.startsWith('/api')) {
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};