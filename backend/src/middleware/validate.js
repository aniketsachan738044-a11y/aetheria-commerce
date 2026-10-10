import { validationResult } from 'express-validator';

/**
 * Middleware that checks the result of express-validator checks.
 * If validation errors exist, responds with 400 and clean formatted error list.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};
