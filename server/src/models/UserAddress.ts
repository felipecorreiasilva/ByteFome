import { pool } from '../config/db';

export interface UserAddress {
    id?: number;
    user_id: number;
    cep: string;
    address: string;
    street_number: string;
    complement?: string;
    neighborhood: string;
    city: string;       // Adicionado para a Efí Bank
    state: string;      // Adicionado para a Efí Bank
    is_default?: boolean;
}

export class UserAddressModel {
    // 1. Criar um único endereço
    static async create(addr: UserAddress): Promise<UserAddress> {
        const query = `
            INSERT INTO user_addresses (user_id, cep, address, street_number, complement, neighborhood, city, state, is_default)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *;
        `;
        const values = [
            addr.user_id,
            addr.cep,
            addr.address,
            addr.street_number,
            addr.complement || null,
            addr.neighborhood,
            addr.city,
            addr.state,
            addr.is_default || false
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // 2. Buscar todos os endereços de um utilizador
    static async findByUserId(user_id: number): Promise<UserAddress[]> {
        const result = await pool.query(
            'SELECT * FROM user_addresses WHERE user_id = $1 ORDER BY is_default DESC, id ASC',
            [user_id]
        );
        return result.rows;
    }

    // 3. Buscar um endereço específico pelo ID
    static async findById(id: number): Promise<UserAddress | null> {
        const result = await pool.query(
            'SELECT * FROM user_addresses WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    }

    // 4. Atualizar um endereço específico pelo ID
    static async update(id: number, addr: Partial<UserAddress>): Promise<UserAddress | null> {
        const query = `
            UPDATE user_addresses
            SET cep = COALESCE($1, cep),
                address = COALESCE($2, address),
                street_number = COALESCE($3, street_number),
                complement = COALESCE($4, complement),
                neighborhood = COALESCE($5, neighborhood),
                city = COALESCE($6, city),
                state = COALESCE($7, state),
                is_default = COALESCE($8, is_default)
            WHERE id = $9
            RETURNING *;
        `;
        const values = [
            addr.cep,
            addr.address,
            addr.street_number,
            addr.complement,
            addr.neighborhood,
            addr.city,
            addr.state,
            addr.is_default,
            id
        ];
        const result = await pool.query(query, values);
        return result.rows[0] || null;
    }

    // 5. Deletar um endereço específico pelo ID
    static async delete(id: number): Promise<boolean> {
        const result = await pool.query(
            'DELETE FROM user_addresses WHERE id = $1',
            [id]
        );
        return (result.rowCount ?? 0) > 0;
    }

    // 6. Deletar todos os endereços de um utilizador
    static async deleteByUserId(user_id: number): Promise<void> {
        await pool.query('DELETE FROM user_addresses WHERE user_id = $1', [user_id]);
    }

    // 7. Sincronizar endereços em lote (Remove os antigos e insere os novos numa transação segura)
    static async syncUserAddresses(user_id: number, addresses: UserAddress[]) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Apaga os endereços antigos do utilizador
            await client.query('DELETE FROM user_addresses WHERE user_id = $1', [user_id]);

            // Insere os novos endereços enviados
            for (const addr of addresses) {
                await client.query(
                    `INSERT INTO user_addresses (user_id, cep, address, street_number, complement, neighborhood, city, state, is_default)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                    [
                        user_id,
                        addr.cep,
                        addr.address,
                        addr.street_number,
                        addr.complement || null,
                        addr.neighborhood,
                        addr.city,
                        addr.state,
                        addr.is_default || false
                    ]
                );
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}