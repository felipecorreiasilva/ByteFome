'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { User } from '@/types/user';
import { authService, LoginCredentials, RegisterDTO } from '@/services/authService';
import { userService } from '@/services/userService';
import { tokenService } from '@/services/tokenService';

interface JwtPayload {
    id: number;
    email: string;
    role: string;
}

interface AuthContextData {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterDTO) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAndSetUser = async (token: string) => {
        try {
            const decoded = jwtDecode<JwtPayload>(token);
            if (decoded && decoded.id) {
                // Aqui utilizamos obrigatoriamente o teu userService com a rota /users/:id
                const fullUser = await userService.getUserById(decoded.id);
                setUser(fullUser);
            }
        } catch (error) {
            console.error('Erro ao buscar dados completos do utilizador:', error);
            tokenService.removeToken();
            setUser(null);
        }
    };

    useEffect(() => {
        const loadStoredData = async () => {
            try {
                const token = tokenService.getToken();
                if (token) {
                    await fetchAndSetUser(token);
                }
            } catch (error) {
                tokenService.removeToken();
            } finally {
                setIsLoading(false);
            }
        };

        loadStoredData();
    }, []);

    const login = async (credentials: LoginCredentials) => {
        setIsLoading(true);
        try {
            const token = await authService.login(credentials);
            tokenService.setToken(token); // Guarda primeiro para o Axios o apanhar
            await fetchAndSetUser(token); // Busca o user completo por ID instantaneamente
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (data: RegisterDTO) => {
        setIsLoading(true);
        try {
            const token = await authService.register(data);
            tokenService.setToken(token); // Guarda primeiro para o Axios o apanhar
            await fetchAndSetUser(token); // Busca o user completo por ID instantaneamente
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        tokenService.removeToken();
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextData {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
}