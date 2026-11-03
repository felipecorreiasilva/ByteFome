'use client';

import { useState, useEffect } from 'react';
import { ProductService } from '@/services/productService';
import { formatCurrency } from '@/utils/formatCurrency';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import { Product } from '@/types/product';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      const data = await ProductService.getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (confirm('Tens a certeza que desejas remover este produto?')) {
      try {
        await ProductService.deleteProduct(id);
        setProducts(products.filter((p) => p.id !== id));
      } catch (error) {
        console.error('Erro ao eliminar produto:', error);
      }
    }
  }

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <span className="inline-flex items-center rounded-full bg-red-800/60 px-3.5 py-1 text-sm font-medium text-red-200 ring-1 ring-inset ring-red-400/40 mb-3">
              📋 Gestão de Catálogo (Admin)
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">Gerenciamento de Cardápio</h1>
            <p className="text-red-100 text-sm mt-1">Adicione, edite ou remova os mini-foods disponíveis na plataforma.</p>
          </div>
          <button
            onClick={() => alert('Abrir modal de criação de produto')}
            className="flex items-center justify-center gap-2 bg-black hover:bg-zinc-900 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-xl shadow-black/30 hover:scale-105 cursor-pointer"
          >
            <FiPlus size={18} />
            Novo Produto
          </button>
        </div>

        {/* Barra de Pesquisa */}
        <div className="relative mb-6">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input
            type="text"
            placeholder="Pesquisar mini-foods por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/40 backdrop-blur-md border border-red-500/30 rounded-xl pl-11 pr-4 py-3 text-white placeholder-zinc-400 focus:outline-none focus:border-white transition-colors shadow-inner"
          />
        </div>

        {/* Tabela / Lista de Produtos */}
        <div className="bg-black/60 backdrop-blur-md border border-red-500/20 rounded-2xl overflow-hidden shadow-2xl">
          {loading ? (
            <div className="p-12 text-center text-red-200">A carregar produtos...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-red-200">Nenhum produto encontrado.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-red-900/40 text-red-200 text-xs uppercase tracking-wider bg-black/40">
                    <th className="py-4 px-5">Produto</th>
                    <th className="py-4 px-5">Categoria</th>
                    <th className="py-4 px-5">Preço</th>
                    <th className="py-4 px-5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-950/60 text-sm">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-red-950/30 transition-colors">
                      <td className="py-4 px-5 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-zinc-900 overflow-hidden shrink-0 border border-red-500/20 shadow-md">
                          {product.image_url ? (
                            <img
                              src={product.image_url.startsWith('http') ? product.image_url : `http://localhost:3333${product.image_url}`}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs">Sem foto</div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white">{product.name}</p>
                          <p className="text-xs text-red-200/80 line-clamp-1">{product.description}</p>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-red-100">
                        <span className="bg-red-950/60 px-3 py-1 rounded-full text-xs text-red-200 border border-red-800/40 font-medium">
                          {product.category || 'Geral'}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-bold text-white">{formatCurrency(product.price)}</td>
                      <td className="py-4 px-5 text-right space-x-2">
                        <button
                          onClick={() => alert(`Editar produto ${product.id}`)}
                          className="p-2.5 bg-black/40 hover:bg-black text-red-200 rounded-xl transition-colors inline-flex items-center border border-red-500/20 shadow-sm cursor-pointer"
                          title="Editar"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2.5 bg-red-950/60 hover:bg-red-900 text-red-300 rounded-xl transition-colors inline-flex items-center border border-red-900/50 shadow-sm cursor-pointer"
                          title="Eliminar"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}