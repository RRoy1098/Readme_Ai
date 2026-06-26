// src/controllers/auth.controller.js
import User from '../models/User.js';

/**
 * Register a new user account.
 * POST /api/auth/register
 */
export async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Name, email, and password are all required.',
    });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'An account with this email already exists.',
      });
    }

    // Create the user (password is auto-hashed by the pre-save hook)
    const user = await User.create({ name, email, password });

    // Generate token
    const token = user.generateAuthToken();

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        user: user.toSafeObject(),
        token,
      },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        error: 'Validation Error',
        message: messages.join('. '),
      });
    }
    console.error(`[Auth Controller] Registration failed: ${error.message}`);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Registration failed. Please try again.',
    });
  }
}

/**
 * Log in with email and password.
 * POST /api/auth/login
 */
export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Email and password are both required.',
    });
  }

  try {
    // Find user explicitly selecting password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid email or password.',
      });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid email or password.',
      });
    }

    // Generate token
    const token = user.generateAuthToken();

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: user.toSafeObject(),
        token,
      },
    });
  } catch (error) {
    console.error(`[Auth Controller] Login failed: ${error.message}`);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Login failed. Please try again.',
    });
  }
}

/**
 * Get the currently authenticated user's profile.
 * GET /api/auth/me
 */
export async function getMe(req, res) {
  return res.status(200).json({
    success: true,
    data: {
      user: req.user.toSafeObject(),
    },
  });
}
