// /app/checkout/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { orderService } from '@/services/orderService';
import { PaymentMethod } from '@/types/order';
import { UserAddress } from '@/types/user';
import PaymentPixModal from '@/components/checkout/PaymentPixModal';
import { AddressItemForm } from '@/components/AddressItemForm';
import { FaPix, FaCreditCard, FaMoneyBillWave } from 'react-icons/fa6';
import { FiPhone, FiMapPin, FiPlus, FiCheckCircle } from 'react-icons/fi';

export default function CheckoutPage() {
    const { cart, totalPrice, clearCart } = useCart();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [step, setStep] = useState(1);
    
    // Função de máscara visual para o telemóvel/WhatsApp
    const formatPhoneMask = (value: string) => {
        if (!value) return '';
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 2) return `(${numbers}`;
        if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
        if (numbers.length <= 11) {
            return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
        }
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    };

    const [phone, setPhone] = useState('');
    
    // Modos de seleção de endereço: 'list' (se tiver endereços) ou 'form' (se não tiver ou quiser criar novo)
    const [addressMode, setAddressMode] = useState<'list' | 'form'>('list');
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

    // Estado do novo endereço com valores estáticos seguros para SSR (evita erros de Date.now / new Date no Server Render)
    const [newAddress, setNewAddress] = useState<UserAddress>({
        id: 0,
        user_id: 1,
        cep: '',
        address: '',
        street_number: '',
        neighborhood: '',
        complement: '',
        is_default: false,
        created_at: ''
    });

    const [loadingCep, setLoadingCep] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
    const [loading, setLoading] = useState(false);

    // Estados do modal Pix
    const [showPixModal, setShowPixModal] = useState(false);
    const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            alert('Tens de fazer login para finalizar o pedido.');
            router.push('/login');
        }

        if (user) {
            if (user.phone) {
                setPhone(formatPhoneMask(user.phone));
            }

            if (user.addresses && user.addresses.length > 0) {
                setAddressMode('list');
                const defaultAddr = user.addresses.find(a => a.is_default) || user.addresses[0];
                setSelectedAddressId(defaultAddr.id);
            } else {
                setAddressMode('form');
            }

            // Atribui valores dinâmicos seguros no lado do cliente
            setNewAddress(prev => ({ 
                ...prev, 
                user_id: user.id || 1,
                id: Date.now(),
                created_at: new Date().toISOString()
            }));
        }
    }, [isAuthenticated, authLoading, router, user]);

    if (authLoading) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
                <p className="text-red-500 animate-pulse font-semibold">A verificar autenticação...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneMask(e.target.value);
        setPhone(formatted);
    };

    const handleNewAddressUpdate = (index: number, field: keyof UserAddress, value: any) => {
        setNewAddress(prev => ({ ...prev, [field]: value }));
    };

    const handleCheckoutCepBlur = async (index: number, cepValue: string) => {
        const cleanCep = cepValue.replace(/\D/g, '');
        if (cleanCep.length !== 8) return;

        setLoadingCep(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            const data = await response.json();

            if (!data.erro) {
                setNewAddress(prev => ({
                    ...prev,
                    cep: cleanCep,
                    address: data.logradouro || '',
                    neighborhood: data.bairro || '',
                }));
            } else {
                alert('CEP não encontrado.');
            }
        } catch (error) {
            console.error('Erro ao consultar CEP:', error);
            alert('Erro ao consultar o CEP.');
        } finally {
            setLoadingCep(false);
        }
    };

    const handleNextStep = (e: React.FormEvent) => {
        e.preventDefault();

        const cleanPhone = phone.replace(/\D/g, '');

        if (!cleanPhone || cleanPhone.length < 10) {
            alert('Por favor, insira um número de telemóvel/WhatsApp válido.');
            return;
        }

        if (addressMode === 'form') {
            if (!newAddress.cep || !newAddress.address || !newAddress.street_number || !newAddress.neighborhood) {
                alert('Por favor, preencha todos os campos obrigatórios da morada (CEP, Rua, Número e Bairro).');
                return;
            }
        } else {
            if (!selectedAddressId) {
                alert('Por favor, selecione um endereço de entrega.');
                return;
            }
        }

        setStep(2);
    };

    const handleFinishOrder = async () => {
        if (cart.length === 0) {
            alert('O seu carrinho está vazio.');
            return;
        }

        const cleanPhone = phone.replace(/\D/g, '');
        let shippingAddressPayload;

        if (addressMode === 'list' && user?.addresses) {
            const chosen = user.addresses.find(a => a.id === selectedAddressId);
            if (!chosen) {
                alert('Endereço selecionado inválido.');
                return;
            }
            shippingAddressPayload = {
                cep: chosen.cep,
                address: chosen.address,
                street_number: chosen.street_number,
                complement: chosen.complement || '',
                neighborhood: chosen.neighborhood
            };
        } else {
            shippingAddressPayload = {
                cep: newAddress.cep,
                address: newAddress.address,
                street_number: newAddress.street_number,
                complement: newAddress.complement || '',
                neighborhood: newAddress.neighborhood
            };
        }

        try {
            setLoading(true);

            const orderPayload = {
                items: cart.map(item => ({
                    product_id: item.product.id,
                    quantity: item.quantity,
                    price: Number(item.product.price)
                })),
                total: totalPrice,
                paymentMethod,
                phone: cleanPhone,
                shippingAddress: shippingAddressPayload
            };

            const response: any = await orderService.createOrder(orderPayload);
            const orderId = response.id || response.data?.id;

            if (!orderId) {
                throw new Error('ID do pedido não retornado pelo servidor.');
            }

            setCreatedOrderId(orderId);

            if (paymentMethod === 'pix') {
                setShowPixModal(true);
                setLoading(false);
                return;
            }

            alert('Pedido criado com sucesso!');
            clearCart();
            router.push('/orders/success'); 
        } catch (error: any) {
            console.error('Erro ao finalizar pedido:', error);
            const errorMessage = error.response?.data?.error || 'Ocorreu um erro ao processar o seu pedido.';
            alert(errorMessage);
        } finally {
            if (paymentMethod !== 'pix') {
                setLoading(false);
            }
        }
    };

    const handlePaymentApproved = () => {
        setShowPixModal(false);
        alert('Pagamento via Pix confirmado com sucesso!');
        clearCart();
        router.push('/orders/success');
    };

    return (
        <div className="min-h-screen bg-red-600 text-white p-6 md:p-12 relative">
            <div className="max-w-3xl mx-auto bg-zinc-950 p-8 rounded-3xl border border-red-500/30 shadow-2xl">
                <h1 className="text-3xl font-extrabold mb-6 text-white tracking-tight">Finalizar o seu Pedido</h1>

                <div className="flex items-center gap-4 mb-8 text-sm font-medium">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${step === 1 ? 'border-red-500 bg-red-600/20 text-red-400' : 'border-zinc-800 bg-zinc-900 text-zinc-400'}`}>
                        <span>1. Morada & Contacto</span>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${step === 2 ? 'border-red-500 bg-red-600/20 text-red-400' : 'border-zinc-800 bg-zinc-900 text-zinc-400'}`}>
                        <span>2. Pagamento</span>
                    </div>
                </div>

                {step === 1 && (
                    <form onSubmit={handleNextStep} className="space-y-6">
                        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 space-y-4">
                            <h2 className="text-lg font-semibold text-zinc-200">Informações de Contato e Entrega</h2>
                            
                            {/* Telemóvel / WhatsApp */}
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Telemóvel / WhatsApp *</label>
                                <div className="relative">
                                    <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500" size={18} />
                                    <input
                                        type="text"
                                        value={phone}
                                        onChange={handlePhoneChange}
                                        placeholder="(34) 99999-9999"
                                        maxLength={15}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-red-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Seleção de Endereço Cadastrado */}
                            {user?.addresses && user.addresses.length > 0 && (
                                <div className="pt-2">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="text-sm text-zinc-400">Escolha um Endereço Cadastrado *</label>
                                        {addressMode === 'list' ? (
                                            <button
                                                type="button"
                                                onClick={() => setAddressMode('form')}
                                                className="text-xs text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
                                            >
                                                <FiPlus size={14} /> Inserir Outro Endereço
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setAddressMode('list')}
                                                className="text-xs text-red-400 hover:underline cursor-pointer"
                                            >
                                                &larr; Usar Endereços Salvos
                                            </button>
                                        )}
                                    </div>

                                    {addressMode === 'list' ? (
                                        <div className="grid grid-cols-1 gap-3">
                                            {user.addresses.map((addr) => {
                                                const isSelected = selectedAddressId === addr.id;
                                                return (
                                                    <div
                                                        key={addr.id}
                                                        onClick={() => setSelectedAddressId(addr.id)}
                                                        className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                                                            isSelected
                                                                ? 'bg-red-600/20 border-red-500 text-white shadow-md'
                                                                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                                        }`}
                                                    >
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <FiMapPin className={isSelected ? 'text-red-500' : 'text-zinc-500'} />
                                                                <span className="font-semibold text-zinc-200">
                                                                    {addr.address}, {addr.street_number}
                                                                </span>
                                                                {addr.is_default && (
                                                                    <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full uppercase font-bold">Principal</span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-zinc-400 pl-6">
                                                                Bairro: {addr.neighborhood} {addr.complement ? `| ${addr.complement}` : ''} | CEP: {addr.cep}
                                                            </p>
                                                        </div>
                                                        {isSelected && <FiCheckCircle className="text-red-500 shrink-0 mt-1" size={18} />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : null}
                                </div>
                            )}

                            {/* Formulário com AddressItemForm */}
                            {addressMode === 'form' && (
                                <div className="space-y-4 pt-2 border-t border-zinc-800">
                                    <h3 className="text-sm font-semibold text-zinc-300">Nova Morada de Entrega</h3>
                                    <AddressItemForm
                                        address={newAddress}
                                        index={0}
                                        totalAddresses={user?.addresses?.length || 1}
                                        loadingCep={loadingCep}
                                        onUpdate={handleNewAddressUpdate}
                                        onCepBlur={handleCheckoutCepBlur}
                                        onRemove={() => setAddressMode('list')}
                                    />
                                </div>
                            )}
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
                                    Editar Morada & Contacto
                                </button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div
                                    onClick={() => setPaymentMethod('pix')}
                                    className={`cursor-pointer flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                                        paymentMethod === 'pix'
                                            ? 'bg-red-600/20 border-red-500 text-white shadow-lg shadow-red-500/10'
                                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                                    }`}
                                >
                                    <FaPix className={`w-7 h-7 mb-2 ${paymentMethod === 'pix' ? 'text-red-500' : 'text-zinc-400'}`} />
                                    <span className="font-bold text-sm text-zinc-100">Pix</span>
                                    <span className="text-[10px] text-zinc-500 mt-1">Imediato</span>
                                </div>

                                <div
                                    onClick={() => setPaymentMethod('credit_card')}
                                    className={`cursor-pointer flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                                        paymentMethod === 'credit_card'
                                            ? 'bg-red-600/20 border-red-500 text-white shadow-lg shadow-red-500/10'
                                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                                    }`}
                                >
                                    <FaCreditCard className={`w-7 h-7 mb-2 ${paymentMethod === 'credit_card' ? 'text-red-500' : 'text-zinc-400'}`} />
                                    <span className="font-bold text-sm text-zinc-100">Crédito</span>
                                    <span className="text-[10px] text-zinc-500 mt-1">Cartão de Crédito</span>
                                </div>

                                <div
                                    onClick={() => setPaymentMethod('debit_card')}
                                    className={`cursor-pointer flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                                        paymentMethod === 'debit_card'
                                            ? 'bg-red-600/20 border-red-500 text-white shadow-lg shadow-red-500/10'
                                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                                    }`}
                                >
                                    <FaCreditCard className={`w-7 h-7 mb-2 ${paymentMethod === 'debit_card' ? 'text-red-500' : 'text-zinc-400'}`} />
                                    <span className="font-bold text-sm text-zinc-100">Débito</span>
                                    <span className="text-[10px] text-zinc-500 mt-1">Cartão de Débito</span>
                                </div>

                                <div
                                    onClick={() => setPaymentMethod('cash')}
                                    className={`cursor-pointer flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                                        paymentMethod === 'cash'
                                            ? 'bg-red-600/20 border-red-500 text-white shadow-lg shadow-red-500/10'
                                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                                    }`}
                                >
                                    <FaMoneyBillWave className={`w-7 h-7 mb-2 ${paymentMethod === 'cash' ? 'text-red-500' : 'text-zinc-400'}`} />
                                    <span className="font-bold text-sm text-zinc-100">Dinheiro</span>
                                    <span className="text-[10px] text-zinc-500 mt-1">Com troco</span>
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

            <PaymentPixModal 
                isOpen={showPixModal}
                orderId={createdOrderId}
                totalAmount={totalPrice}
                onClose={() => setShowPixModal(false)}
                onPaymentApproved={handlePaymentApproved}
            />
        </div>
    );
}