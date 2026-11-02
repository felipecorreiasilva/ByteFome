// /controllers/orderController.ts

import { Request, Response } from 'express';
import { OrderModel } from '../models/Order';

export const orderController = {
    // 1. CREATE - Cria um novo pedido após validação e transação na base de dados
    async create(req: Request, res: Response) {
        try {
            // O user_id é injetado pelo middleware de autenticação (JWT)
            const userId = (req as any).user?.id;

            if (!userId) {
                return res.status(401).json({ error: 'Utilizador não autenticado.' });
            }

            const { items, total, paymentMethod, shippingAddress } = req.body;

            // Validação básica dos dados recebidos
            if (!items || items.length === 0 || !total || !paymentMethod || !shippingAddress) {
                return res.status(400).json({ error: 'Dados incompletos para criar o pedido.' });
            }

            const newOrder = await OrderModel.create({
                user_id: userId,
                items,
                total,
                paymentMethod,
                shippingAddress
            });

            return res.status(201).json(newOrder);
        } catch (error) {
            console.error('Erro ao criar pedido:', error);
            return res.status(500).json({ error: 'Erro interno ao processar o pedido.' });
        }
    },

    // 2. READ (LIST) - Lista todos os pedidos do utilizador autenticado
    async getMyOrders(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;

            if (!userId) {
                return res.status(401).json({ error: 'Utilizador não autenticado.' });
            }

            const orders = await OrderModel.findByUserId(userId);
            return res.status(200).json(orders);
        } catch (error) {
            console.error('Erro ao buscar pedidos do utilizador:', error);
            return res.status(500).json({ error: 'Erro ao listar pedidos.' });
        }
    },

    // 3. READ (DETAIL) - Obtém os detalhes de um pedido específico pelo ID
    async getOrderById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const order = await OrderModel.findById(Number(id));

            if (!order) {
                return res.status(404).json({ error: 'Pedido não encontrado.' });
            }

            return res.status(200).json(order);
        } catch (error) {
            console.error('Erro ao buscar detalhes do pedido:', error);
            return res.status(500).json({ error: 'Erro ao obter o pedido.' });
        }
    },

    // 4. UPDATE STATUS - Atualiza o estado operacional do pedido (ex: pending, received, preparing, delivering, completed)
    async updateOrderStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!status) {
                return res.status(400).json({ error: 'O novo estado (status) é obrigatório.' });
            }

            const updatedOrder = await OrderModel.updateStatus(Number(id), status);

            if (!updatedOrder) {
                return res.status(404).json({ error: 'Pedido não encontrado para atualização.' });
            }

            return res.status(200).json(updatedOrder);
        } catch (error) {
            console.error('Erro ao atualizar o estado do pedido:', error);
            return res.status(500).json({ error: 'Erro ao atualizar estado do pedido.' });
        }
    },

    // 5. DELETE / CANCEL - Remove o pedido e os seus itens correspondentes
    async cancelOrder(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const deletedOrder = await OrderModel.delete(Number(id));

            if (!deletedOrder) {
                return res.status(404).json({ error: 'Pedido não encontrado para cancelamento.' });
            }

            return res.status(204).send(); // Sucesso sem conteúdo (No Content)
        } catch (error) {
            console.error('Erro ao cancelar o pedido:', error);
            return res.status(500).json({ error: 'Erro ao cancelar pedido.' });
        }
    }
};