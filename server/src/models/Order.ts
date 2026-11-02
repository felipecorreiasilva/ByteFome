// /models/Order.ts

import { pool } from '../config/db'; // Ajusta o caminho conforme a tua configuração de conexão à base de dados

export interface OrderItemDTO {
    product_id: number;
    quantity: number;
    price: number;
}

export interface ShippingAddressDTO {
    cep: string;
    address: string;
    street_number: string;
    complement?: string;
    neighborhood: string;
}

export interface CreateOrderDTO {
    user_id: number;
    items: OrderItemDTO[];
    total: number;
    paymentMethod: 'pix' | 'credit_card' | 'debit_card' | 'cash';
    shippingAddress: ShippingAddressDTO;
}

export const OrderModel = {
    // 1. CREATE - Criar o pedido e os seus itens numa transação segura (BEGIN/COMMIT)
    async create(orderData: CreateOrderDTO) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Inserir o pedido principal na tabela 'orders' (Corrigido de 'total' para 'total_amount')
            const orderQuery = `
                INSERT INTO orders (
                    user_id, 
                    total_amount, 
                    payment_method, 
                    cep, 
                    address, 
                    street_number, 
                    complement, 
                    neighborhood, 
                    status
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
                RETURNING id, created_at;
            `;

            const orderValues = [
                orderData.user_id,
                orderData.total,
                orderData.paymentMethod,
                orderData.shippingAddress.cep,
                orderData.shippingAddress.address,
                orderData.shippingAddress.street_number,
                orderData.shippingAddress.complement || null,
                orderData.shippingAddress.neighborhood
            ];

            const orderResult = await client.query(orderQuery, orderValues);
            const orderId = orderResult.rows[0].id;

            // Inserir os itens do pedido na tabela 'order_items'
            for (const item of orderData.items) {
                const itemQuery = `
                    INSERT INTO order_items (order_id, product_id, quantity, price)
                    VALUES ($1, $2, $3, $4);
                `;
                const itemValues = [orderId, item.product_id, item.quantity, item.price];
                await client.query(itemQuery, itemValues);
            }

            await client.query('COMMIT');
            return { id: orderId, createdAt: orderResult.rows[0].created_at };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    // 2. READ (LIST BY USER) - Listar todos os pedidos de um utilizador específico com os respetivos itens agrupados
    async findByUserId(userId: number) {
        const query = `
            SELECT o.*, 
                   json_agg(json_build_object(
                       'product_id', oi.product_id,
                       'quantity', oi.quantity,
                       'price', oi.price
                   )) as items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.user_id = $1
            GROUP BY o.id
            ORDER BY o.created_at DESC;
        `;
        const result = await pool.query(query, [userId]);
        return result.rows;
    },

    // 3. READ (DETAIL BY ID) - Obter um pedido específico pelo ID com os respetivos itens
    async findById(orderId: number) {
        const query = `
            SELECT o.*, 
                   json_agg(json_build_object(
                       'product_id', oi.product_id,
                       'quantity', oi.quantity,
                       'price', oi.price
                   )) as items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.id = $1
            GROUP BY o.id;
        `;
        const result = await pool.query(query, [orderId]);
        return result.rows[0];
    },

    // 4. UPDATE STATUS - Atualizar o estado do pedido
    async updateStatus(orderId: number, status: string) {
        const query = `
            UPDATE orders 
            SET status = $1, updated_at = NOW() 
            WHERE id = $2 
            RETURNING *;
        `;
        const result = await pool.query(query, [status, orderId]);
        return result.rows[0];
    },

    // 5. DELETE / CANCEL - Remover o pedido e os seus itens correspondentes
    async delete(orderId: number) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // Remove primeiro os itens devido à restrição de chave estrangeira (FK)
            await client.query('DELETE FROM order_items WHERE order_id = $1', [orderId]);
            
            // Remove o pedido principal
            const result = await client.query('DELETE FROM orders WHERE id = $1 RETURNING *', [orderId]);
            
            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
};