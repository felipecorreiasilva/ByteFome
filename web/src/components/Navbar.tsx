// /components/Navbar.tsx (ou o caminho onde tens a tua navbar)

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { CartModal } from '@/components/CartModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export function Navbar() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();

  const getUserInitials = (name?: string) => {
    if (!name) return 'BF';
    return name.substring(0, 2).toUpperCase();
  };

  // Trata a URL da imagem de perfil corretamente (suporta caminhos relativos e absolutos)
  const getAvatarUrl = (url?: string) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `${API_URL}${url}`;
  };

  const avatarUrl = getAvatarUrl(user?.image_url);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Logótipo / Marca */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="ByteFome" width={40} height={40} />
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

          {/* Ações / Utilizador / Carrinho */}
          <div className="flex items-center gap-4">
            
            {/* Botão para Abrir o Modal do Carrinho */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-zinc-300 transition-all hover:border-red-500 hover:text-white cursor-pointer"
              title="Ver Carrinho"
              aria-label="Abrir carrinho de compras"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-md animate-pulse">
                  {totalItems}
                </span>
              )}
            </button>

            {isLoading ? (
              <div className="h-8 w-20 animate-pulse rounded-lg bg-zinc-800" />
            ) : isAuthenticated && user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full border border-zinc-700 bg-zinc-800">
                    {avatarUrl ? (
                      <Link href="/profile">
                        <Image
                          src={avatarUrl}
                          alt={user.name || 'Utilizador'}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </Link>
                    ) : (
                      <Link href="/profile">
                        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-zinc-300">
                          {getUserInitials(user.name)}
                        </div>
                      </Link>
                    )}
                  </div>

                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-sm font-semibold text-zinc-100">{user.name || 'Utilizador'}</span>
                    <span className="text-xs text-red-400 capitalize">{user.role || 'client'}</span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-red-500 hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
                  title="Sair da conta"
                >
                  Sair
                </button>
              </div>
            ) : (
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

      <CartModal />
    </>
  );
}