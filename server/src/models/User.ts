import { pool } from '../config/db';
import { UserAddressModel, UserAddress } from './UserAddress'; // Importa o model de endereços

export interface User {
    id?: number;
    name: string;
    email: string;
    password_hash: string;
    role: 'client' | 'admin' | 'delivery';
    image_url?: string;
    phone?: string;
    created_at?: string;
    addresses?: UserAddress[];
}

export class UserModel {

    static async getAll(): Promise<Omit<User, 'password_hash'>[]> {
        const result = await pool.query('SELECT id, name, email, role, image_url, phone, created_at FROM users');
        
        // Busca os endereços para cada utilizador listado
        const usersWithAddresses = await Promise.all(
            result.rows.map(async (user) => {
                const { password_hash, ...userWithoutPassword } = user;
                const addresses = await UserAddressModel.findByUserId(user.id);
                return {
                    ...userWithoutPassword,
                    addresses
                };
            })
        );

        return usersWithAddresses;
    }

    static async findById(id: number): Promise<Omit<User, 'password_hash'> | null> {
        const result = await pool.query('SELECT id, name, email, role, image_url, phone, created_at FROM users WHERE id = $1', [id]);
        
        if (!result.rows[0]) {
            return null;
        }

        const user = result.rows[0];
        // Busca os endereços associados a este utilizador
        const addresses = await UserAddressModel.findByUserId(id);

        return {
            ...user,
            addresses
        };
    }

    static async findByEmail(email: string): Promise<User | null> {
        // Para o login, precisamos da password_hash, por isso selecionamos tudo
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (!result.rows[0]) return null;

        const user = result.rows[0];
        const addresses = await UserAddressModel.findByUserId(user.id);

        return {
            ...user,
            addresses
        };
    }

    static async create(data: Omit<User, 'id' | 'created_at'>): Promise<Omit<User, 'password_hash'>> {
        const { name, email, password_hash, role, image_url, phone, addresses } = data;
        
        const query = `
            INSERT INTO users (name, email, password_hash, role, image_url, phone)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, name, email, role, image_url, phone, created_at;
        `;
        
        const values = [name, email, password_hash, role || 'client', image_url || null, phone || null];
        const result = await pool.query(query, values);
        const newUser = result.rows[0];

        // Se foram enviados endereços no registo, guarda-os
        if (addresses && addresses.length > 0) {
            await UserAddressModel.syncUserAddresses(newUser.id, addresses);
        }

        const savedAddresses = await UserAddressModel.findByUserId(newUser.id);

        return {
            ...newUser,
            addresses: savedAddresses
        };
    }

    static async update(id: number, data: Partial<User>): Promise<Omit<User, 'password_hash'> | null> {
        const { name, email, role, image_url, phone, addresses } = data;

        const query = `
            UPDATE users 
            SET name = COALESCE($1, name),
                email = COALESCE($2, email),
                role = COALESCE($3, role),
                image_url = COALESCE($4, image_url),
                phone = COALESCE($5, phone)
            WHERE id = $6
            RETURNING id, name, email, role, image_url, phone, created_at;
        `;

        const values = [name, email, role, image_url, phone, id];
        const result = await pool.query(query, values);

        if (!result.rows[0]) {
            return null;
        }

        const updatedUser = result.rows[0];

        // Se os endereços foram enviados na atualização, sincroniza-os na tabela user_addresses
        if (addresses) {
            await UserAddressModel.syncUserAddresses(id, addresses);
        }

        const currentAddresses = await UserAddressModel.findByUserId(id);

        return {
            ...updatedUser,
            addresses: currentAddresses
        };
    }

    static async delete(id: number): Promise<boolean> {
        // Remove primeiro os endereços associados para evitar conflitos de chave estrangeira
        await UserAddressModel.deleteByUserId(id);
        
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
        return (result.rowCount ?? 0) > 0;
    }

}