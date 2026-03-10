import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * POST /api/auth/login
 * Valida credenciales contra el JSON y establece cookie HttpOnly
 */
export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        // Validar campos requeridos
        if (!email || !password) {
            return NextResponse.json(
                { ok: false, error: 'Email y contraseña son requeridos' },
                { status: 400 }
            );
        }

        // Leer archivo JSON (SOLO SERVER SIDE)
        const jsonPath = join(process.cwd(), 'src', 'data', 'dashboard-data.json');
        const fileContent = readFileSync(jsonPath, 'utf-8');
        const data = JSON.parse(fileContent);

        // Validar credenciales
        const storedUser = data.user;

        if (email !== storedUser.email || password !== storedUser.password) {
            return NextResponse.json(
                { ok: false, error: 'Credenciales incorrectas' },
                { status: 401 }
            );
        }

        // ⚠️ NUNCA devolver password
        const { password: _, ...userWithoutPassword } = storedUser;

        const response = NextResponse.json({
            ok: true,
            token: storedUser.token,
            user: userWithoutPassword,
        });

        // Cookie HttpOnly (SEGURIDAD)
        response.cookies.set('auth-token', storedUser.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24,
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { ok: false, error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}