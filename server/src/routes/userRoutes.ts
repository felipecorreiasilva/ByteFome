import { Router } from 'express';
import { UserController } from '../controllers/userController';
// Opcional: Se tiveres um middleware de autenticação JWT para proteger as rotas
// import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Todas as rotas aqui definidas terão o prefixo /users (ou /api/users dependendo do server.js)

// Listar todos os utilizadores
router.get('/', UserController.getAllUsers);

// Buscar um utilizador específico por ID (ex: GET /users/1)
router.get('/:id', UserController.getUserById);

// Atualizar um utilizador por ID
router.put('/:id', UserController.updateUser);

// Deletar um utilizador por ID
router.delete('/:id', UserController.deleteUser);

export default router;