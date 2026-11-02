// /types/order.ts

import { Product } from './product'; // Ajusta o caminho conforme o local onde tens a interface Product

export type PaymentMethod = 'pix' | 'credit_card' | 'debit_card' | 'cash';

export type OrderStatus = 'received' | 'preparing' | 'delivering' | 'completed';

export interface ShippingAddress {
    cep: string;
    address: string;
    street_number: string;
    complement?: string;
    neighborhood: string;
}

export interface OrderItem {
    id?: number;
    order_id?: number;
    product_id: number;
    quantity: number;
    price: number;
    product?: Product; // Opcional: caso o backend faça um JOIN para trazer os detalhes do produto
}

export interface Order {
    id: number;
    user_id: number;
    total_amount: number;
    payment_method: PaymentMethod;
    status: OrderStatus;
    cep: string;
    address: string;
    street_number: string;
    complement?: string;
    neighborhood: string;
    created_at: string;
    items?: OrderItem[];
}

export interface CreateOrderDTO {
    items: {
        product_id: number;
        quantity: number;
        price: number;
    }[];
    total: number;
    paymentMethod: PaymentMethod;
    shippingAddress: ShippingAddress;
}