const jwt = require('jsonwebtoken');

/**
 * JWT Utility Functions
 * Handles token generation and verification
 */

// Load environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

/**
 * Generate access token for authenticated user
 * @param {Object} user - User object from database
 * @returns {string} JWT access token
 */
const generateAccessToken = (user) => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  const payload = {
    userId: user._id.toString(),
    role: user.role,
    email: user.email
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'hostel-connect-api',
    subject: user._id.toString()
  });
};

/**
 * Verify access token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyAccessToken = (token) => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      const err = new Error('Token has expired');
      err.name = 'TokenExpiredError';
      throw err;
    }
    if (error.name === 'JsonWebTokenError') {
      const err = new Error('Invalid token');
      err.name = 'JsonWebTokenError';
      throw err;
    }
    throw error;
  }
};

/**
 * Decode token without verification (for debugging)
 * @param {string} token - JWT token to decode
 * @returns {Object|null} Decoded payload or null
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

/**
 * Get token expiration time
 * @param {string} token - JWT token
 * @returns {Date|null} Expiration date or null
 */
const getTokenExpiration = (token) => {
  const decoded = decodeToken(token);
  if (decoded && decoded.exp) {
    return new Date(decoded.exp * 1000);
  }
  return null;
};

module.exports = {
  generateAccessToken,
  verifyAccessToken,
  decodeToken,
  getTokenExpiration
};
