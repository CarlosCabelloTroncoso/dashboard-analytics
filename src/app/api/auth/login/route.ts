import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * POST /api/auth/login
 *
 * Autentica al usuario utilizando credenciales almacenadas
 * en un archivo JSON del servidor.
 *
 * Responsabilidades:
 * - Validar email y contraseña
 * - Leer datos de usuario desde el JSON
 * - Establecer cookie HttpOnly con el token de sesión
 * - Retornar información del usuario sin exponer la contraseña
 */

export async function POST(request: NextRequest) {
    try {

        // Obtener credenciales enviadas desde el login
        const { email, password } = await request.json();

        /**
         * Validación básica de campos requeridos
         */
        if (!email || !password) {
            return NextResponse.json(
                { ok: false, error: 'Email y contraseña son requeridos' },
                { status: 400 }
            );
        }

        /**
         * Leer archivo JSON que contiene datos del dashboard
         * Este archivo solo se accede desde el servidor
         */
        const jsonPath = join(process.cwd(), 'src', 'data', 'dashboard-data.json');
        const fileContent = readFileSync(jsonPath, 'utf-8');
        const data = JSON.parse(fileContent);

        const storedUser = data.user;

        /**
         * Validación de credenciales
         */
        if (email !== storedUser.email || password !== storedUser.password) {
            return NextResponse.json(
                { ok: false, error: 'Credenciales incorrectas' },
                { status: 401 }
            );
        }

        /**
         * Eliminar contraseña antes de enviar datos al cliente
         */
        const { password: _, ...userWithoutPassword } = storedUser;

        const response = NextResponse.json({
            ok: true,
            user: userWithoutPassword,
        });

        /**
         * Crear cookie de autenticación
         * Esta cookie será utilizada por el middleware
         * para proteger rutas privadas como /dashboard
         */
        response.cookies.set('auth-token', storedUser.token, {
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24, // 1 día
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