const User = require('../models/User');
const { generateAccessToken } = require('../utils/jwt');

/**
 * Input Validation Helpers
 */
const validateRegistration = (data) => {
  const errors = [];
  
  if (!data.name || data.name.length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  
  if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) {
    errors.push('Please provide a valid email');
  }
  
  if (!data.password || data.password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  
  if (data.password && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
    errors.push('Password must contain uppercase, lowercase, and number');
  }
  
  if (!data.role || !['student', 'landlord'].includes(data.role)) {
    errors.push('Role must be student or landlord');
  }
  
  return errors;
};

const validateLogin = (data) => {
  const errors = [];
  
  if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) {
    errors.push('Please provide a valid email');
  }
  
  if (!data.password) {
    errors.push('Password is required');
  }
  
  return errors;
};

/**
 * Register Controller
 * POST /auth/register
 */
exports.register = async (req, res) => {
  try {
    // Validate input
    const validationErrors = validateRegistration(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    const { name, email, password, role, phone } = req.body;

    // Check if email already exists
    const existingUser = await User.findByEmailWithPassword(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      passwordHash: password, // Will be hashed by pre-save middleware
      role: role || 'student',
      phone
    });

    await user.save();

    // Generate access token
    const token = generateAccessToken(user);

    // Return sanitized user data (no password)
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          status: user.status
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during registration'
    });
  }
};

/**
 * Login Controller
 * POST /auth/login
 */
exports.login = async (req, res) => {
  try {
    // Validate input
    const validationErrors = validateLogin(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    const { email, password } = req.body;

    // Find user with password
    const user = await User.findByEmailWithPassword(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is suspended
    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.'
      });
    }

    // Check if account is deactivated
    if (user.status === 'deactivated') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated.'
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Increment login attempts
      await user.incLoginAttempts();
      
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is locked (too many failed attempts)
    const MAX_ATTEMPTS = 5;
    if (user.loginAttempts.count >= MAX_ATTEMPTS) {
      return res.status(423).json({
        success: false,
        message: 'Too many failed login attempts. Account temporarily locked.'
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Generate access token
    const token = generateAccessToken(user);

    // Return user data and token
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          status: user.status
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login'
    });
  }
};

/**
 * Logout Controller
 * POST /auth/logout
 * 
 * Note: This is a stateless logout. The client must remove the token.
 * JWT tokens are stateless and cannot be invalidated server-side without
 * additional infrastructure (token blacklist or short expiration).
 * 
 * Best practices:
 * 1. Client removes token from storage
 * 2. Use short-lived tokens (15min - 1h)
 * 3. Consider implementing a token blacklist for sensitive operations
 */
exports.logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully. Please remove the token from your client storage.'
  });
};

/**
 * Get Current User Controller
 * GET /auth/me
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          isVerified: user.isVerified,
          status: user.status,
          profileImage: user.profileImage,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred'
    });
  }
};
