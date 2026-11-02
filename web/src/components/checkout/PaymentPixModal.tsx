// /components/checkout/PaymentPixModal.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { FaPix, FaCopy, FaCheck, FaXmark } from 'react-icons/fa6';
import { efiService } from '@/services/efiService';
import { orderService } from '@/services/orderService';

interface PaymentPixModalProps {
    isOpen: boolean;
    orderId: number | null; // Agora precisamos do ID real do pedido para gerar a cobrança
    totalAmount: number;
    onClose: () => void;
    onPaymentApproved?: () => void;
}

export default function PaymentPixModal({ isOpen, orderId, totalAmount, onClose, onPaymentApproved }: PaymentPixModalProps) {
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Estados para armazenar os dados dinâmicos vindos da Efí Bank
    const [pixCopyPaste, setPixCopyPaste] = useState('');
    const [qrCodeImage, setQrCodeImage] = useState('');

    // Efeito para requisitar a cobrança Pix ao backend assim que o modal abre
    useEffect(() => {
        if (!isOpen || !orderId) return;

        let isMounted = true;

        const fetchPixCharge = async () => {
            try {
                setLoading(true);
                setError(null);

                // Chama o backend através do efiService
                const data = await efiService.gerarCobrancaPix(orderId);

                if (isMounted && data) {
                    setPixCopyPaste(data.pixCopiaECola || '');
                    
                    // Tratamento seguro para evitar erros caso data.qrcode venha indefinido
                    const qrCodeRaw = data.qrcode || '';
                    const qrImageSrc = qrCodeRaw.startsWith('data:image') 
                        ? qrCodeRaw 
                        : qrCodeRaw ? `data:image/png;base64,${qrCodeRaw}` : '';
                    
                    setQrCodeImage(qrImageSrc);
                }
            } catch (err: any) {
                if (isMounted) {
                    setError('Não foi possível gerar o QR Code Pix. Tente novamente.');
                    console.error(err);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchPixCharge();

        return () => {
            isMounted = false;
        };
    }, [isOpen, orderId]);

    // Efeito de Polling para verificar se o pagamento foi confirmado
    useEffect(() => {
        if (!isOpen || !orderId) return;

        const checkPaymentStatus = async () => {
            try {
                const response = await orderService.getOrderById(orderId);
                
                // Utiliza o status correto definido no teu tipo OrderStatus (ex: 'completed', 'approved' ou 'paid')
                if (response && response.status === 'completed') { 
                    if (onPaymentApproved) {
                        onPaymentApproved();
                    }
                }
            } catch (err) {
                console.error('Erro ao verificar status do pedido:', err);
            }
        };

        const interval = setInterval(checkPaymentStatus, 5000);
        return () => clearInterval(interval);
    }, [isOpen, orderId, onPaymentApproved]);

    if (!isOpen) return null;

    const handleCopyPix = () => {
        if (!pixCopyPaste) return;
        navigator.clipboard.writeText(pixCopyPaste);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 border border-zinc-800 p-6 md:p-8 rounded-3xl max-w-md w-full text-center space-y-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                
                {/* Botão X para fechar o modal */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 p-2 rounded-full transition cursor-pointer"
                    aria-label="Fechar"
                >
                    <FaXmark className="w-4 h-4" />
                </button>

                <div className="space-y-2 pt-2">
                    <span className="bg-red-500/10 text-red-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
                        <FaPix className="w-3.5 h-3.5" /> Pagamento Pix Efí
                    </span>
                    <h2 className="text-xl font-bold text-white">Escaneie o QR Code</h2>
                    <p className="text-xs text-zinc-400">
                        Total de <span className="text-white font-semibold">R$ {totalAmount.toFixed(2).replace('.', ',')}</span>. Abra o aplicativo do seu banco para pagar.
                    </p>
                </div>

                {/* Conteúdo dinâmico: Loading, Erro ou QR Code */}
                <div className="flex flex-col items-center justify-center min-h-45">
                    {loading ? (
                        <div className="space-y-3 py-6">
                            <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="text-xs text-zinc-400">A gerar cobrança Pix segura...</p>
                        </div>
                    ) : error ? (
                        <div className="text-red-400 text-xs p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                            {error}
                        </div>
                    ) : (
                        <>
                            {/* QR Code dinâmico gerado pela Efí */}
                            <div className="bg-white p-4 rounded-2xl inline-block shadow-inner">
                                {qrCodeImage ? (
                                    <img 
                                        src={qrCodeImage} 
                                        alt="QR Code Pix Dinâmico" 
                                        className="w-40 h-40 mx-auto object-contain"
                                    />
                                ) : (
                                    <div className="w-40 h-40 bg-zinc-200 flex items-center justify-center text-zinc-500 text-xs">
                                        Sem imagem
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Copia e Cola */}
                <div className="space-y-2 text-left">
                    <p className="text-xs text-zinc-400 font-medium">Pix Copia e Cola:</p>
                    <div className="flex items-center gap-2 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                        <input 
                            type="text" 
                            readOnly 
                            value={pixCopyPaste} 
                            placeholder={loading ? "A gerar código..." : "Chave pix indisponível"}
                            className="bg-transparent text-xs text-zinc-300 w-full focus:outline-none truncate"
                        />
                        <button 
                            onClick={handleCopyPix}
                            disabled={loading || !pixCopyPaste}
                            className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                            {copied ? <FaCheck className="w-3 h-3" /> : <FaCopy className="w-3 h-3" />}
                            {copied ? 'Copiado!' : 'Copiar'}
                        </button>
                    </div>
                </div>

                {/* Aviso de deteção automática via Webhook */}
                <div className="bg-zinc-950/60 border border-zinc-800/80 p-3 rounded-xl flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                    <p className="text-xs text-zinc-400">
                        Aguardando confirmação automática do pagamento via webhook...
                    </p>
                </div>

            </div>
        </div>
    );
}