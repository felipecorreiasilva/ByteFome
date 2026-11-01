import api from './api';

export interface AuthResponse {
    token: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterDTO {
    name: string;
    email: string;
    password: string;
    role?: 'client' | 'admin' | 'delivery';
}

export const authService = {
    async login(credentials: LoginCredentials): Promise<string> {
        const response = await api.post<AuthResponse>('/auth/login', credentials);

        // Guarda apenas o token
        localStorage.setItem('@ByteFome:token', response.data.token);
        return response.data.token;
    },

    async register(data: RegisterDTO): Promise<string> {
        const response = await api.post<AuthResponse>('/auth/register', data);

        // Guarda apenas o token
        localStorage.setItem('@ByteFome:token', response.data.token);
        return response.data.token;
    },

    logout() {
        localStorage.removeItem('@ByteFome:token');
    }
};