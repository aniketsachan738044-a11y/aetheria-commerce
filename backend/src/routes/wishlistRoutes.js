import express from 'express';
import {
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
} from '../controllers/wishlistController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getWishlist);
router.post('/toggle/:productId', toggleWishlist);
router.delete('/:productId', removeFromWishlist);

export default router;
