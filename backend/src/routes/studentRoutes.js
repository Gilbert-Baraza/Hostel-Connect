const express = require('express');
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');

const router = express.Router();

// Saved hostels (student only)
router.get('/saved-hostels',
  authMiddleware,
  roleMiddleware('student'),
  studentController.getSavedHostels
);

router.post('/saved-hostels/:hostelId',
  authMiddleware,
  roleMiddleware('student'),
  studentController.saveHostel
);

router.delete('/saved-hostels/:hostelId',
  authMiddleware,
  roleMiddleware('student'),
  studentController.removeSavedHostel
);

module.exports = router;
