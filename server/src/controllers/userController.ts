import { Request, Response } from 'express';
import { UserModel } from '../models/User';

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
    static async updateUser(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            const { name, email, role } = req.body;

            const updatedUser = await UserModel.update(id, { name, email, role });

            if (!updatedUser) {
                return res.status(404).json({ error: 'Utilizador não encontrado para atualização.' });
            }

            return res.status(200).json(updatedUser);
        } catch (error) {
            console.error('Erro ao atualizar utilizador:', error);
            return res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    }

    // Deletar utilizador (Apenas para Admin)
    static async deleteUser(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            
            // Exemplo de verificação caso recebas o role do utilizador autenticado via middleware (ex: req.user)
            // if (req.user?.role !== 'admin') {
            //     return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem deletar utilizadores.' });
            // }

            const deletedUser = await UserModel.delete(id); // Vais precisar de garantir que este método existe no UserModel

            if (!deletedUser) {
                return res.status(404).json({ error: 'Utilizador não encontrado.' });
            }

            return res.status(200).json({ message: 'Utilizador deletado com sucesso.' });
        } catch (error) {
            console.error('Erro ao deletar utilizador:', error);
            return res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    }
}