'use client';

import { useState, useEffect } from 'react';
import { ProductService } from '@/services/productService';
import { formatCurrency } from '@/utils/formatCurrency';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { CartModal } from '@/components/CartModal';
import { FiSearch, FiShoppingCart } from 'react-icons/fi';

export default function ClientProductsPage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const data = await ProductService.getAllProducts();
        setProducts(data.filter((product) => product.is_available));
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setIsCartOpen(true); // Abre o modal do carrinho imediatamente ao pedir
  };

  return (
    <div className="relative isolate min-h-screen w-full overflow-hidden bg-linear-to-b from-red-700 via-red-900 to-red-950 text-white selection:bg-black selection:text-white -mt-16 pt-24 pb-16">
      
      {/* Elemento decorativo de fundo (Glow effect) */}
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-20 pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="relative left-1/2 aspect-1155/678 w-145 -translate-x-1/2 rotate-30 bg-linear-to-tr from-red-500 to-rose-600 opacity-80 sm:left-[calc(50%-30rem)] sm:w-3xl"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Cabeçalho da Página */}
        <div className="text-center md:text-left mb-10">
          <span className="inline-flex items-center rounded-full bg-red-800/60 px-3.5 py-1 text-sm font-medium text-red-200 ring-1 ring-inset ring-red-400/40 mb-3">
            🍔 Cardápio Completo
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Escolha o seu preferido</h1>
          <p className="text-red-100 text-sm sm:text-base mt-2">Saboreie os melhores mini-foods preparados com rapidez e qualidade.</p>
        </div>

        {/* Barra de Pesquisa */}
        <div className="relative mb-10 max-w-xl">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input
            type="text"
            placeholder="Pesquisar mini-foods por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/40 backdrop-blur-md border border-red-500/30 rounded-xl pl-11 pr-4 py-3 text-white placeholder-zinc-400 focus:outline-none focus:border-white transition-colors shadow-inner"
          />
        </div>

        {/* Grelha de Produtos */}
        {loading ? (
          <div className="rounded-2xl border border-red-500/20 bg-black/40 backdrop-blur-md p-16 text-center text-red-200">
            A carregar cardápio...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-red-500/20 bg-black/40 backdrop-blur-md p-16 text-center text-red-200">
            Nenhum produto encontrado no momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="flex flex-col justify-between rounded-2xl border border-red-500/20 bg-black/60 backdrop-blur-md p-6 shadow-xl transition-all hover:border-white/60 hover:-translate-y-1"
              >
                <div>
                  {product.image_url ? (
                    <img
                      src={product.image_url.startsWith('http') ? product.image_url : `${API_URL}${product.image_url}`}
                      alt={product.name}
                      className="h-48 w-full rounded-xl object-cover mb-4 shadow-md border border-red-500/10"
                    />
                  ) : (
                    <div className="h-48 w-full rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-500 mb-4 text-sm font-medium border border-red-500/10">
                      Sem imagem
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-red-300 uppercase tracking-wider bg-red-950/60 px-3 py-1 rounded-full border border-red-800/40">
                      {product.category || 'Geral'}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white line-clamp-1 mt-1">
                    {product.name}
                  </h3>

                  {product.description && (
                    <p className="mt-2 text-sm text-red-100/80 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-between pt-4 border-t border-red-900/40">
                  <span className="text-xl font-extrabold text-white">
                    {formatCurrency(product.price)}
                  </span>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex items-center gap-2 rounded-xl bg-black hover:bg-zinc-900 px-4 py-2.5 text-xs font-bold text-white transition-all shadow-md shadow-black/40 hover:scale-105 cursor-pointer border border-red-500/30"
                  >
                    <FiShoppingCart size={16} />
                    Pedir Agora
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal do Carrinho Lateral */}
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}