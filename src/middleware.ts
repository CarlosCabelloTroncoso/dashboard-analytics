import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {

    const token = request.cookies.get("auth-token")?.value;
    const { pathname } = request.nextUrl;

    // Ignorar archivos internos de Next
    if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
        return NextResponse.next();
    }

    // Si intenta entrar al dashboard sin token → login
    if (pathname.startsWith("/dashboard") && !token) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Si ya está logueado y entra al login → dashboard
    if (pathname.startsWith("/auth/login") && token) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Si entra a la raíz
    if (pathname === "/") {
        if (!token) {
            return NextResponse.redirect(new URL("/auth/login", request.url));
        }
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/",
        "/dashboard/:path*",
        "/auth/login",
    ],
};