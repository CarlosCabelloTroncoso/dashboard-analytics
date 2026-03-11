import { NextResponse } from 'next/server';

export async function POST() {

    const response = NextResponse.json({ ok: true });

    // Eliminar cookie usando los MISMOS atributos con los que fue creada
    response.cookies.set('auth-token', '', {
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
    });

    return response;
}