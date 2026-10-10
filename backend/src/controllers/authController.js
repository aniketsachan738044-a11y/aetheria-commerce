import { User } from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({
        status: 'error',
        message: 'An account with this email address already exists.',
      });
    }

    // Role defaults to 'customer' in the schema. Prevent client from injecting 'admin' role directly.
    const user = await User.create({
      name,
      email,
      password,
      role: 'customer',
    });

    const token = generateToken(user._id, user.role);

    return res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    console.error(`[Register Error]: ${error.message}`);
    return res.status(500).json({
      status: 'error',
      message: 'Server error during user registration.',
    });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Need to explicitly select password because select: false is set in schema
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      // Use generic error message to prevent account enumeration
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password credentials.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password credentials.',
      });
    }

    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    console.error(`[Login Error]: ${error.message}`);
    return res.status(500).json({
      status: 'error',
      message: 'Server error during user login.',
    });
  }
};

/**
 * @desc    Get currently logged in user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getUserProfile = async (req, res) => {
  try {
    // req.user is populated by authenticate middleware
    return res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          createdAt: req.user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error(`[Profile Error]: ${error.message}`);
    return res.status(500).json({
      status: 'error',
      message: 'Server error retrieving profile.',
    });
  }
};
