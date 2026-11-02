'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext'; // Importa o hook do contexto global

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { register } = useAuth(); // Extrai a função register do AuthContext
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('As passwords não coincidem.');
            return;
        }

        setLoading(true);

        try {
            // Chama a função register do contexto (guarda o token e busca o utilizador completo por ID)
            await register({ name, email, password });
            router.push('/'); // Redireciona instantaneamente sem perder o estado
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || err.message || 'Erro ao criar conta.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-80px)] w-full items-center justify-center bg-zinc-950 text-white p-4">
            <form onSubmit={handleRegister} className="w-full max-w-md p-8 space-y-6 bg-zinc-900 rounded-lg border border-zinc-800 shadow-2xl">
                <h1 className="text-2xl font-bold text-center">Criar Conta no ByteFome</h1>

                {error && (
                    <div className="p-3 text-sm text-red-400 bg-red-950/50 border border-red-900 rounded">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Nome</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded focus:outline-none focus:border-red-500 text-white"
                        placeholder="O teu nome"
                    />
                </div>

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

                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Confirmar Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                    {loading ? 'A criar conta...' : 'Registar'}
                </button>

                <div className="text-center text-sm text-zinc-400 pt-2 border-t border-zinc-800">
                    Já tem conta?{' '}
                    <Link href="/login" className="text-red-500 hover:text-red-400 font-medium transition">
                        Entrar
                    </Link>
                </div>
            </form>
        </div>
    );
}