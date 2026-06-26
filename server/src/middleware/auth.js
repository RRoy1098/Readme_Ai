// src/middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Express middleware that verifies the JWT from the Authorization header
 * and attaches the authenticated user to req.user.
 */
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'No valid authorization token provided. Include a Bearer token in the Authorization header.',
      });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'readmeai-dev-secret-change-in-production';

    // Verify token
    const decoded = jwt.verify(token, secret);

    // Fetch the user to ensure they still exist and attach to request
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'The user associated with this token no longer exists.',
      });
    }

    // Attach user to request for downstream handlers
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token Expired',
        message: 'Your session has expired. Please log in again.',
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid Token',
        message: 'The provided token is invalid or malformed.',
      });
    }
    return res.status(500).json({
      error: 'Authentication Error',
      message: 'An unexpected error occurred during authentication.',
    });
  }
}

/**
 * Optional auth — attaches user if token is present, but doesn't block.
 */
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const secret = process.env.JWT_SECRET || 'readmeai-dev-secret-change-in-production';
      const decoded = jwt.verify(token, secret);
      req.user = await User.findById(decoded.id);
    }
  } catch {
    // Silently ignore — user stays undefined
  }
  next();
}
