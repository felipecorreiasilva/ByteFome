import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// 1. Interceptor de Requisição: Injeta automaticamente o token JWT se ele existir
api.interceptors.request.use(
    (config) => {
        // Verifica se estamos no browser antes de aceder ao localStorage
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('@ByteFome:token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 2. Interceptor de Resposta: Trata erros globais (como token expirado/inválido)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // VERIFICAÇÃO: Se o erro 401 NÃO veio da rota de login, aí sim redirecionamos
            const isLoginRoute = error.config?.url?.includes('/auth/login');

            if (!isLoginRoute && typeof window !== 'undefined') {
                localStorage.removeItem('@ByteFome:token');
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export default api;