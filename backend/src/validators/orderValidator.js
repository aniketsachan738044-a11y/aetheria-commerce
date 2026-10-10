import { body, param } from 'express-validator';

/**
 * Order placement validator
 */
export const createOrderValidator = [
  body('shippingAddress')
    .notEmpty()
    .withMessage('Shipping address is required')
    .isObject()
    .withMessage('Shipping address must be an object'),
  body('shippingAddress.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required')
    .escape(),
  body('shippingAddress.city')
    .trim()
    .notEmpty()
    .withMessage('City is required')
    .escape(),
  body('shippingAddress.state')
    .trim()
    .notEmpty()
    .withMessage('State is required')
    .escape(),
  body('shippingAddress.postalCode')
    .trim()
    .notEmpty()
    .withMessage('Postal code is required')
    .escape(),
  body('shippingAddress.country')
    .trim()
    .notEmpty()
    .withMessage('Country is required')
    .escape(),
];

/**
 * Order ID param validator
 */
export const orderIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid order ID format'),
];
