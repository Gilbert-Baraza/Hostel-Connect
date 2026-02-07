const express = require('express');
const rateLimit = require('express-rate-limit');
const roomController = require('../controllers/roomController');
const authMiddleware = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');

const router = express.Router();

// Rate limiter for room creation
const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 rooms per hour per landlord
  message: {
    success: false,
    message: 'Too many room creation attempts. Please try again later.'
  }
});

// ========== HOSTEL-BASED ROUTES ==========

// Create room for a hostel (landlord only)
router.post('/hostels/:hostelId/rooms',
  authMiddleware,
  roleMiddleware('landlord'),
  createLimiter,
  roomController.createRoom
);

// Get rooms for a hostel (role-aware)
router.get('/hostels/:hostelId/rooms',
  authMiddleware,
  roomController.getRoomsByHostel
);

// ========== ROOM-SPECIFIC ROUTES ==========

// Get single room (role-aware)
router.get('/rooms/:roomId',
  authMiddleware,
  roomController.getRoom
);

// Update room (owner or admin)
router.put('/rooms/:roomId',
  authMiddleware,
  roleMiddleware('landlord', 'admin'),
  roomController.updateRoom
);

// Disable room (owner or admin)
router.patch('/rooms/:roomId/disable',
  authMiddleware,
  roleMiddleware('landlord', 'admin'),
  roomController.disableRoom
);

// Enable room (owner or admin)
router.patch('/rooms/:roomId/enable',
  authMiddleware,
  roleMiddleware('landlord', 'admin'),
  roomController.enableRoom
);

// Toggle availability (owner or admin)
router.patch('/rooms/:roomId/availability',
  authMiddleware,
  roleMiddleware('landlord', 'admin'),
  roomController.toggleAvailability
);

// Delete room permanently (owner or admin)
router.delete('/rooms/:roomId',
  authMiddleware,
  roleMiddleware('landlord', 'admin'),
  roomController.deleteRoom
);

module.exports = router;
