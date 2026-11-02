import fs from 'fs/promises';
import path from 'path';
import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export class UserController {
    // Listar todos os utilizadores (sem password_hash)
    static async getAllUsers(req: Request, res: Response) {
        try {
            const users = await UserModel.getAll();
            return res.status(200).json(users);
        } catch (error) {
            console.error('Erro ao listar utilizadores:', error);
            return res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    }

    // Buscar utilizador por ID
    static async getUserById(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            const user = await UserModel.findById(id);

            if (!user) {
                return res.status(404).json({ error: 'Utilizador não encontrado.' });
            }

            return res.status(200).json(user);
        } catch (error) {
            console.error('Erro ao buscar utilizador por ID:', error);
            return res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    }

    // Atualizar utilizador
    static async updateUser(req: AuthenticatedRequest, res: Response) {
        try {
            const id = Number(req.params.id);
            const { name, email, role } = req.body;

            // Dados do utilizador que está a fazer a requisição (vindos do verifyAuth / authMiddleware)
            const loggedUserId = req.user?.id;
            const loggedUserRole = req.user?.role;

            const isAdmin = loggedUserRole === 'admin';
            const isSelfUpdate = loggedUserId === id;

            // 1. Validação de Identidade: Se não for admin e tentar editar outro utilizador, bloqueia
            if (!isAdmin && !isSelfUpdate) {
                return res.status(403).json({ 
                    error: 'Acesso negado. Só podes atualizar o teu próprio perfil.' 
                });
            }

            // 2. Validação de Alteração de Role: Apenas administradores podem alterar o campo 'role'
            if (role !== undefined && !isAdmin) {
                return res.status(403).json({ 
                    error: 'Acesso negado. Apenas administradores podem alterar o cargo (role) de um utilizador.' 
                });
            }

            // 3. Tratamento da Imagem de Perfil via Multer
            let image_url = req.body.image_url;
            if (req.file) {
                // Se um ficheiro foi enviado pelo Multer, definimos o caminho relativo correto
                image_url = `/uploads/users/${req.file.filename}`;
            }

            // Monta o objeto com os dados permitidos para atualização
            const dataToUpdate: any = { name, email, image_url };
            
            if (isAdmin) {
                dataToUpdate.role = role; // Apenas admin pode persistir a alteração de role
            }

            const updatedUser = await UserModel.update(id, dataToUpdate);

            if (!updatedUser) {
                return res.status(404).json({ error: 'Utilizador não encontrado para atualização.' });
            }

            return res.status(200).json(updatedUser);
        } catch (error) {
            console.error('Erro ao atualizar utilizador:', error);
            return res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    }

    // Deletar utilizador
    static async deleteUser(req: AuthenticatedRequest, res: Response) {
        try {
            const id = Number(req.params.id);

            // 1. Buscar o utilizador antes de o apagar para obter o caminho da imagem de perfil (image_url)
            const user = await UserModel.findById(id);

            if (!user) {
                return res.status(404).json({ error: 'Utilizador não encontrado.' });
            }

            // 2. Executar a exclusão na base de dados
            const deleted = await UserModel.delete(id);

            if (!deleted) {
                return res.status(404).json({ error: 'Utilizador não encontrado para exclusão.' });
            }

            // 3. Se o utilizador tinha uma imagem de perfil associada, remove o ficheiro físico do servidor
            if (user.image_url) {
                try {
                    // user.image_url vem como algo do tipo: "/uploads/users/nome-do-avatar.jpg"
                    const filePath = path.join(process.cwd(), user.image_url);
                    
                    await fs.unlink(filePath);
                    console.log(`Ficheiro de avatar removido com sucesso: ${filePath}`);
                } catch (fileError) {
                    console.warn('Aviso: O ficheiro de avatar não foi encontrado no disco para exclusão.', fileError);
                }
            }

            return res.status(200).json({ message: 'Utilizador deletado com sucesso.' });
        } catch (error) {
            console.error('Erro ao deletar utilizador:', error);
            return res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    }
}