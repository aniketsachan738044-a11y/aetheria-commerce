import { body, param, query } from 'express-validator';

/**
 * Validator for Product Creation (Admin)
 */
export const createProductValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 120 })
    .withMessage('Product name cannot exceed 120 characters')
    .escape(),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters')
    .escape(),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a number greater than 0'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .escape(),
  body('image')
    .trim()
    .notEmpty()
    .withMessage('Image URL is required')
    .isURL()
    .withMessage('Image must be a valid URL'),
  body('stock')
    .notEmpty()
    .withMessage('Stock is required')
    .isInt({ min: 0 })
    .withMessage('Stock must be an integer of 0 or greater'),
];

/**
 * Validator for Product Update (Admin)
 */
export const updateProductValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID format'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product name cannot be empty')
    .isLength({ max: 120 })
    .withMessage('Product name cannot exceed 120 characters')
    .escape(),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters')
    .escape(),
  body('price')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a number greater than 0'),
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty')
    .escape(),
  body('image')
    .optional()
    .trim()
    .isURL()
    .withMessage('Image must be a valid URL'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be an integer of 0 or greater'),
];

/**
 * Validator for Product ID parameter
 */
export const productIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID format'),
];

/**
 * Validator for Product Query params (search, filter, pagination)
 */
export const listProductQueryValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('keyword')
    .optional()
    .trim()
    .escape(),
  query('category')
    .optional()
    .trim()
    .escape(),
];
