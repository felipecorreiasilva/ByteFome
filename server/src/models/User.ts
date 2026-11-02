import { pool } from '../config/db';

export interface UserAddress {
    id?: number;
    user_id: number;
    cep: string;
    address: string;
    street_number: string;
    complement?: string;
    neighborhood: string;
    is_default?: boolean;
    created_at?: string;
}

export interface User {
    id?: number;
    name: string;
    email: string;
    password_hash: string;
    role: 'client' | 'admin' | 'delivery';
    image_url?: string; // Adicionado aqui
    created_at?: string;
    addresses?: UserAddress[];
}

export class UserModel {

    static async getAll(): Promise<Omit<User, 'password_hash'>[]> {
        const result = await pool.query('SELECT id, name, email, role, image_url, created_at FROM users');
        
        return result.rows.map(user => {
            const { password_hash, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
    }

    static async findById(id: number): Promise<Omit<User, 'password_hash'> | null> {
        const result = await pool.query('SELECT id, name, email, role, image_url, created_at FROM users WHERE id = $1', [id]);
        
        if (!result.rows[0]) {
            return null;
        }

        return result.rows[0];
    }

    static async findByEmail(email: string): Promise<User | null> {
        // Para o login, precisamos da password_hash, por isso selecionamos tudo
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0] || null;
    }

    static async create(data: Omit<User, 'id' | 'created_at'>): Promise<Omit<User, 'password_hash'>> {
        const { name, email, password_hash, role, image_url } = data;
        
        const query = `
            INSERT INTO users (name, email, password_hash, role, image_url)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, name, email, role, image_url, created_at;
        `;
        
        const values = [name, email, password_hash, role || 'client', image_url || null];
        const result = await pool.query(query, values);
        
        return result.rows[0];
    }

    static async update(id: number, data: Partial<Omit<User, 'id' | 'password_hash' | 'created_at'>>): Promise<Omit<User, 'password_hash'> | null> {
        const { name, email, role, image_url } = data;

        const query = `
            UPDATE users 
            SET name = COALESCE($1, name),
                email = COALESCE($2, email),
                role = COALESCE($3, role),
                image_url = COALESCE($4, image_url)
            WHERE id = $5
            RETURNING id, name, email, role, image_url, created_at;
        `;

        const values = [name, email, role, image_url, id];
        const result = await pool.query(query, values);

        return result.rows[0] || null;
    }

    static async delete(id: number): Promise<boolean> {
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
        return (result.rowCount ?? 0) > 0;
    }

}