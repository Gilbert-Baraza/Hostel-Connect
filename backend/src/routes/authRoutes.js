const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Create router
const router = express.Router();

// Rate limiters for auth endpoints
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 registrations per hour
  message: {
    success: false,
    message: 'Too many registration attempts. Please try again after an hour.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per 15 minutes
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Public routes
router.post('/register', registerLimiter, authController.register);

// Protected routes
router.get('/me', authMiddleware, authController.getMe);

// Note: Login route should have the limiter
router.post('/login', loginLimiter, authController.login);

// Logout is stateless - just inform client to remove token
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
