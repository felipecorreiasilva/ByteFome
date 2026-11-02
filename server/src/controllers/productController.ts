import type { Request, Response } from 'express';
import { ProductModel } from '../models/Product';
import fs from 'fs/promises';
import path from 'path';

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
          const { name, category, description, price, is_available } = req.body;

          // Validação simples dos campos obrigatórios
          if (!name || !category || price === undefined) {
              res.status(400).json({ error: 'Os campos name, category e price são obrigatórios.' });
              return;
          }

          // Tratamento da Imagem do Produto via Multer
          let image_url = req.body.image_url;
          if (req.file) {
              // Define o caminho relativo para o ficheiro guardado pelo uploadProduct middleware
              image_url = `/uploads/products/${req.file.filename}`;
          }

          const newProduct = await ProductModel.create({
              name,
              category,
              description,
              price,
              image_url, // Guarda o caminho da imagem gerado ou enviado
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
      const { name, category, description, price, is_available } = req.body;

      // 1. Buscar o produto atual na BD para verificar se já tem uma imagem antiga
      const existingProduct = await ProductModel.findById(id);
      if (!existingProduct) {
        res.status(404).json({ error: 'Produto não encontrado.' });
        return;
      }

      // 2. Tratamento da Nova Imagem do Produto via Multer
      let image_url = req.body.image_url; // Mantém o valor anterior caso venha por texto ou não seja alterada
      
      if (req.file) {
        // Se um novo ficheiro foi enviado, define o novo caminho relativo
        image_url = `/uploads/products/${req.file.filename}`;

        // Se o produto já tinha uma imagem anterior gravada, removemos o ficheiro antigo do disco
        if (existingProduct.image_url) {
          try {
            const oldFilePath = path.join(process.cwd(), existingProduct.image_url);
            await fs.unlink(oldFilePath);
            console.log(`Imagem antiga do produto removida com sucesso: ${oldFilePath}`);
          } catch (fileError) {
            console.warn('Aviso: O ficheiro de imagem antigo do produto não foi encontrado no disco para exclusão.', fileError);
          }
        }
      }

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

      // 1. Opcional mas recomendado: Buscar o produto antes para obter o caminho da imagem
      const product = await ProductModel.findById(id);

      // 2. Executar a exclusão na base de dados
      const deleted = await ProductModel.delete(id);

      if (!deleted) {
        res.status(404).json({ error: 'Produto não encontrado para exclusão.' });
        return;
      }

      // 3. Se o produto tinha uma imagem associada no servidor, remove o ficheiro físico
      if (product && product.image_url) {
        try {
          // product.image_url vem como algo do tipo: "/uploads/products/nome-do-arquivo.jpg"
          // Convertemos para o caminho absoluto no disco do sistema
          const filePath = path.join(process.cwd(), product.image_url);
          
          await fs.unlink(filePath);
          console.log(`Ficheiro de imagem removido com sucesso: ${filePath}`);
        } catch (fileError) {
          // Se o ficheiro já não existir no disco, apenas registamos o aviso sem quebrar a resposta da API
          console.warn('Aviso: O ficheiro de imagem não foi encontrado no disco para exclusão.', fileError);
        }
      }

      res.status(200).json({ message: 'Produto removido com sucesso.' });
    } catch (error) {
      console.error('Erro ao remover produto:', error);
      res.status(500).json({ error: 'Erro interno no servidor ao remover produto.' });
    }
  }
}