export interface UserAddress {
    id: number;
    user_id: number;
    cep: string;
    address: string;
    street_number: string;
    complement?: string;
    neighborhood: string;
    is_default: boolean;
    created_at: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'client' | 'admin' | 'delivery';
    image_url?: string; // Adicionado aqui
    created_at: string;
    addresses?: UserAddress[];
}