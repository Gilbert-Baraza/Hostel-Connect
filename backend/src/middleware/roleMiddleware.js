/**
 * Role-Based Authorization Middleware
 * Restricts access to specific roles
 */

/**
 * Create middleware that allows only specified roles
 * @param {...string} roles - Allowed roles
 * @returns {Function} Express middleware
 */
const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    // Check if user is attached to request
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    // Check if user's role is allowed
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}.`
      });
    }

    next();
  };
};

// Convenience middleware for specific roles
const isStudent = roleMiddleware('student');
const isLandlord = roleMiddleware('landlord');
const isAdmin = roleMiddleware('admin');
const isStudentOrLandlord = roleMiddleware('student', 'landlord');
const isLandlordOrAdmin = roleMiddleware('landlord', 'admin');

module.exports = {
  roleMiddleware,
  isStudent,
  isLandlord,
  isAdmin,
  isStudentOrLandlord,
  isLandlordOrAdmin
};
