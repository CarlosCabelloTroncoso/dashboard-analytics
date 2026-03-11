'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DashboardPage() {

    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/auth/login');
            router.refresh();
        } catch {
            setIsLoggingOut(false);
        }
    };

    return (
        <div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 24px',
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: '#fff',
            }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
                    📊 Dashboard
                </h1>
                <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#ef4444',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: isLoggingOut ? 'not-allowed' : 'pointer',
                        opacity: isLoggingOut ? 0.5 : 1,
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        transition: 'background-color 0.2s',
                    }}
                    onMouseOver={(e) => !isLoggingOut && (e.currentTarget.style.backgroundColor = '#dc2626')}
                    onMouseOut={(e) => !isLoggingOut && (e.currentTarget.style.backgroundColor = '#ef4444')}
                >
                    {isLoggingOut ? 'Cerrando sesión...' : '🚪 Cerrar Sesión'}
                </button>
            </div>
        </div>
    );
}