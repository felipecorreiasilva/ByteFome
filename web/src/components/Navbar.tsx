'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

export function Navbar() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  
  // Garante uma segurança extra para extrair as iniciais caso o name exista
  const getUserInitials = (name?: string) => {
    if (!name) return 'BF';
    return name.substring(0, 2).toUpperCase();
  };

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
              <div className="flex items-center gap-3">
                {/* Avatar / Imagem do Utilizador */}
                <div className="relative h-10 w-10 overflow-hidden rounded-full border border-zinc-700 bg-zinc-800">
                  {user.image_url ? (
                    <Image
                      src={user.image_url}
                      alt={user.name || 'Utilizador'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    // Fallback seguro usando iniciais
                    <div className="flex h-full w-full items-center justify-center text-xs font-bold text-zinc-300">
                      {getUserInitials(user.name)}
                    </div>
                  )}
                </div>

                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-sm font-semibold text-zinc-100">{user.name || 'Utilizador'}</span>
                  <span className="text-xs text-red-400 capitalize">{user.role || 'client'}</span>
                </div>
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
            // Utilizador Não Autenticado (Mostra Entrar e Criar Conta)
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:text-white"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500"
              >
                Criar Conta
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}