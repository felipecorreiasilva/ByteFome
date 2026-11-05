// /controllers/efiController.ts

import { Request, Response } from 'express';
import efi from '../config/efi';
import { OrderModel } from '../models/Order';

export const efiController = {
    // ---------------------------------------------------------
    // 1. PIX
    // ---------------------------------------------------------
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

            const body = {
                calendario: {
                    expiracao: 3600
                },
                valor: {
                    original: Number(order.total_amount).toFixed(2)
                },
                chave: pixKey,
                solicitacaoPagador: `Pedido #${order.id} ByteFome`
            };

            const cobResponse = await efi.pixCreateImmediateCharge({}, body);
            const txid = cobResponse.txid;
            const locId = cobResponse.loc.id;

            const qrcodeResponse = await efi.pixGenerateQRCode({ id: locId });

            return res.status(201).json({
                txid,
                qrcode: qrcodeResponse.imagemQrcode,    
                pixCopiaECola: qrcodeResponse.qrcode      
            });
        } catch (error: any) {
            console.error('Erro ao gerar cobrança Pix na Efí:', error?.data || error);
            return res.status(500).json({ error: 'Erro ao gerar pagamento Pix.' });
        }
    },

    // ---------------------------------------------------------
    // 2. CARTÃO DE CRÉDITO
    // ---------------------------------------------------------
    async gerarCobrancaCartao(req: Request, res: Response) {
        try {
            const { orderId, paymentToken, billingAddress } = req.body;

            if (!orderId || !paymentToken) {
                return res.status(400).json({ error: 'O ID do pedido e o token do cartão são obrigatórios.' });
            }

            const order = await OrderModel.findById(Number(orderId));
            if (!order) {
                return res.status(404).json({ error: 'Pedido não encontrado.' });
            }

            const items = order.items.map((item: any) => ({
                name: `Produto #${item.product_id}`,
                value: Math.round(Number(item.price) * 100),
                amount: item.quantity
            }));

            const bodyCard = {
                items: items,
                payment: {
                    credit_card: {
                        payment_token: paymentToken,
                        billingAddress: billingAddress || {
                            street: order.address || "Rua Principal",
                            number: order.street_number || "123",
                            neighborhood: order.neighborhood || "Centro",
                            zipcode: order.cep || "38400000",
                            city: order.city || "Uberlândia",
                            state: order.state || "MG"      
                        }
                    }
                }
            };

            const response = await efi.createCharge({}, bodyCard as any);

            await OrderModel.updateStatus(order.id, 'paid');

            return res.status(200).json({
                success: true,
                message: 'Pagamento com cartão de crédito processado com sucesso!',
                data: response
            });

        } catch (error: any) {
            console.error('Erro ao processar pagamento com cartão na Efí:', error?.data || error);
            return res.status(500).json({ error: 'Erro ao processar pagamento com cartão.' });
        }
    },

    // ---------------------------------------------------------
    // 2.1. CARTÃO DE DÉBITO
    // ---------------------------------------------------------
    async gerarCobrancaDebito(req: Request, res: Response) {
        try {
            const { orderId, paymentToken, billingAddress, returnUrl } = req.body;

            if (!orderId || !paymentToken) {
                return res.status(400).json({ error: 'O ID do pedido e o token do cartão são obrigatórios.' });
            }

            const order = await OrderModel.findById(Number(orderId));
            if (!order) {
                return res.status(404).json({ error: 'Pedido não encontrado.' });
            }

            const items = order.items.map((item: any) => ({
                name: `Produto #${item.product_id}`,
                value: Math.round(Number(item.price) * 100),
                amount: item.quantity
            }));

            const bodyDebit = {
                items: items,
                payment: {
                    debit_card: {
                        payment_token: paymentToken,
                        return_url: returnUrl || "http://localhost:3000/checkout/sucesso",
                        billingAddress: billingAddress || {
                            street: order.address || "Rua Principal",
                            number: order.street_number || "123",
                            neighborhood: order.neighborhood || "Centro",
                            zipcode: order.cep || "38400000",
                            city: order.city || "Uberlândia",
                            state: order.state || "MG"
                        }
                    }
                }
            };

            const response = await efi.createCharge({}, bodyDebit as any);

            return res.status(200).json({
                success: true,
                message: 'Cobrança de débito gerada com sucesso!',
                data: response
            });

        } catch (error: any) {
            console.error('Erro ao processar pagamento com débito na Efí:', error?.data || error);
            return res.status(500).json({ error: 'Erro ao processar pagamento com cartão de débito.' });
        }
    },

    // ---------------------------------------------------------
    // 3. WEBHOOK PIX
    // ---------------------------------------------------------
    async webhook(req: Request, res: Response) {
        try {
            const pixPagamentos = req.body.pix;

            if (pixPagamentos && pixPagamentos.length > 0) {
                for (const pagamento of pixPagamentos) {
                    const txid = pagamento.txid;
                    const valorPago = pagamento.valor;
                    console.log(`💰 Pix recebido! TXID: ${txid}, Valor: ${valorPago}`);

                    if (txid) {
                        // 1. Procura o pedido pelo txid na base de dados
                        const order = await OrderModel.findByTxid(txid);

                        if (order) {
                            // 2. Atualiza automaticamente o status do pedido para 'preparing' (A preparar na cozinha)
                            await OrderModel.updateStatus(order.id, 'preparing');
                            console.log(`✅ Pedido #${order.id} atualizado para 'preparing' via Webhook Pix.`);
                        } else {
                            console.warn(`⚠️ Nenhum pedido encontrado para o TXID: ${txid}`);
                        }
                    }
                }
            }

            return res.status(200).json({ received: true });
        } catch (error) {
            console.error('Erro ao processar webhook da Efí:', error);
            return res.status(500).json({ error: 'Erro interno no webhook.' });
        }
    },

    // ---------------------------------------------------------
    // 4. CONFIGURAR WEBHOOK
    // ---------------------------------------------------------
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