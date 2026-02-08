const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { isLandlordOrAdmin } = require('../middleware/roleMiddleware');
const geocodeController = require('../controllers/geocodeController');

const router = express.Router();

// Geocode location for hostel form (landlord/admin only)
router.post('/geocode',
  authMiddleware,
  isLandlordOrAdmin,
  geocodeController.geocode
);

module.exports = router;
