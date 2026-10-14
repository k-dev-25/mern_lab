import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import * as wishlistController from '../controllers/wishlist.controller.js';

const router = express.Router();

router.use(authMiddleware);
router.post('/:productId', wishlistController.addProduct);
router.get('/', wishlistController.getWishlist);
router.delete('/:productId', wishlistController.removeProduct);

export default router;
