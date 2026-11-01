'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export function Navbar() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logótipo / Marca */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-red-500">
            Byte<span className="text-white">Fome</span>
          </span>
        </Link>

        {/* Links de Navegação */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-300">
          <Link href="/products" className="transition-colors hover:text-red-500">
            Cardápio
          </Link>
          <Link href="/orders" className="transition-colors hover:text-red-500">
            Pedidos
          </Link>
        </nav>

        {/* Ações / Utilizador */}
        <div className="flex items-center gap-4">
          {isLoading ? (
            // Estado de carregamento do token/sessão para evitar saltos visuais
            <div className="h-8 w-20 animate-pulse rounded-lg bg-zinc-800" />
          ) : isAuthenticated && user ? (
            // Utilizador Autenticado
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-semibold text-zinc-100">{user.name}</span>
                <span className="text-xs text-red-400 capitalize">{user.role}</span>
              </div>

              <button
                onClick={logout}
                className="rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-red-500 hover:bg-red-500/10 hover:text-red-400"
                title="Sair da conta"
              >
                Sair
              </button>
            </div>
          ) : (
            // Utilizador Não Autenticado
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500"
              >
                Entrar
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}