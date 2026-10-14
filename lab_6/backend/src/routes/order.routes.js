import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import * as orderController from '../controllers/order.controller.js';

const router = express.Router();
router.use(authMiddleware);
router.post('/create-payment-order', orderController.createPaymentOrder);
router.post('/verify-payment', orderController.verifyPayment);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrder);
export default router;
