import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Podes definir a tua chave secreta nas variáveis de ambiente (.env)
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_super_segura';

export class AuthController {
    // Registo de um novo utilizador
    static async register(req: Request, res: Response) {
        try {
            const { name, email, password, role } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({ error: 'Nome, email e password são obrigatórios.' });
            }

            // Verificar se o email já existe
            const existingUser = await UserModel.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ error: 'Este email já está registado.' });
            }

            // Gerar o hash da password
            const saltRounds = 10;
            const password_hash = await bcrypt.hash(password, saltRounds);

            // Criar o utilizador na base de dados
            const newUser = await UserModel.create({
                name,
                email,
                password_hash,
                role: role || 'client'
            });

            // Gerar o token JWT para autenticação imediata após o registo
            const token = jwt.sign(
                { id: newUser.id, email: newUser.email, role: newUser.role },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            return res.status(201).json({
                message: 'Utilizador registado com sucesso.',
                user: newUser,
                token
            });
        } catch (error) {
            console.error('Erro no registo:', error);
            return res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    }

    // Login do utilizador
    static async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email e password são obrigatórios.' });
            }

            // Buscar utilizador por email (incluindo o password_hash)
            const user = await UserModel.findByEmail(email);
            if (!user) {
                return res.status(401).json({ error: 'Credenciais inválidas.' });
            }

            // Validar a password usando o bcrypt.compare
            const isPasswordValid = await bcrypt.compare(password, user.password_hash);
            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Credenciais inválidas.' });
            }

            // Gerar o token JWT
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            // Omitir o password_hash antes de retornar os dados do utilizador
            const { password_hash, ...userWithoutPassword } = user;

            return res.status(200).json({
                message: 'Login efetuado com sucesso.',
                user: userWithoutPassword,
                token
            });
        } catch (error) {
            console.error('Erro no login:', error);
            return res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    }
}