import jwt from 'jsonwebtoken';

/**
 * Generate a signed JSON Web Token
 * @param {string} userId - User's MongoDB _id
 * @param {string} role - User role (customer / admin)
 * @returns {string} Signed JWT token
 */
export const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured in environment variables');
  }

  return jwt.sign(
    {
      id: userId,
      role: role,
    },
    secret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    }
  );
};
