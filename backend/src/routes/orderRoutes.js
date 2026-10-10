import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getAdminStats,
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

// Admin-only endpoints
router.get('/admin/stats', authorize('admin'), getAdminStats);
router.get('/', authorize('admin'), getAllOrders);
router.put('/:id/status', authorize('admin'), orderIdValidator, validate, updateOrderStatus);

// Customer endpoints
router.post('/', createOrderValidator, validate, createOrder);
router.get('/myorders', getMyOrders);
router.get('/:id', orderIdValidator, validate, getOrderById);

export default router;
