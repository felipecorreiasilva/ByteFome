// /src/components/checkout/PaymentCreditOrDebitModal.tsx

'use client';

import React, { useState } from 'react';
import { efiService } from '@/services/efiService';
import { FiCreditCard, FiLock, FiX } from 'react-icons/fi';

interface PaymentCreditOrDebitModalProps {
    isOpen: boolean;
    orderId: number | null;
    totalAmount: number;
    onClose: () => void;
    onPaymentApproved: () => void;
}

export default function PaymentCreditOrDebitModal({
    isOpen,
    orderId,
    totalAmount,
    onClose,
    onPaymentApproved
}: PaymentCreditOrDebitModalProps) {
    const [activeTab, setActiveTab] = useState<'credit_card' | 'debit_card'>('credit_card');
    const [cardNumber, setCardNumber] = useState('');
    const [brand, setBrand] = useState('visa');
    const [expirationMonth, setExpirationMonth] = useState('');
    const [expirationYear, setExpirationYear] = useState('');
    const [cvv, setCvv] = useState('');
    const [holderName, setHolderName] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleGenerateTokenAndPay = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderId) {
            alert('ID do pedido não encontrado.');
            return;
        }

        const payeeCode = process.env.NEXT_PUBLIC_EFI_PAYEE_CODE;
        if (!payeeCode) {
            alert('Identificador de conta da Efí (Payee Code) não configurado no ambiente.');
            return;
        }

        setLoading(true);

        try {
            // Importação dinâmica do SDK estritamente dentro do browser para evitar "window is not defined"
            const EfiPay = (await import('payment-token-efi')).default;

            // 1. Gera o payment_token seguro utilizando o SDK da Efí no front-end
            const responseToken = await (EfiPay.CreditCard as any)
                .setAccount(payeeCode)
                .setEnvironment("sandbox") // Altera para "production" em produção
                .setData({
                    brand: brand,
                    number: cardNumber.replace(/\D/g, ''),
                    cvv: cvv,
                    expirationMonth: expirationMonth,
                    expirationYear: expirationYear
                })
                .getPaymentToken();

            const paymentToken = responseToken?.payment_token;

            if (!paymentToken) {
                throw new Error('Não foi possível gerar o token de segurança do cartão.');
            }

            // 2. Envia para o backend dependendo da aba ativa
            if (activeTab === 'credit_card') {
                await efiService.payWithCreditCard({
                    orderId,
                    paymentToken
                });
            } else {
                await efiService.payWithDebitCard({
                    orderId,
                    paymentToken,
                    returnUrl: `${window.location.origin}/orders/success`
                });
            }

            alert('Pagamento processado com sucesso!');
            onPaymentApproved();
        } catch (error: any) {
            console.error('Erro ao processar pagamento com cartão:', error);
            alert(error.response?.data?.error || error.message || 'Erro ao autorizar o pagamento com cartão.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-zinc-950 border border-red-500/30 w-full max-w-md rounded-3xl p-6 shadow-2xl relative text-white">
                <button 
                    onClick={onClose}
                    className="absolute top-5 right-5 text-zinc-400 hover:text-white cursor-pointer"
                >
                    <FiX size={22} />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-red-600/20 border border-red-500/40 rounded-2xl text-red-500">
                        <FiCreditCard size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Pagamento com Cartão</h2>
                        <p className="text-xs text-zinc-400">Total: R$ {totalAmount.toFixed(2).replace('.', ',')}</p>
                    </div>
                </div>

                {/* Abas para alternar entre Crédito e Débito */}
                <div className="grid grid-cols-2 gap-2 bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800 mb-6">
                    <button
                        type="button"
                        onClick={() => setActiveTab('credit_card')}
                        className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                            activeTab === 'credit_card'
                                ? 'bg-red-600 text-white shadow-md'
                                : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        Cartão de Crédito
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('debit_card')}
                        className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                            activeTab === 'debit_card'
                                ? 'bg-red-600 text-white shadow-md'
                                : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        Cartão de Débito
                    </button>
                </div>

                <form onSubmit={handleGenerateTokenAndPay} className="space-y-4">
                    <div>
                        <label className="block text-xs text-zinc-400 mb-1">Nome no Cartão</label>
                        <input
                            type="text"
                            value={holderName}
                            onChange={(e) => setHolderName(e.target.value)}
                            placeholder="Nome impresso no cartão"
                            autoComplete="cc-name"
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-zinc-400 mb-1">Número do Cartão</label>
                        <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="0000 0000 0000 0000"
                            maxLength={19}
                            autoComplete="cc-number"
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Mês</label>
                            <input
                                type="text"
                                value={expirationMonth}
                                onChange={(e) => setExpirationMonth(e.target.value)}
                                placeholder="MM"
                                maxLength={2}
                                autoComplete="cc-exp-month"
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 text-center"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Ano</label>
                            <input
                                type="text"
                                value={expirationYear}
                                onChange={(e) => setExpirationYear(e.target.value)}
                                placeholder="AAAA"
                                maxLength={4}
                                autoComplete="cc-exp-year"
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 text-center"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">CVV</label>
                            <input
                                type="password"
                                value={cvv}
                                onChange={(e) => setCvv(e.target.value)}
                                placeholder="123"
                                maxLength={4}
                                autoComplete="cc-csc"
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 text-center"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            <FiLock size={16} />
                            {loading ? 'A processar pagamento...' : `Pagar R$ ${totalAmount.toFixed(2).replace('.', ',')} (${activeTab === 'credit_card' ? 'Crédito' : 'Débito'})`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}