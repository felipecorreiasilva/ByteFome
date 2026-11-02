'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductService } from '@/services/productService';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';

export default function Home() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await ProductService.getAllProducts();
        setProducts(data);
      } catch (error) {
        console.error('Erro ao carregar produtos na landing page:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const featuredProducts = products.filter((product) => product.is_available);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative isolate min-h-screen w-full overflow-hidden bg-zinc-950 text-white selection:bg-red-600 selection:text-white -mt-16 pt-16">
      
      {/* Hero Section com Fundo Vermelho */}
      <div className="relative bg-linear-to-b from-red-700 via-red-900 to-red-950 pb-28">
        
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

        <section className="mx-auto max-w-7xl px-6 pt-16 pb-12 sm:pb-16 lg:flex lg:px-8 lg:py-20 items-center justify-between gap-12">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:shrink-0">
            <div className="mt-6 sm:mt-12 lg:mt-0">
              <span className="inline-flex items-center rounded-full bg-red-800/60 px-3.5 py-1 text-sm font-medium text-red-200 ring-1 ring-inset ring-red-400/40">
                🔥 O seu delivery favorito
              </span>
            </div>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl">
              A fome bateu? <br />
              <span className="text-white drop-shadow-md">ByteFome</span> resolve.
            </h1>
            <p className="mt-6 text-lg leading-8 text-red-100">
              Peça os melhores pratos com rapidez, acompanhe cada etapa em tempo real e desfrute de uma experiência gastronómica moderna. Seu algoritmo perfeito para matar a fome.
            </p>

            <div className="mt-10 flex items-center gap-x-6">
              <Link
                href="/products"
                className="rounded-xl bg-black px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-black/40 transition-all hover:bg-zinc-900 hover:scale-105"
              >
                Ver Cardápio Completo
              </Link>
              <Link
                href="/login"
                className="text-sm font-semibold leading-6 text-red-100 transition-colors hover:text-white flex items-center gap-1"
              >
                Área do Restaurante <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          {/* Logo Section */}
          <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:shrink-0 justify-center items-center">
            <div className="relative flex items-center justify-center p-4">
              <Image
                src="/logo.png"
                alt="ByteFome Logo"
                width={320}
                height={320}
                priority
                className="object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:scale-105"
              />
            </div>
          </div>
        </section>

        {/* Onda Suave e Perfeita em SVG */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none translate-y-px">
          <svg
            className="relative block w-full h-16 sm:h-24 lg:h-32"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path
              fill="#09090b"
              fillOpacity="1"
              d="M0,192L48,181.3C96,171,192,149,288,160C384,171,480,213,576,213.3C672,213,768,171,864,149.3C960,128,1056,128,1152,144C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>

      </div>

      {/* Seção de Produtos em Destaque (Fundo Zinc) */}
      <section className="bg-zinc-950 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-red-500">Delícias prontas para entrega</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
                Destaques do Cardápio
              </h2>
            </div>
            
            <Link
              href="/products"
              className="text-sm font-semibold text-red-400 hover:text-red-300 transition-colors"
            >
              Ver todos <span aria-hidden="true">→</span>
            </Link>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-12 text-center text-zinc-400">
              A carregar produtos em destaque...
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-12 text-center text-zinc-400">
              Nenhum produto disponível no cardápio neste momento.
            </div>
          ) : (
            <div className="relative flex items-center gap-4">
              
              {/* Seta Esquerda */}
              <button
                onClick={scrollLeft}
                className="hidden md:flex shrink-0 h-12 w-12 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-white hover:bg-red-600 hover:border-red-600 transition-all shadow-xl z-10"
                aria-label="Anterior"
              >
                ←
              </button>

              {/* Cards do Produto */}
              <div
                ref={scrollContainerRef}
                className="flex-1 flex overflow-x-auto pb-6 pt-2 gap-6 snap-x snap-mandatory scroll-smooth focus:outline-none"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {featuredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="min-w-70 sm:min-w-80 max-w-80 shrink-0 snap-start flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-xl transition-all hover:border-red-500/60 hover:-translate-y-1"
                  >
                    <div>
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-48 w-full rounded-xl object-cover mb-4 shadow-md"
                        />
                      ) : (
                        <div className="h-48 w-full rounded-xl bg-zinc-800/80 flex items-center justify-center text-zinc-500 mb-4 text-sm font-medium">
                          Sem imagem
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-red-400 uppercase tracking-wider bg-red-500/10 px-2.5 py-1 rounded-md border border-red-500/20">
                          {product.category}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white line-clamp-1">
                        {product.name}
                      </h3>

                      {product.description && (
                        <p className="mt-2 text-sm text-zinc-400 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-6 flex items-center justify-between pt-4 border-t border-zinc-800">
                      <span className="text-lg font-extrabold text-white">
                        R$ {Number(product.price).toFixed(2).replace('.', ',')}
                      </span>
                      <button
                      onClick={() => addToCart(product)}
                      className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-red-500 shadow-md shadow-red-600/30 cursor-pointer"
                    >
                      Pedir Agora
                    </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Seta Direita */}
              <button
                onClick={scrollRight}
                className="hidden md:flex shrink-0 h-12 w-12 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-white hover:bg-red-600 hover:border-red-600 transition-all shadow-xl z-10"
                aria-label="Seguinte"
              >
                →
              </button>

            </div>
          )}
        </div>
      </section>
    </div>
  );
}