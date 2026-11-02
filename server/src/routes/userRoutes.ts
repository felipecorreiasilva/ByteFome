import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { verifyAuth } from '../middlewares/authMiddleware';
import { verifyAdmin } from '../middlewares/adminMiddleware';
// Futuramente, se quiseres permitir upload de avatar/foto de perfil:
// import { uploadUser } from '../middlewares/uploadUserMiddleware';

const router = Router();

/**
 * ==========================================
 * ROTAS DE UTILIZADORES
 * ==========================================
 */

/**
 * @route   GET /api/users
 * @desc    Listar todos os utilizadores cadastrados
 * @access  Privado (Normalmente restrito a administradores)
 */
router.get('/', verifyAuth, verifyAdmin, UserController.getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Obter os detalhes de um utilizador específico pelo ID
 * @access  Privado
 * @example GET http://localhost:3333/api/users/1
 */
router.get('/:id', verifyAuth, UserController.getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Atualizar os dados de um utilizador por ID
 * @access  Privado
 * @example PUT http://localhost:3333/api/users/1
 */
router.put('/:id', verifyAuth, UserController.updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Remover um utilizador do sistema pelo ID
 * @access  Privado (Admin)
 * @example DELETE http://localhost:3333/api/users/1
 */
router.delete('/:id', verifyAuth, verifyAdmin, UserController.deleteUser);

export default router;