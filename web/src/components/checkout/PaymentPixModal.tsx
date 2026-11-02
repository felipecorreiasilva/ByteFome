// /components/checkout/PaymentPixModal.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { FaPix, FaCopy, FaCheck, FaXmark } from 'react-icons/fa6';

interface PaymentPixModalProps {
    isOpen: boolean;
    totalAmount: number;
    onClose: () => void;
    onPaymentApproved?: () => void; // Chamado automaticamente quando o webhook confirmar
}

export default function PaymentPixModal({ isOpen, totalAmount, onClose, onPaymentApproved }: PaymentPixModalProps) {
    const [copied, setCopied] = useState(false);

    // Exemplo opcional de Polling (verifica o status do pagamento na tua API a cada 5 segundos)
    useEffect(() => {
        if (!isOpen) return;

        const checkPaymentStatus = async () => {
            try {
                // Exemplo: const response = await api.get(`/orders/check-status/${txid}`);
                // if (response.data.status === 'approved') {
                //     if (onPaymentApproved) onPaymentApproved();
                // }
            } catch (error) {
                console.error('Erro ao verificar status do pagamento:', error);
            }
        };

        const interval = setInterval(checkPaymentStatus, 5000);
        return () => clearInterval(interval);
    }, [isOpen, onPaymentApproved]);

    if (!isOpen) return null;

    // Código Pix Copia e Cola simulado (substituir depois pelo retorno da API da Efí Bank)
    const pixCopyPasteCode = "00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266141740005204000053039865802BR5925ByteFome Delivery Ltda6009Uberlandia62070503***63041D3A";

    const handleCopyPix = () => {
        navigator.clipboard.writeText(pixCopyPasteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
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
                        <FaPix className="w-3.5 h-3.5" /> Pagamento Pix
                    </span>
                    <h2 className="text-xl font-bold text-white">Escaneie o QR Code</h2>
                    <p className="text-xs text-zinc-400">
                        Total de <span className="text-white font-semibold">R$ {totalAmount.toFixed(2).replace('.', ',')}</span>. Abra o aplicativo do seu banco para pagar.
                    </p>
                </div>

                {/* QR Code */}
                <div className="bg-white p-4 rounded-2xl inline-block shadow-inner">
                    <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(pixCopyPasteCode)}`} 
                        alt="QR Code Pix" 
                        className="w-40 h-40 mx-auto"
                    />
                </div>

                <div className="space-y-2 text-left">
                    <p className="text-xs text-zinc-400 font-medium">Pix Copia e Cola:</p>
                    <div className="flex items-center gap-2 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                        <input 
                            type="text" 
                            readOnly 
                            value={pixCopyPasteCode} 
                            className="bg-transparent text-xs text-zinc-300 w-full focus:outline-none truncate"
                        />
                        <button 
                            onClick={handleCopyPix}
                            className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
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
                        Aguardando confirmação automática do pagamento...
                    </p>
                </div>

            </div>
        </div>
    );
}