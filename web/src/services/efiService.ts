// /src/services/efiService.ts

import api from './api';

export interface PixResponse {
    txid: string;
    qrcode: string;      // Imagem Base64 do QR Code
    pixCopiaECola: string; // String Copia e Cola
}

export const efiService = {
    /**
     * Solicita ao backend a geração da cobrança Pix e os dados do QR Code para um pedido.
     * @param orderId ID do pedido criado
     */
    async gerarCobrancaPix(orderId: number): Promise<PixResponse> {
        try {
            // Como o api.ts já injeta o Bearer Token automaticamente, 
            // basta fazer o POST com o body contendo o orderId
            const response = await api.post<PixResponse>('/efi/gerar-cobranca', { orderId });
            return response.data;
        } catch (error) {
            console.error('Erro ao gerar cobrança Pix:', error);
            throw error;
        }
    }
};