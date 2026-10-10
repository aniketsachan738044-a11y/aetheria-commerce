import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
} from '../controllers/productController.js';
import {
  createProductValidator,
  updateProductValidator,
  productIdValidator,
  listProductQueryValidator,
} from '../validators/productValidator.js';
import { validate } from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', listProductQueryValidator, validate, getProducts);
router.get('/:id', productIdValidator, validate, getProductById);

// Customer review route
router.post('/:id/reviews', authenticate, productIdValidator, validate, createProductReview);

// Admin-only protected routes
router.post(
  '/',
  authenticate,
  authorize('admin'),
  createProductValidator,
  validate,
  createProduct
);

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  updateProductValidator,
  validate,
  updateProduct
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  productIdValidator,
  validate,
  deleteProduct
);

export default router;
