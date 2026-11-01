import { jwtDecode } from 'jwt-decode';
import { User } from '@/types/user';

const TOKEN_KEY = '@ByteFome:token';

export const tokenService = {
    setToken(token: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(TOKEN_KEY, token);
        }
    },

    getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(TOKEN_KEY);
        }
        return null;
    },

    removeToken(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(TOKEN_KEY);
        }
    },

    getUserFromToken(): User | null {
        const token = this.getToken();
        if (!token) return null;

        try {
            const decoded = jwtDecode<User>(token);
            return decoded;
        } catch (error) {
            console.error('Token inválido ou expirado:', error);
            this.removeToken(); // Limpa o token corrompido
            return null;
        }
    }
};