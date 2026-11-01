import { Product } from '@/types/product';
import api  from './api';

// Tipo auxiliar para criação (omite o id e permite campos opcionais parciais)
export type ProductInput = Omit<Product, 'id'>;

export const ProductService = {
    // 1. READ (ALL) - Buscar todos os produtos
    async getAllProducts(): Promise<Product[]> {
        const response = await api.get<Product[]>('/products');
        return response.data;
    },

    // 2. READ (ONE) - Buscar um produto por ID
    async getProductById(id: number): Promise<Product> {
        const response = await api.get<Product>(`/products/${id}`);
        return response.data;
    },

    // 3. CREATE - Criar um novo produto
    async createProduct(product: ProductInput): Promise<Product> {
        const response = await api.post<Product>('/products', product);
        return response.data;
    },

    // 4. UPDATE - Atualizar um produto existente
    async updateProduct(id: number, product: Partial<ProductInput>): Promise<Product> {
        const response = await api.put<Product>(`/products/${id}`, product);
        return response.data;
    },

    // 5. DELETE - Remover um produto
    async deleteProduct(id: number): Promise<void> {
        await api.delete(`/products/${id}`);
    }
};