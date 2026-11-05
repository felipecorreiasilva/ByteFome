// /app/dashboard/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { orderService } from '@/services/orderService';
import { userService } from '@/services/userService';
import { 
    FiDollarSign, 
    FiShoppingBag, 
    FiClock, 
    FiTrendingUp, 
    FiCheckCircle, 
    FiXCircle, 
    FiRefreshCw,
    FiEye
} from 'react-icons/fi';

interface DashboardStats {
    totalRevenue: number;
    totalOrders: number;
    pendingOrdersCount: number;
}

export default function DashboardPage() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [stats, setStats] = useState<DashboardStats>({
        totalRevenue: 0,
        totalOrders: 0,
        pendingOrdersCount: 0
    });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const ordersResponse: any = await orderService.getMyOrders();
            const orders = Array.isArray(ordersResponse) 
                ? ordersResponse 
                : ordersResponse?.data || [];

            // Para cada pedido, tenta enriquecer com o telefone do utilizador caso não venha preenchido
            const enrichedOrders = await Promise.all(
                orders.map(async (order: any) => {
                    let phone = order.phone;
                    if (!phone && order.user_id) {
                        try {
                            const orderUser = await userService.getUserById(order.user_id);
                            phone = orderUser?.phone;
                        } catch (err) {
                            // Ignora erro individual de utilizador se não encontrado
                        }
                    }
                    return { ...order, resolvedPhone: phone };
                })
            );

            setRecentOrders(enrichedOrders.slice(0, 5));

            // Cálculo das métricas principais usando 'total_amount' conforme o tipo Order
            const revenue = orders.reduce((acc: number, curr: any) => {
                const status = curr.status?.toLowerCase();
                if (status === 'completed' || status === 'paid' || status === 'delivered') {
                    return acc + Number(curr.total_amount || curr.total || 0);
                }
                return acc;
            }, 0);

            const pending = orders.filter((o: any) => {
                const st = o.status?.toLowerCase();
                return st === 'pending' || st === 'processing' || st === 'received' || st === 'created';
            }).length;

            setStats({
                totalRevenue: revenue,
                totalOrders: orders.length,
                pendingOrdersCount: pending
            });
        } catch (error) {
            console.error('Erro ao carregar dados do dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
            return;
        }

        if (isAuthenticated) {
            loadDashboardData();
        }
    }, [isAuthenticated, authLoading, router]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-red-600 text-white flex items-center justify-center">
                <div className="flex items-center gap-3 text-white font-semibold animate-pulse">
                    <FiRefreshCw className="animate-spin" size={20} />
                    <span>A carregar painel de controlo...</span>
                </div>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        const st = status?.toLowerCase();
        switch (st) {
            case 'completed':
            case 'delivered':
            case 'paid':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <FiCheckCircle size={12} /> Concluído
                    </span>
                );
            case 'pending':
            case 'processing':
            case 'received':
            case 'created':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <FiClock size={12} /> Pendente
                    </span>
                );
            case 'cancelled':
            case 'failed':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                        <FiXCircle size={12} /> Cancelado
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 text-zinc-300">
                        {status}
                    </span>
                );
        }
    };

    const formatPaymentMethod = (method: string) => {
        switch (method?.toLowerCase()) {
            case 'pix': return 'Pix';
            case 'credit_card': return 'Cartão de Crédito';
            case 'debit_card': return 'Cartão de Débito';
            case 'cash': return 'Dinheiro';
            default: return method || 'Outro';
        }
    };

    return (
        <div className="min-h-screen bg-red-600 text-white p-6 md:p-12 relative">
            <div className="max-w-7xl mx-auto bg-zinc-950 p-8 rounded-3xl border border-red-500/30 shadow-2xl space-y-8">
                
                {/* Header do Painel */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-white">
                            Dashboard <span className="text-red-500">ByteFome</span>
                        </h1>
                        <p className="text-sm text-zinc-400 mt-1">
                            Bem-vindo de volta, <span className="text-zinc-200 font-medium">{user?.name || 'Cliente'}</span>! Acompanha os teus pedidos e resultados.
                        </p>
                    </div>

                    <button
                        onClick={loadDashboardData}
                        className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-sm font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer self-start md:self-auto"
                    >
                        <FiRefreshCw size={16} />
                        Atualizar Dados
                    </button>
                </div>

                {/* Cards de Métricas Principais */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    
                    {/* Gasto Total / Faturação */}
                    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 relative overflow-hidden shadow-xl">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Gasto</span>
                            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                                <FiDollarSign size={20} />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-white">
                            R$ {stats.totalRevenue.toFixed(2).replace('.', ',')}
                        </p>
                        <span className="text-[11px] text-zinc-500 flex items-center gap-1 mt-2">
                            <FiTrendingUp className="text-emerald-400" /> Pedidos pagos/concluídos
                        </span>
                    </div>

                    {/* Total de Pedidos */}
                    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 relative overflow-hidden shadow-xl">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total de Pedidos</span>
                            <div className="p-2.5 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20">
                                <FiShoppingBag size={20} />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-white">
                            {stats.totalOrders}
                        </p>
                        <span className="text-[11px] text-zinc-500 mt-2 block">
                            Histórico de pedidos efetuados
                        </span>
                    </div>

                    {/* Pedidos Pendentes */}
                    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 relative overflow-hidden shadow-xl">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">A Aguardar</span>
                            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                                <FiClock size={20} />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-white">
                            {stats.pendingOrdersCount}
                        </p>
                        <span className="text-[11px] text-amber-400/80 mt-2 block font-medium">
                            Pedidos em andamento
                        </span>
                    </div>

                </div>

                {/* Tabela de Pedidos Recentes */}
                <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-white">Os Meus Pedidos Recentes</h2>
                            <p className="text-xs text-zinc-400">Resumo dos teus últimos pedidos realizados no ByteFome</p>
                        </div>
                        <button
                            onClick={() => router.push('/orders')}
                            className="text-xs font-bold text-red-400 hover:text-red-300 hover:underline cursor-pointer transition"
                        >
                            Ver Todos &rarr;
                        </button>
                    </div>

                    {recentOrders.length === 0 ? (
                        <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
                            <p className="text-sm">Ainda não fizeste nenhum pedido.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-400">
                                        <th className="pb-3 px-4">ID</th>
                                        <th className="pb-3 px-4">Contacto</th>
                                        <th className="pb-3 px-4">Pagamento</th>
                                        <th className="pb-3 px-4">Status</th>
                                        <th className="pb-3 px-4 text-right">Ação / Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/60">
                                    {recentOrders.map((order) => {
                                        const orderTotal = Number(order.total_amount || order.total || 0);
                                        return (
                                            <tr 
                                                key={order.id} 
                                                className="hover:bg-zinc-800/30 transition"
                                            >
                                                <td className="py-4 px-4 font-mono text-xs font-bold text-zinc-300">
                                                    #{order.id}
                                                </td>
                                                <td className="py-4 px-4 text-zinc-300 font-medium">
                                                    {order.resolvedPhone || user?.phone || 'Não informado'}
                                                </td>
                                                <td className="py-4 px-4 text-zinc-400 uppercase text-xs font-semibold">
                                                    {formatPaymentMethod(order.payment_method || order.paymentMethod)}
                                                </td>
                                                <td className="py-4 px-4">
                                                    {getStatusBadge(order.status)}
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <span className="font-bold text-red-400">
                                                            R$ {orderTotal.toFixed(2).replace('.', ',')}
                                                        </span>
                                                        <button
                                                            onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                                                            className="inline-flex items-center gap-1 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/40 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
                                                            title="Ver Detalhes"
                                                        >
                                                            <FiEye size={14} /> Ver Detalhes
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}