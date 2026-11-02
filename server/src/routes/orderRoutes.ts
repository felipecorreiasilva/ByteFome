// /routes/orderRoutes.ts

import { Router } from 'express';
import { orderController } from '../controllers/orderController';
import { verifyAuth } from '../middlewares/authMiddleware'; // Ajusta o caminho conforme a estrutura do teu projeto
import { verifyAdmin } from '../middlewares/adminMiddleware';

const router = Router();

// Todas as rotas abaixo exigem que o utilizador esteja autenticado (Bearer Token válido)
router.use(verifyAuth);

// 1. CREATE - Criar um novo pedido
router.post('/', orderController.create);

// 2. READ (LIST) - Listar todos os pedidos do utilizador logado
router.get('/', orderController.getMyOrders);

// 3. READ (DETAIL) - Obter os detalhes de um pedido específico pelo ID
router.get('/:id', orderController.getOrderById);

// 4. UPDATE STATUS - Atualizar o estado do pedido (ex: preparing, delivering, completed)
router.patch('/:id/status', verifyAdmin, orderController.updateOrderStatus);

// 5. DELETE / CANCEL - Cancelar/remover um pedido
router.delete('/:id', verifyAdmin, orderController.cancelOrder);

export default router;