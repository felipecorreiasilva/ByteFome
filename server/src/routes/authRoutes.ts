import { Router } from 'express';
import { AuthController } from '../controllers/authController';

const router = Router();

// Rota para registar um novo utilizador e receber o token inicial
router.post('/register', AuthController.register);

// Rota para autenticar um utilizador existente e gerar o token JWT
router.post('/login', AuthController.login);

export default router;