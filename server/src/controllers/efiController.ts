// /controllers/efiController.ts

import { Request, Response } from 'express';
import efi from '../config/efi';
import { OrderModel } from '../models/Order';

export const efiController = {
    async gerarCobranca(req: Request, res: Response) {
        try {
            const { orderId } = req.body;

            if (!orderId) {
                return res.status(400).json({ error: 'O ID do pedido é obrigatório para gerar o Pix.' });
            }

            const order = await OrderModel.findById(Number(orderId));

            if (!order) {
                return res.status(404).json({ error: 'Pedido não encontrado.' });
            }

            const pixKey = process.env.EFI_PIX_KEY;
            if (!pixKey) {
                return res.status(500).json({ error: 'Chave Pix não configurada no servidor.' });
            }

            // Corpo tipado corretamente para satisfazer a SDK da Efí
            const body = {
                calendario: {
                    expiracao: 3600
                },
                valor: {
                    original: Number(order.total).toFixed(2)
                },
                chave: pixKey,
                solicitacaoPagador: `Pedido #${order.id} - ByteFome`
            };

            // 1. Cria a cobrança imediata
            const cobResponse = await efi.pixCreateImmediateCharge({}, body);
            const txid = cobResponse.txid;
            const locId = cobResponse.loc.id;

            // 2. Solicita o qrcode correspondente à loc gerada
            const qrcodeResponse = await efi.pixGenerateQRCode({ id: locId });

            return res.status(201).json({
                txid,
                qrcode: qrcodeResponse.imagenQrcode, 
                pixCopiaECola: qrcodeResponse.qrcode 
            });
        } catch (error: any) {
            console.error('Erro ao gerar cobrança Pix na Efí:', error?.data || error);
            return res.status(500).json({ error: 'Erro ao gerar pagamento Pix.' });
        }
    },

    async webhook(req: Request, res: Response) {
        try {
            const pixPagamentos = req.body.pix;

            if (pixPagamentos && pixPagamentos.length > 0) {
                for (const pagamento of pixPagamentos) {
                    const txid = pagamento.txid;
                    const valorPago = pagamento.valor;
                    console.log(`💰 Pix recebido! TXID: ${txid}, Valor: ${valorPago}`);
                }
            }

            return res.status(200).json({ received: true });
        } catch (error) {
            console.error('Erro ao processar webhook da Efí:', error);
            return res.status(500).json({ error: 'Erro interno no webhook.' });
        }
    },

    async configurarWebhook(req: Request, res: Response) {
        try {
            const { webhookUrl } = req.body;
            const pixKey = process.env.EFI_PIX_KEY;

            if (!webhookUrl || !pixKey) {
                return res.status(400).json({ error: 'A URL do webhook e a chave Pix são obrigatórias.' });
            }

            await efi.pixConfigWebhook({ chave: pixKey }, { webhookUrl });

            return res.status(200).json({ message: 'Webhook configurado com sucesso na Efí!' });
        } catch (error: any) {
            console.error('Erro ao configurar webhook:', error?.data || error);
            return res.status(500).json({ error: 'Erro ao registar webhook.' });
        }
    }
};