const express = require('express');
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');

const router = express.Router();

// Public: list reviews for a hostel
router.get('/hostels/:hostelId/reviews', reviewController.getReviewsByHostel);

// Students: create review
router.post(
  '/hostels/:hostelId/reviews',
  authMiddleware,
  roleMiddleware('student'),
  reviewController.createReview
);

// Students: update their own review
router.put(
  '/reviews/:reviewId',
  authMiddleware,
  roleMiddleware('student'),
  reviewController.updateReview
);

// Students: delete their own review
router.delete(
  '/reviews/:reviewId',
  authMiddleware,
  roleMiddleware('student'),
  reviewController.deleteReview
);

module.exports = router;
