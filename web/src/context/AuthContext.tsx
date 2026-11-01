'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/user';
import { authService, LoginCredentials, RegisterDTO } from '@/services/authService';
import { tokenService } from '@/services/tokenService';

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

    // Ao carregar a aplicação, verifica se existe um token válido e recupera o utilizador
    useEffect(() => {
        const currentUser = tokenService.getUserFromToken();
        if (currentUser) {
            setUser(currentUser);
        }
        setIsLoading(false);
    }, []);

    const login = async (credentials: LoginCredentials) => {
        setIsLoading(true);
        try {
            
            const token = await authService.login(credentials);
            tokenService.setToken(token);
            
            const decodedUser = tokenService.getUserFromToken();
            setUser(decodedUser);
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (data: RegisterDTO) => {
        setIsLoading(true);
        try {
            const token = await authService.register(data);
            tokenService.setToken(token);
            
            const decodedUser = tokenService.getUserFromToken();
            setUser(decodedUser);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        tokenService.removeToken();
        setUser(null);
        window.location.href = '/login'; // Redireciona para o login de forma limpa
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