const express = require('express');
const rateLimit = require('express-rate-limit');
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');

const router = express.Router();

// Rate limiter for booking creation
const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 bookings per hour per student
  message: {
    success: false,
    message: 'Too many booking attempts. Please try again later.'
  }
});

// ========== STUDENT ROUTES ==========

// Create booking for a room
router.post('/rooms/:roomId/book',
  authMiddleware,
  roleMiddleware('student'),
  bookingLimiter,
  bookingController.createBooking
);

// Get my bookings
router.get('/bookings/my',
  authMiddleware,
  roleMiddleware('student'),
  bookingController.getMyBookings
);

// Cancel my booking
router.patch('/bookings/:bookingId/cancel',
  authMiddleware,
  roleMiddleware('student'),
  bookingController.cancelBooking
);

// ========== LANDLORD ROUTES ==========

// Get bookings for my hostel
router.get('/hostels/:hostelId/bookings',
  authMiddleware,
  roleMiddleware('landlord'),
  bookingController.getHostelBookings
);

// Approve/reject booking
router.patch('/bookings/:bookingId/decision',
  authMiddleware,
  roleMiddleware('landlord'),
  bookingController.decideBooking
);

// ========== ADMIN ROUTES ==========

// Get all bookings
router.get('/admin/bookings',
  authMiddleware,
  roleMiddleware('admin'),
  bookingController.getAllBookings
);

// Force cancel booking
router.patch('/admin/bookings/:bookingId/force-cancel',
  authMiddleware,
  roleMiddleware('admin'),
  bookingController.forceCancelBooking
);

// ========== PUBLIC/SHARED ROUTES ==========

// Get single booking (student, landlord, or admin)
router.get('/bookings/:bookingId',
  authMiddleware,
  bookingController.getBooking
);

// Expire bookings (for cron job - should be protected by API key in production)
router.post('/bookings/expire',
  bookingController.expireBookings
);

module.exports = router;
