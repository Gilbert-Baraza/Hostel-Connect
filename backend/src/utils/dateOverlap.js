/**
 * Date Overlap Utility
 * Simplified to work with single start date bookings
 */

/**
 * Calculate number of days from start date (placeholder - no end date)
 * @param {Date} startDate 
 * @returns {number} Number of days from now
 */
const calculateDays = (startDate) => {
  const start = new Date(startDate);
  const now = new Date();
  const diffTime = Math.abs(start - now);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Validate that start date is in the future
 * @param {Date} startDate 
 * @returns {Object} { valid: boolean, error?: string }
 */
const validateFutureDate = (startDate) => {
  const now = new Date();
  const start = new Date(startDate);
  
  if (start <= now) {
    return { valid: false, error: 'Start date must be in the future' };
  }
  
  return { valid: true };
};

/**
 * Generate expiry date for pending booking
 * @param {number} hours - Hours until expiry
 * @returns {Date} Expiry date
 */
const generateExpiryDate = (hours = 24) => {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
};

module.exports = {
  calculateDays,
  validateFutureDate,
  generateExpiryDate
};
