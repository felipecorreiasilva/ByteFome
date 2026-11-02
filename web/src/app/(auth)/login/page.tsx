'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext'; // Importa o hook do contexto de autenticação

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login, isAuthenticated, isLoading } = useAuth(); // Extrai também o estado de autenticação
    const router = useRouter();

    // Se o utilizador já estiver logado, redireciona automaticamente para a página inicial
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push('/');
        }
    }, [isAuthenticated, isLoading, router]);

    // Enquanto o contexto verifica o estado de login, mostra um ecrã de carregamento limpo
    if (isLoading) {
        return (
            <div className="flex min-h-[calc(100vh-80px)] w-full items-center justify-center bg-zinc-950 text-white">
                <p className="text-zinc-400 animate-pulse">A carregar...</p>
            </div>
        );
    }

    // Se já estiver autenticado, evita renderizar o formulário enquanto o router redireciona
    if (isAuthenticated) {
        return null;
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login({ email, password });
            router.push('/'); // Redireciona após o login bem-sucedido
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || err.message || 'Erro ao efetuar login.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-80px)] w-full items-center justify-center bg-zinc-950 text-white">
            <form onSubmit={handleLogin} className="w-full max-w-md p-8 space-y-6 bg-zinc-900 rounded-lg border border-zinc-800 shadow-2xl">
                <h1 className="text-2xl font-bold text-center">Entrar no ByteFome</h1>

                {error && (
                    <div className="p-3 text-sm text-red-400 bg-red-950/50 border border-red-900 rounded">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded focus:outline-none focus:border-red-500 text-white"
                        placeholder="teu@email.com"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded focus:outline-none focus:border-red-500 text-white"
                        placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 font-medium bg-red-600 hover:bg-red-700 transition rounded text-white disabled:opacity-50"
                >
                    {loading ? 'A entrar...' : 'Entrar'}
                </button>

                <div className="text-center text-sm text-zinc-400 pt-2 border-t border-zinc-800">
                    Ainda não tem conta?{' '}
                    <Link href="/register" className="text-red-500 hover:text-red-400 font-medium transition">
                        Criar conta
                    </Link>
                </div>
            </form>
        </div>
    );
}