import { NextResponse } from 'next/server';

/**
 * POST /api/auth/logout
 * Limpia la cookie de sesión
 */
export async function POST() {
    try {
        const response = NextResponse.json({ ok: true });

        response.cookies.set('auth-token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0,
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { ok: false, error: 'Error al cerrar sesión' },
            { status: 500 }
        );
    }
}