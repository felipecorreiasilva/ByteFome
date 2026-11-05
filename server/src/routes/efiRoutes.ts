// /routes/efiRoutes.ts

import { Router } from 'express';
import { efiController } from '../controllers/efiController';
import { verifyAuth } from '../middlewares/authMiddleware';
import { verifyAdmin } from '../middlewares/adminMiddleware';

const router = Router();

// 1. GERAR COBRANÇA PIX - Rota protegida onde o cliente autenticado gera o QR Code / Copia e Cola
router.post('/gerar-cobranca', verifyAuth, efiController.gerarCobranca);

// 2. PAGAMENTO COM CARTÃO DE CRÉDITO - Rota protegida para processar pagamento via crédito
router.post('/pagar-cartao', verifyAuth, efiController.gerarCobrancaCartao);

// 3. PAGAMENTO COM CARTÃO DE DÉBITO - Rota protegida para processar pagamento via débito
router.post('/pagar-debito', verifyAuth, efiController.gerarCobrancaDebito);

// 4. WEBHOOK - Rota pública (A Efí acede diretamente sem token JWT para notificar a confirmação do pagamento)
router.post('/webhook', efiController.webhook);

// 5. CONFIGURAR WEBHOOK - Rota restrita a administradores para registar a URL de notificação na Efí
router.post('/configurar-webhook', verifyAuth, verifyAdmin, efiController.configurarWebhook);

export default router;