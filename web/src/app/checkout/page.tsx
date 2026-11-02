'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { FaPix, FaCreditCard, FaMoneyBillWave } from 'react-icons/fa6';

export default function CheckoutPage() {
    const { cart, totalPrice, clearCart } = useCart();
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [cep, setCep] = useState('');
    const [address, setAddress] = useState('');
    const [streetNumber, setStreetNumber] = useState('');
    const [complement, setComplement] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    
    const [paymentMethod, setPaymentMethod] = useState('pix');
    const [loading, setLoading] = useState(false);
    const [fetchingCep, setFetchingCep] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true); // Estado para controlar o carregamento da verificação

    // Verificar se o utilizador está logado ao carregar a página
    useEffect(() => {
        const token = localStorage.getItem('token'); // Ou o método que usas para guardar a autenticação (ex: Contexto / Cookies)

        if (!token) {
            alert('Tens de fazer login para finalizar o pedido.');
            router.push('/login'); // Redireciona para a página de login
        } else {
            setCheckingAuth(false); // Liberta a página se estiver autenticado
        }
    }, [router]);

    // Enquanto verifica a autenticação, mostra um ecrã de carregamento limpo
    if (checkingAuth) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
                <p className="text-zinc-400 animate-pulse">A verificar autenticação...</p>
            </div>
        );
    }

    const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawCep = e.target.value.replace(/\D/g, '').slice(0, 8);
        setCep(rawCep);

        if (rawCep.length === 8) {
            try {
                setFetchingCep(true);
                const response = await axios.get(`https://viacep.com.br/ws/${rawCep}/json/`);
                const data = response.data;

                if (!data.erro) {
                    setAddress(data.logradouro || '');
                    setNeighborhood(data.bairro || '');
                } else {
                    alert('CEP não encontrado.');
                }
            } catch (error) {
                console.error('Erro ao buscar CEP:', error);
                alert('Erro ao consultar o CEP.');
            } finally {
                setFetchingCep(false);
            }
        }
    };

    const formatCepDisplay = (value: string) => {
        if (value.length > 5) {
            return `${value.slice(0, 5)}-${value.slice(5, 8)}`;
        }
        return value;
    };

    const handleNextStep = (e: React.FormEvent) => {
        e.preventDefault();

        if (!cep || !address || !streetNumber || !neighborhood) {
            alert('Por favor, preencha todos os campos obrigatórios da morada (CEP, Rua, Número e Bairro).');
            return;
        }

        setStep(2);
    };

    const handleFinishOrder = async () => {
        if (cart.length === 0) {
            alert('O seu carrinho está vazio.');
            return;
        }

        try {
            setLoading(true);

            const token = localStorage.getItem('token');

            const orderData = {
                items: cart,
                total: totalPrice,
                paymentMethod,
                shippingAddress: {
                    cep,
                    address,
                    street_number: streetNumber,
                    complement,
                    neighborhood
                }
            };

            // Exemplo com envio do token no header de autorização:
            // await axios.post('/api/orders', orderData, {
            //     headers: { Authorization: `Bearer ${token}` }
            // });

            alert('Pedido criado com sucesso!');
            clearCart();
            router.push('/orders/success'); 
        } catch (error) {
            console.error('Erro ao finalizar pedido:', error);
            alert('Ocorreu um erro ao processar o seu pedido.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-12">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Finalizar o seu Pedido</h1>

                <div className="flex items-center gap-4 mb-8 text-sm font-medium">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${step === 1 ? 'border-red-500 bg-red-500/10 text-red-400' : 'border-zinc-800 bg-zinc-900 text-zinc-400'}`}>
                        <span>1. Morada</span>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${step === 2 ? 'border-red-500 bg-red-500/10 text-red-400' : 'border-zinc-800 bg-zinc-900 text-zinc-400'}`}>
                        <span>2. Pagamento</span>
                    </div>
                </div>

                {step === 1 && (
                    <form onSubmit={handleNextStep} className="space-y-6">
                        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 space-y-4">
                            <h2 className="text-lg font-semibold text-zinc-200">Morada de Entrega</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-2">CEP *</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            maxLength={9}
                                            value={formatCepDisplay(cep)}
                                            onChange={handleCepChange}
                                            placeholder="Ex: 38413-675"
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-red-500"
                                            required
                                        />
                                        {fetchingCep && (
                                            <span className="absolute right-3 top-3.5 text-xs text-red-500 animate-pulse">
                                                A buscar...
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-zinc-400 mb-2">Bairro *</label>
                                    <input
                                        type="text"
                                        value={neighborhood}
                                        onChange={(e) => setNeighborhood(e.target.value)}
                                        placeholder="Ex: Centro"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-red-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm text-zinc-400 mb-2">Rua / Logradouro *</label>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Ex: Av. Afonso Pena"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-red-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-zinc-400 mb-2">Número *</label>
                                    <input
                                        type="text"
                                        value={streetNumber}
                                        onChange={(e) => setStreetNumber(e.target.value)}
                                        placeholder="Ex: 1000"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-red-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Complemento (Opcional)</label>
                                <input
                                    type="text"
                                    value={complement}
                                    onChange={(e) => setComplement(e.target.value)}
                                    placeholder="Ex: Apartamento 202, Bloco B"
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-red-500"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="rounded-xl bg-red-600 px-8 py-4 font-bold text-white hover:bg-red-500 transition shadow-lg shadow-red-600/30 cursor-pointer"
                            >
                                Continuar para Pagamento &rarr;
                            </button>
                        </div>
                    </form>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-zinc-200">Escolha o Método de Pagamento</h2>
                                <button 
                                    onClick={() => setStep(1)} 
                                    className="text-xs text-red-400 hover:underline cursor-pointer"
                                >
                                    Editar Morada
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div
                                    onClick={() => setPaymentMethod('pix')}
                                    className={`cursor-pointer flex flex-col items-center justify-center p-6 rounded-2xl border transition-all ${
                                        paymentMethod === 'pix'
                                            ? 'bg-red-500/10 border-red-500 text-white shadow-lg shadow-red-500/10'
                                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                                    }`}
                                >
                                    <FaPix className={`w-8 h-8 mb-3 ${paymentMethod === 'pix' ? 'text-red-500' : 'text-zinc-400'}`} />
                                    <span className="font-bold text-sm text-zinc-100">Pix</span>
                                    <span className="text-xs text-zinc-500 mt-1">Aprovação imediata</span>
                                </div>

                                <div
                                    onClick={() => setPaymentMethod('card')}
                                    className={`cursor-pointer flex flex-col items-center justify-center p-6 rounded-2xl border transition-all ${
                                        paymentMethod === 'card'
                                            ? 'bg-red-500/10 border-red-500 text-white shadow-lg shadow-red-500/10'
                                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                                    }`}
                                >
                                    <FaCreditCard className={`w-8 h-8 mb-3 ${paymentMethod === 'card' ? 'text-red-500' : 'text-zinc-400'}`} />
                                    <span className="font-bold text-sm text-zinc-100">Cartão</span>
                                    <span className="text-xs text-zinc-500 mt-1">Crédito ou Débito</span>
                                </div>

                                <div
                                    onClick={() => setPaymentMethod('cash')}
                                    className={`cursor-pointer flex flex-col items-center justify-center p-6 rounded-2xl border transition-all ${
                                        paymentMethod === 'cash'
                                            ? 'bg-red-500/10 border-red-500 text-white shadow-lg shadow-red-500/10'
                                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                                    }`}
                                >
                                    <FaMoneyBillWave className={`w-8 h-8 mb-3 ${paymentMethod === 'cash' ? 'text-red-500' : 'text-zinc-400'}`} />
                                    <span className="font-bold text-sm text-zinc-100">Dinheiro</span>
                                    <span className="text-xs text-zinc-500 mt-1">Com troco necessário</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-400">Total a pagar:</p>
                                <p className="text-2xl font-bold text-red-500">
                                    R$ {totalPrice.toFixed(2).replace('.', ',')}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleFinishOrder}
                                disabled={loading}
                                className="rounded-xl bg-red-600 px-8 py-4 font-bold text-white hover:bg-red-500 transition shadow-lg shadow-red-600/30 cursor-pointer disabled:opacity-50"
                            >
                                {loading ? 'A processar...' : 'Confirmar Pedido'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}