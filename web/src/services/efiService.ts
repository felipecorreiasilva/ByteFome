// /src/services/efiService.ts

import api from './api';

export interface PixResponse {
    txid: string;
    qrcode: string;      // Base64 QR Code image
    pixCopiaECola: string; // Copy and Paste Pix string
}

export interface CreditCardPaymentPayload {
    orderId: number;
    paymentToken: string;
    billingAddress?: {
        street: string;
        number: string;
        neighborhood: string;
        zipcode: string;
        city: string;
        state: string;
    };
}

export interface DebitCardPaymentPayload {
    orderId: number;
    paymentToken: string;
    returnUrl?: string;
    billingAddress?: {
        street: string;
        number: string;
        neighborhood: string;
        zipcode: string;
        city: string;
        state: string;
    };
}

export const efiService = {
    /**
     * Requests the backend to generate a Pix charge and QR Code data for an order.
     * @param orderId Created order ID
     */
    async generatePixCharge(orderId: number): Promise<PixResponse> {
        try {
            const response = await api.post<PixResponse>('/efi/gerar-cobranca', { orderId });
            return response.data;
        } catch (error) {
            console.error('Error generating Pix charge:', error);
            throw error;
        }
    },

    /**
     * Sends the credit card payment token and order data to process the payment.
     */
    async payWithCreditCard(payload: CreditCardPaymentPayload) {
        try {
            const response = await api.post('/efi/pagar-cartao', payload);
            return response.data;
        } catch (error) {
            console.error('Error processing credit card payment:', error);
            throw error;
        }
    },

    /**
     * Sends the debit card payment token and order data to process the payment.
     */
    async payWithDebitCard(payload: DebitCardPaymentPayload) {
        try {
            const response = await api.post('/efi/pagar-debito', payload);
            return response.data;
        } catch (error) {
            console.error('Error processing debit card payment:', error);
            throw error;
        }
    }
};