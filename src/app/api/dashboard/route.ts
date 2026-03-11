import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET(request: NextRequest) {

    try {

        const token = request.cookies.get('auth-token')?.value;

        const jsonPath = join(process.cwd(), 'src', 'data', 'dashboard-data.json');
        const fileContent = readFileSync(jsonPath, 'utf-8');
        const data = JSON.parse(fileContent);

        const storedUser = data.user;

        // Validar token real
        if (!token || token !== storedUser.token) {
            return NextResponse.json(
                { ok: false, error: 'No autorizado' },
                { status: 401 }
            );
        }

        const { password: _, ...userWithoutPassword } = storedUser;

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