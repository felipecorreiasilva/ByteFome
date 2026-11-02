// /services/orderService.ts

import api from './api';
import { CreateOrderDTO, Order, OrderStatus } from '@/types/order';

export const orderService = {
    // 1. CREATE - Cria um novo pedido enviando os itens, total, pagamento e morada
    async createOrder(data: CreateOrderDTO): Promise<Order> {
        const response = await api.post<Order>('/orders', data);
        return response.data;
    },

    // 2. READ (LIST) - Lista todos os pedidos do utilizador logado
    async getMyOrders(): Promise<Order[]> {
        const response = await api.get<Order[]>('/orders');
        return response.data;
    },

    // 3. READ (DETAIL) - Obtém os detalhes de um pedido específico pelo ID
    async getOrderById(id: number): Promise<Order> {
        const response = await api.get<Order>(`/orders/${id}`);
        return response.data;
    },

    // 4. UPDATE - Atualiza o estado de um pedido (ex: received -> preparing -> delivering -> completed)
    async updateOrderStatus(id: number, status: OrderStatus): Promise<Order> {
        const response = await api.patch<Order>(`/orders/${id}/status`, { status });
        return response.data;
    },

    // 5. DELETE / CANCEL - Cancela ou remove um pedido
    async cancelOrder(id: number): Promise<void> {
        await api.delete(`/orders/${id}`);
    }
};