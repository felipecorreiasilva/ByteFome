import api from './api';
import { User } from '@/types/user';

export const userService = {
    async getUserById(userId: number): Promise<User> {
        const response = await api.get<User>(`/users/${userId}`);
        return response.data;
    },

    async getAllUsers(): Promise<User[]> {
        const response = await api.get<User[]>('/users');
        return response.data;
    },

    async updateUser(userId: number, data: Partial<User>): Promise<User> {
        const response = await api.put<User>(`/users/${userId}`, data);
        return response.data;
    },

    async deleteUser(userId: number): Promise<void> {
        await api.delete(`/users/${userId}`);
    }
}