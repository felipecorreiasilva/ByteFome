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
            const { name, email, role, phone } = req.body;

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

            // 3. Buscar o utilizador atual na BD para verificar se já tem uma imagem antiga
            const existingUser = await UserModel.findById(id);
            if (!existingUser) {
                return res.status(404).json({ error: 'Utilizador não encontrado.' });
            }

            // 4. Tratamento da Nova Imagem de Perfil via Multer
            let image_url = existingUser.image_url; // Mantém a imagem anterior por defeito
            
            if (req.file) {
                // Se um novo ficheiro foi enviado pelo Multer, definimos o novo caminho relativo
                image_url = `/uploads/users/${req.file.filename}`;

                // Se o utilizador já tinha uma imagem anterior gravada, removemos o ficheiro antigo do disco
                if (existingUser.image_url) {
                    try {
                        const oldFilePath = path.join(process.cwd(), existingUser.image_url);
                        await fs.unlink(oldFilePath);
                        console.log(`Imagem antiga de avatar removida com sucesso: ${oldFilePath}`);
                    } catch (fileError) {
                        console.warn('Aviso: O ficheiro de imagem antigo não foi encontrado no disco para exclusão.', fileError);
                    }
                }
            }

            // 5. Tratamento dos Endereços (vindos do FormData em formato string JSON)
            let parsedAddresses;
            if (req.body.addresses) {
                try {
                    parsedAddresses = typeof req.body.addresses === 'string' 
                        ? JSON.parse(req.body.addresses) 
                        : req.body.addresses;
                } catch (parseError) {
                    console.error('Erro ao fazer parse dos endereços:', parseError);
                    return res.status(400).json({ error: 'Formato de endereços inválido.' });
                }
            }

            // Monta o objeto com os dados permitidos para atualização
            const dataToUpdate: any = { 
                name, 
                email, 
                phone, 
                image_url,
                addresses: parsedAddresses 
            };
            
            if (isAdmin) {
                dataToUpdate.role = role; // Apenas admin pode persistir a alteração de role
            }

            const updatedUser = await UserModel.update(id, dataToUpdate);

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

            // 2. Executar a exclusão na base de dados (o model já remove os endereços associados)
            const deleted = await UserModel.delete(id);

            if (!deleted) {
                return res.status(404).json({ error: 'Utilizador não encontrado para exclusão.' });
            }

            // 3. Se o utilizador tinha uma imagem de perfil associada, remove o ficheiro físico do servidor
            if (user.image_url) {
                try {
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