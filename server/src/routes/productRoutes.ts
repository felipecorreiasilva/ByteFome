import { Router } from 'express';
import { ProductController } from '../controllers/productController';
import { uploadProduct } from '../middlewares/uploadProductMiddleware';
import { verifyAuth } from '../middlewares/authMiddleware';
import { verifyAdmin } from '../middlewares/adminMiddleware';

const router = Router();

/**
 * ==========================================
 * ROTAS PÚBLICAS (Acessíveis a qualquer utilizador)
 * ==========================================
 */

/**
 * @route   GET /api/products
 * @desc    Listar todos os produtos disponíveis no cardápio
 * @access  Público
 */
router.get('/', ProductController.getAll);

/**
 * @route   GET /api/products/:id
 * @desc    Obter os detalhes de um produto específico pelo ID
 * @access  Público
 * @example GET http://localhost:3333/api/products/1
 */
router.get('/:id', ProductController.getById);


/**
 * ==========================================
 * ROTAS PROTEGIDAS (Apenas Administradores)
 * ==========================================
 * Ordem de execução dos Middlewares:
 * 1. verifyAuth -> Valida o token JWT e injeta os dados do utilizador em req.user
 * 2. verifyAdmin -> Valida se o req.user.role é estritamente 'admin'
 * 3. uploadProduct -> (Apenas no POST/PUT com imagem) Processa o ficheiro para a pasta /uploads/products
 */

/**
 * @route   POST /api/products
 * @desc    Criar um novo produto com imagem opcional
 * @access  Privado (Admin)
 * @body    FormData (name, category, description, price, is_available, image)
 */
router.post(
    '/', 
    verifyAuth, 
    verifyAdmin, 
    uploadProduct.single('image'), 
    ProductController.create
);

/**
 * @route   PUT /api/products/:id
 * @desc    Atualizar os dados de um produto existente
 * @access  Privado (Admin)
 * @example PUT http://localhost:3333/api/products/1
 */
router.put(
    '/:id', 
    verifyAuth, 
    verifyAdmin, 
    ProductController.update
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Remover um produto do cardápio pelo ID
 * @access  Privado (Admin)
 * @example DELETE http://localhost:3333/api/products/1
 */
router.delete(
    '/:id', 
    verifyAuth, 
    verifyAdmin, 
    ProductController.delete
);

export default router;