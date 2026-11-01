import { Router } from 'express';
import { ProductController } from '../controllers/productController.js';

const router = Router();

// Endpoint: /api/products
router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getById);
router.post('/', ProductController.create);
router.put('/:id', ProductController.update);
router.delete('/:id', ProductController.delete);

export default router;