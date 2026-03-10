import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * GET /api/dashboard
 * Requiere autenticación. Devuelve datos del dashboard.
 */
export async function GET(request: NextRequest) {
    try {
        // Verificar cookie de autenticación
        const token = request.cookies.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json(
                { ok: false, error: 'No autorizado' },
                { status: 401 }
            );
        }

        // Leer JSON
        const jsonPath = join(process.cwd(), 'src', 'data', 'dashboard-data.json');
        const fileContent = readFileSync(jsonPath, 'utf-8');
        const data = JSON.parse(fileContent);

        // ⚠️ NUNCA devolver password
        const { password: _, ...userWithoutPassword } = data.user;

        return NextResponse.json({
            ...data,
            user: userWithoutPassword,
        });
    } catch (error) {
        console.error('Dashboard fetch error:', error);
        return NextResponse.json(
            { ok: false, error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}