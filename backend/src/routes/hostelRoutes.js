const express = require('express');
const rateLimit = require('express-rate-limit');
const hostelController = require('../controllers/hostelController');
const authMiddleware = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');

const router = express.Router();

// Rate limiter for hostel creation
const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 hostels per hour per landlord
  message: {
    success: false,
    message: 'Too many hostel creation attempts. Please try again later.'
  }
});

// ========== LANDLORD ROUTES ==========

// Create hostel (landlord only)
router.post('/',
  authMiddleware,
  roleMiddleware('landlord'),
  createLimiter,
  hostelController.createHostel
);

// Get own hostels (landlord only)
router.get('/',
  authMiddleware,
  roleMiddleware('landlord', 'admin'),
  hostelController.getHostels
);

// Update own hostel (landlord only)
router.put('/:id',
  authMiddleware,
  roleMiddleware('landlord'),
  hostelController.updateHostel
);

// Delete own hostel (landlord only)
router.delete('/:id',
  authMiddleware,
  roleMiddleware('landlord'),
  hostelController.deleteHostel
);

// ========== PUBLIC & STUDENT ROUTES ==========

// Get single hostel (public access)
router.get('/:id',
  hostelController.getHostel
);

// ========== ADMIN ROUTES ==========

// Disable hostel (admin only)
router.patch('/:id/disable',
  authMiddleware,
  roleMiddleware('admin'),
  hostelController.disableHostel
);

// Enable hostel (admin only)
router.patch('/:id/enable',
  authMiddleware,
  roleMiddleware('admin'),
  hostelController.enableHostel
);

// Verify hostel (admin only)
router.patch('/:id/verify',
  authMiddleware,
  roleMiddleware('admin'),
  hostelController.verifyHostel
);

module.exports = router;
