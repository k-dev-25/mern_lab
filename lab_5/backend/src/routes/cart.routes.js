import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import * as cartController from '../controllers/cart.controller.js';

const router = express.Router();
router.use(authMiddleware);
router.post('/:productId', cartController.addToCart);
router.get('/', cartController.getCart);
router.patch('/:productId', cartController.updateQuantity);
router.delete('/:productId', cartController.removeFromCart);

export default router;
