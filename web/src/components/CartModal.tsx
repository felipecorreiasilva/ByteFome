'use client';

import React from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';

interface CartModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CartModal({ isOpen, onClose }: CartModalProps) {
    const { cart, addToCart, removeFromCart, clearCart, totalPrice } = useCart();

    if (!isOpen) return null;

    return (
        /* Removemos o fundo escuro (overlay) e permitimos cliques no resto da página */
        <div className="fixed inset-y-0 right-0 z-50 flex max-w-full pl-10 pointer-events-none">
            <div className="w-screen max-w-md bg-zinc-900 border-l border-zinc-800 text-white shadow-2xl flex flex-col justify-between h-full pointer-events-auto">
                
                {/* Cabeçalho */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-950/50">
                    <div className="flex items-center gap-2.5">
                        {/* Ícone de Carrinho */}
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-6 w-6 text-red-500" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
                            />
                        </svg>
                        <h2 className="text-xl font-bold tracking-tight">O seu Carrinho</h2>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {/* Lista de Itens */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {cart.length === 0 ? (
                        <div className="text-center py-20 text-zinc-500 font-medium">
                            O seu carrinho está vazio.
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.product.id} className="flex items-center justify-between gap-4 bg-zinc-950/60 p-3.5 rounded-2xl border border-zinc-800/80 shadow-md">
                                {item.product.image_url ? (
                                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-800">
                                        <Image
                                            src={item.product.image_url}
                                            alt={item.product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-16 w-16 shrink-0 rounded-xl bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-500 font-medium">
                                        Sem foto
                                    </div>
                                )}

                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm truncate text-zinc-100">{item.product.name}</h4>
                                    <p className="text-xs text-red-400 font-bold mt-1">
                                        R$ {Number(item.product.price).toFixed(2).replace('.', ',')}
                                    </p>
                                </div>

                                {/* Controles de Quantidade */}
                                <div className="flex items-center gap-2 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                                    <button
                                        onClick={() => removeFromCart(item.product.id)}
                                        className="h-7 w-7 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 hover:bg-zinc-700 transition cursor-pointer"
                                        title="Remover 1"
                                    >
                                        -
                                    </button>
                                    <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                                    <button
                                        onClick={() => addToCart(item.product)}
                                        className="h-7 w-7 rounded-lg bg-red-600 flex items-center justify-center text-white hover:bg-red-500 transition shadow-sm cursor-pointer"
                                        title="Adicionar mais"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Rodapé com Totais e Ações */}
                {cart.length > 0 && (
                    <div className="p-6 border-t border-zinc-800 bg-zinc-950/60 space-y-4">
                        <div className="flex items-center justify-between text-base font-bold">
                            <span className="text-zinc-400">Total do Pedido:</span>
                            <span className="text-red-500 text-xl font-extrabold">
                                R$ {totalPrice.toFixed(2).replace('.', ',')}
                            </span>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={clearCart}
                                className="flex-1 rounded-xl border border-zinc-700 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
                            >
                                Limpar
                            </button>
                            <button
                                onClick={() => {
                                    alert('A avançar para o checkout/finalização do pedido!');
                                    onClose();
                                }}
                                className="flex-2 rounded-xl bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-500 transition shadow-lg shadow-red-600/30 cursor-pointer"
                            >
                                Finalizar Pedido
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}