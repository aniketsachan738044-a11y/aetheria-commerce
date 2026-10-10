import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../controllers/cartController.js';
import {
  addToCartValidator,
  updateCartItemValidator,
  removeCartItemValidator,
} from '../validators/cartValidator.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All cart endpoints require user authentication
router.use(authenticate);

router.get('/', getCart);
router.post('/', addToCartValidator, validate, addToCart);
router.put('/:productId', updateCartItemValidator, validate, updateCartItem);
router.delete('/:productId', removeCartItemValidator, validate, removeCartItem);
router.delete('/', clearCart);

export default router;
