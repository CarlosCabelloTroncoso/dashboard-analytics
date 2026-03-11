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

    if (!data) return <p className="p-5">Cargando dashboard...</p>;

    const filteredTransactions = data.transactions.filter((t: any) =>
        t.client.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="font-sans bg-gray-50 min-h-screen text-gray-900 animate-fade-in">

            {/* HEADER */}
            <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200">
                <div>
                    <h1 className="text-2xl font-bold">📊 Dashboard</h1>
                    <p className="text-gray-500 text-sm">
                        {data.user.name} • {data.user.role}
                    </p>
                </div>
                <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 transition"
                >
                    {isLoggingOut ? 'Cerrando...' : 'Cerrar sesión'}
                </button>
            </div>

            <div className="p-6">

                {/* KPI CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {data.metrics.map((metric: any) => (
                        <div key={metric.id} className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                            <p className="text-gray-500 text-sm">{metric.label}</p>
                            <h2 className="text-3xl font-bold text-gray-900 my-1">
                                {metric.value} <span className="text-lg">{metric.unit}</span>
                            </h2>
                            <span className={metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                                {metric.change}
                            </span>
                        </div>
                    ))}
                </div>

                {/* CHART */}
                <div className="bg-white p-5 rounded-lg shadow-sm mb-8">
                    <h3 className="font-semibold text-gray-800 mb-4">{data.chart.label}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.chart.data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="period" />
                            <YAxis width={80} />
                            <Tooltip />
                            <Bar dataKey="sales" fill="#3b82f6" />
                            <Bar dataKey="visits" fill="#10b981" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* TARGET PROGRESS */}
                <div className="bg-white p-5 rounded-lg shadow-sm mb-8">
                    <h3 className="font-semibold text-gray-800 mb-4">Objetivos</h3>
                    {data.targets.map((t: any) => (
                        <div key={t.metric} className="mb-4">
                            <div className="flex justify-between mb-1">
                                <p className="text-sm text-gray-700">{t.metric}</p>
                                <span className="text-sm font-medium text-gray-700">{t.percentage}%</span>
                            </div>
                            <div className="bg-gray-200 h-2.5 rounded-full">
                                <div
                                    className="bg-green-500 h-2.5 rounded-full"
                                    style={{ width: `${t.percentage}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* SEARCH */}
                <div className="mb-4">
                    <input
                        placeholder="Buscar cliente..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* TABLE */}
                <div className="overflow-x-auto rounded-lg shadow-sm">
                    <table className="w-full bg-white border-collapse">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm">ID</th>
                                <th className="px-4 py-3 text-left text-sm">Fecha</th>
                                <th className="px-4 py-3 text-left text-sm">Cliente</th>
                                <th className="px-4 py-3 text-left text-sm">Producto</th>
                                <th className="px-4 py-3 text-left text-sm">Monto</th>
                                <th className="px-4 py-3 text-left text-sm">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-900">
                            {filteredTransactions.map((t: any) => (
                                <tr key={t.id} className="border-t border-gray-200 hover:bg-gray-50 transition">
                                    <td className="px-4 py-3 text-sm">{t.id}</td>
                                    <td className="px-4 py-3 text-sm">{t.date}</td>
                                    <td className="px-4 py-3 text-sm">{t.client}</td>
                                    <td className="px-4 py-3 text-sm">{t.product}</td>
                                    <td className="px-4 py-3 text-sm">${t.amount}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`px-2 py-1 rounded text-xs text-white font-medium
                                            ${t.status === 'Completado' ? 'bg-green-600' :
                                                t.status === 'Pendiente' ? 'bg-yellow-500' : 'bg-red-600'}`}>
                                            {t.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}