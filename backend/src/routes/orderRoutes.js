import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
} from '../controllers/orderController.js';
import {
  createOrderValidator,
  orderIdValidator,
} from '../validators/orderValidator.js';
import { validate } from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All order endpoints require authentication
router.use(authenticate);

// Customer endpoints
router.post('/', createOrderValidator, validate, createOrder);
router.get('/myorders', getMyOrders);
router.get('/:id', orderIdValidator, validate, getOrderById);

// Admin-only endpoint
router.get('/', authorize('admin'), getAllOrders);

export default router;
