import express from 'express';
import { registerUser, loginUser, getUserProfile } from '../controllers/authController.js';
import { registerValidator, loginValidator } from '../validators/authValidator.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes with validation & sanitization
router.post('/register', registerValidator, validate, registerUser);
router.post('/login', loginValidator, validate, loginUser);

// Protected routes
router.get('/profile', authenticate, getUserProfile);

export default router;
