/**
 * Date Overlap Utility
 * Provides functions to check date range overlaps
 */

/**
 * Check if two date ranges overlap
 * @param {Object} range1 - First date range { startDate, endDate }
 * @param {Object} range2 - Second date range { startDate, endDate }
 * @returns {boolean} True if ranges overlap
 */
const rangesOverlap = (range1, range2) => {
  const start1 = new Date(range1.startDate);
  const end1 = new Date(range1.endDate);
  const start2 = new Date(range2.startDate);
  const end2 = new Date(range2.endDate);
  
  // Overlap occurs when:
  // range1.start < range2.end AND range1.end > range2.start
  return start1 < end2 && end1 > start2;
};

/**
 * Check if a date is within a range
 * @param {Date} date - Date to check
 * @param {Object} range - Date range { startDate, endDate }
 * @returns {boolean} True if date is within range
 */
const isDateInRange = (date, range) => {
  const checkDate = new Date(date);
  const start = new Date(range.startDate);
  const end = new Date(range.endDate);
  
  return checkDate >= start && checkDate <= end;
};

/**
 * Check if a range is completely contained within another
 * @param {Object} inner - Inner range { startDate, endDate }
 * @param {Object} outer - Outer range { startDate, endDate }
 * @returns {boolean} True if inner is contained in outer
 */
const isContainedIn = (inner, outer) => {
  const innerStart = new Date(inner.startDate);
  const innerEnd = new Date(inner.endDate);
  const outerStart = new Date(outer.startDate);
  const outerEnd = new Date(outer.endDate);
  
  return innerStart >= outerStart && innerEnd <= outerEnd;
};

/**
 * Calculate number of days between two dates
 * @param {Date} startDate 
 * @param {Date} endDate 
 * @returns {number} Number of days
 */
const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Calculate total price based on days and daily rate
 * @param {Object} bookingPeriod - { startDate, endDate }
 * @param {number} dailyRate - Price per day
 * @returns {number} Total price
 */
const calculateTotal = (bookingPeriod, dailyRate) => {
  const days = calculateDays(bookingPeriod.startDate, bookingPeriod.endDate);
  // Minimum 1 day charge
  const chargeableDays = Math.max(1, days);
  return chargeableDays * dailyRate;
};

/**
 * Validate that dates are in the future
 * @param {Date} startDate 
 * @param {Date} endDate 
 * @returns {Object} { valid: boolean, error?: string }
 */
const validateFutureDates = (startDate, endDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start <= now) {
    return { valid: false, error: 'Start date must be in the future' };
  }
  
  if (end <= start) {
    return { valid: false, error: 'End date must be after start date' };
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
  rangesOverlap,
  isDateInRange,
  isContainedIn,
  calculateDays,
  calculateTotal,
  validateFutureDates,
  generateExpiryDate
};
