export interface UserAddress {
    id: number;
    user_id: number;
    cep: string;
    address: string;
    street_number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    is_default: boolean;
    created_at: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role: 'client' | 'admin' | 'delivery';
    image_url?: string;
    created_at: string;
    addresses?: UserAddress[];
}