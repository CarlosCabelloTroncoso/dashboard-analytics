'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from 'recharts';

export default function DashboardPage() {

    const router = useRouter();

    const [data, setData] = useState<any>(null);
    const [search, setSearch] = useState('');
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        fetch('/api/dashboard')
            .then(res => res.json())
            .then(setData);
    }, []);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/auth/login');
        router.refresh();
    };

    if (!data) return <p style={{ padding: 20 }}>Cargando dashboard...</p>;

    const filteredTransactions = data.transactions.filter((t: any) =>
        t.client.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div
            style={{
                fontFamily: 'sans-serif',
                background: '#f9fafb',
                minHeight: '100vh',
                color: '#111827' // COLOR BASE PARA TODO EL TEXTO
            }}
        >

            {/* HEADER */}

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 24px',
                background: '#fff',
                borderBottom: '1px solid #e5e7eb'
            }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>📊 Dashboard</h1>
                    <p style={{ color: '#6b7280' }}>
                        {data.user.name} • {data.user.role}
                    </p>
                </div>

                <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    style={{
                        padding: '8px 16px',
                        background: '#ef4444',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                >
                    {isLoggingOut ? 'Cerrando...' : 'Cerrar sesión'}
                </button>
            </div>


            <div style={{ padding: 24 }}>

                {/* KPI CARDS */}

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4,1fr)',
                    gap: 16,
                    marginBottom: 30
                }}>
                    {data.metrics.map((metric: any) => (
                        <div key={metric.id} style={{
                            background: '#fff',
                            padding: 20,
                            borderRadius: 8,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}>
                            <p style={{ color: '#6b7280' }}>{metric.label}</p>

                            <h2 style={{
                                fontSize: 28,
                                fontWeight: 'bold',
                                color: '#111827'
                            }}>
                                {metric.value} {metric.unit}
                            </h2>

                            <span style={{
                                color: metric.trend === 'up' ? '#16a34a' : '#dc2626'
                            }}>
                                {metric.change}
                            </span>
                        </div>
                    ))}
                </div>


                {/* CHART */}

                <div style={{
                    background: '#fff',
                    padding: 20,
                    borderRadius: 8,
                    marginBottom: 30
                }}>
                    <h3 style={{ marginBottom: 10 }}>
                        {data.chart.label}
                    </h3>

                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.chart.data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="period" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="sales" fill="#3b82f6" />
                            <Bar dataKey="visits" fill="#10b981" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>


                {/* TARGET PROGRESS */}

                <div style={{ marginBottom: 30 }}>
                    <h3>Objetivos</h3>

                    {data.targets.map((t: any) => (
                        <div key={t.metric} style={{ marginBottom: 10 }}>
                            <p>{t.metric}</p>

                            <div style={{
                                background: '#e5e7eb',
                                height: 10,
                                borderRadius: 5
                            }}>
                                <div style={{
                                    width: `${t.percentage}%`,
                                    background: '#22c55e',
                                    height: 10,
                                    borderRadius: 5
                                }} />
                            </div>

                            <span>{t.percentage}%</span>
                        </div>
                    ))}
                </div>


                {/* SEARCH */}

                <div style={{ marginBottom: 16 }}>
                    <input
                        placeholder="Buscar cliente..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            padding: 8,
                            width: 250,
                            border: '1px solid #d1d5db',
                            borderRadius: 6
                        }}
                    />
                </div>


                {/* TABLE */}

                <table style={{
                    width: '100%',
                    background: '#fff',
                    borderRadius: 8,
                    overflow: 'hidden',
                    borderCollapse: 'collapse'
                }}>
                    <thead style={{
                        background: '#f3f4f6',
                        color: '#374151'
                    }}>
                        <tr>
                            <th style={{ padding: 10 }}>ID</th>
                            <th>Fecha</th>
                            <th>Cliente</th>
                            <th>Producto</th>
                            <th>Monto</th>
                            <th>Estado</th>
                        </tr>
                    </thead>

                    <tbody style={{ color: '#111827' }}>
                        {filteredTransactions.map((t: any) => (
                            <tr key={t.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                                <td style={{ padding: 10 }}>{t.id}</td>
                                <td>{t.date}</td>
                                <td>{t.client}</td>
                                <td>{t.product}</td>
                                <td>${t.amount}</td>

                                <td>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: 6,
                                        fontSize: 12,
                                        color: '#fff',
                                        background:
                                            t.status === 'Completado'
                                                ? '#16a34a'
                                                : t.status === 'Pendiente'
                                                    ? '#f59e0b'
                                                    : '#dc2626'
                                    }}>
                                        {t.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>
        </div>
    );
}