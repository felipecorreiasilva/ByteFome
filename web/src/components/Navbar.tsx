import Link from 'next/link';

export function Navbar() {
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
          <Link
            href="/login"
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500"
          >
            Entrar
          </Link>
        </div>
      </div>
    </header>
  );
}