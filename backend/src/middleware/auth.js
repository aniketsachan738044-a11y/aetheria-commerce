import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

/**
 * Authentication middleware.
 * Verifies JWT token from Authorization Bearer header and attaches the user document to req.user.
 */
export const authenticate = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication token missing or invalid.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Look up user in database to ensure account still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User account associated with this token no longer exists.',
      });
    }

    // Attach authenticated user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication token has expired. Please log in again.',
      });
    }
    return res.status(401).json({
      status: 'error',
      message: 'Invalid authentication token.',
    });
  }
};

/**
 * Server-side Role-Based Access Control (RBAC) middleware.
 * Guarantees that only users with allowed roles can access endpoints.
 * @param  {...string} roles - Permitted roles (e.g., 'admin')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'User is not authenticated.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `Forbidden: Access requires one of [${roles.join(', ')}] roles.`,
      });
    }

    next();
  };
};
