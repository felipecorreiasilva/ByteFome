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
    created_at?: string;
    addresses?: UserAddress[];
}

export class UserModel {

    static async getAll(): Promise<Omit<User, 'password_hash'>[]> {
        const result = await pool.query('SELECT * FROM users');
        
        // Mapeia cada utilizador removendo o password_hash
        return result.rows.map(user => {
            const { password_hash, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
    }

    static async findById(id: number): Promise<Omit<User, 'password_hash'> | null> {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        
        if (!result.rows[0]) {
            return null;
        }

        const { password_hash, ...userWithoutPassword } = result.rows[0];
        return userWithoutPassword;
    }

    static async findByEmail(email: string): Promise<User | null> {
        // Para o login, precisamos da password_hash, por isso retornamos a User completa
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0] || null;
    }

    static async create(data: Omit<User, 'id' | 'created_at'>): Promise<Omit<User, 'password_hash'>> {
        const { name, email, password_hash, role } = data;
        
        const query = `
            INSERT INTO users (name, email, password_hash, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, name, email, role, created_at;
        `;
        
        const values = [name, email, password_hash, role || 'client'];
        const result = await pool.query(query, values);
        
        return result.rows[0];
    }

    static async update(id: number, data: Partial<Omit<User, 'id' | 'password_hash' | 'created_at'>>): Promise<Omit<User, 'password_hash'> | null> {
        // Campos permitidos para atualização genérica
        const { name, email, role } = data;

        const query = `
            UPDATE users 
            SET name = COALESCE($1, name),
                email = COALESCE($2, email),
                role = COALESCE($3, role)
            WHERE id = $4
            RETURNING id, name, email, role, created_at;
        `;

        const values = [name, email, role, id];
        const result = await pool.query(query, values);

        return result.rows[0] || null;
    }

    static async delete(id: number): Promise<boolean> {
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
        return (result.rowCount ?? 0) > 0;
    }

}