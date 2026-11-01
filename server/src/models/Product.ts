import { pool } from '../config/db';

// Definição da interface (tipagem) para o Produto
export interface Product {
  id?: number;
  name: string;
  category: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available?: boolean;
  created_at?: Date;
}

// Classe responsável pelas consultas e manipulação de dados na tabela products
export class ProductModel {
  // 1. CREATE - Criar um novo produto
  static async create(product: Product): Promise<Product> {
    const { name, category, description, price, image_url, is_available = true } = product;
    
    const query = `
      INSERT INTO products (name, category, description, price, image_url, is_available)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    
    const values = [name, category, description, price, image_url, is_available];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // 2. READ (ALL) - Buscar todos os produtos do cardápio
  static async findAll(): Promise<Product[]> {
    const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
    return result.rows;
  }

  // 3. READ (BY ID) - Buscar um produto específico pelo ID
  static async findById(id: number): Promise<Product | null> {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  // 4. UPDATE - Atualizar os dados de um produto existente
  static async update(id: number, product: Partial<Product>): Promise<Product | null> {
    const { name, category, description, price, image_url, is_available } = product;
    
    const query = `
      UPDATE products 
      SET 
        name = COALESCE($1, name),
        category = COALESCE($2, category),
        description = COALESCE($3, description),
        price = COALESCE($4, price),
        image_url = COALESCE($5, image_url),
        is_available = COALESCE($6, is_available)
      WHERE id = $7
      RETURNING *;
    `;
    
    const values = [name, category, description, price, image_url, is_available, id];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  // 5. DELETE - Remover um produto pelo ID
  static async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM products WHERE id = $1', [id]);
    // Retorna true se alguma linha foi afetada (removida)
    return (result.rowCount ?? 0) > 0;
  }
}