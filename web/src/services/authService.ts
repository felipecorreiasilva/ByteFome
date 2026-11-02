import api from './api';
import { tokenService } from './tokenService';

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

        // Guarda o token utilizando o tokenService unificado
        tokenService.setToken(response.data.token);
        return response.data.token;
    },

    async register(data: RegisterDTO): Promise<string> {
        const response = await api.post<AuthResponse>('/auth/register', data);

        // Guarda o token utilizando o tokenService unificado
        tokenService.setToken(response.data.token);
        return response.data.token;
    },

    logout() {
        tokenService.removeToken();
    }
};