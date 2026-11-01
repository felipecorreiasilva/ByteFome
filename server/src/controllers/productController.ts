import type { Request, Response } from 'express';
import { ProductModel } from '../models/Product';

export class ProductController {
  // 1. GET - Listar todos os produtos
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const products = await ProductModel.findAll();
      res.status(200).json(products);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      res.status(500).json({ error: 'Erro interno no servidor ao buscar produtos.' });
    }
  }

  // 2. GET BY ID - Buscar um produto específico
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const product = await ProductModel.findById(id);

      if (!product) {
        res.status(404).json({ error: 'Produto não encontrado.' });
        return;
      }

      res.status(200).json(product);
    } catch (error) {
      console.error('Erro ao buscar produto por ID:', error);
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }

  // 3. POST - Criar um novo produto
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, category, description, price, image_url, is_available } = req.body;

      // Validação simples dos campos obrigatórios
      if (!name || !category || price === undefined) {
        res.status(400).json({ error: 'Os campos name, category e price são obrigatórios.' });
        return;
      }

      const newProduct = await ProductModel.create({
        name,
        category,
        description,
        price,
        image_url,
        is_available,
      });

      res.status(201).json(newProduct);
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      res.status(500).json({ error: 'Erro interno no servidor ao criar produto.' });
    }
  }

  // 4. PUT/PATCH - Atualizar um produto
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const { name, category, description, price, image_url, is_available } = req.body;

      const updatedProduct = await ProductModel.update(id, {
        name,
        category,
        description,
        price,
        image_url,
        is_available,
      });

      if (!updatedProduct) {
        res.status(404).json({ error: 'Produto não encontrado para atualização.' });
        return;
      }

      res.status(200).json(updatedProduct);
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      res.status(500).json({ error: 'Erro interno no servidor ao atualizar produto.' });
    }
  }

  // 5. DELETE - Remover um produto
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const deleted = await ProductModel.delete(id);

      if (!deleted) {
        res.status(404).json({ error: 'Produto não encontrado para exclusão.' });
        return;
      }

      res.status(200).json({ message: 'Produto removido com sucesso.' });
    } catch (error) {
      console.error('Erro ao remover produto:', error);
      res.status(500).json({ error: 'Erro interno no servidor ao remover produto.' });
    }
  }
}