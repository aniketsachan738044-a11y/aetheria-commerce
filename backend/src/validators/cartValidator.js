import { body, param } from 'express-validator';

/**
 * Add or update item in cart
 */
export const addToCartValidator = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID format'),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1, max: 99 })
    .withMessage('Quantity must be an integer between 1 and 99'),
];

/**
 * Update item quantity in cart
 */
export const updateCartItemValidator = [
  param('productId')
    .isMongoId()
    .withMessage('Invalid product ID format'),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1, max: 99 })
    .withMessage('Quantity must be an integer between 1 and 99'),
];

/**
 * Remove item from cart
 */
export const removeCartItemValidator = [
  param('productId')
    .isMongoId()
    .withMessage('Invalid product ID format'),
];
