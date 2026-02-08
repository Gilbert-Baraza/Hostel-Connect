const reviewService = require('../services/reviewService');

/**
 * Create Review Controller
 * POST /hostels/:hostelId/reviews
 */
exports.createReview = async (req, res) => {
  try {
    const { hostelId } = req.params;
    const errors = reviewService.validateReviewInput(req.body || {});
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    const review = await reviewService.createReview(hostelId, req.body, req.userId);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: { review }
    });
  } catch (error) {
    console.error('Create review error:', error);

    if (error.message === 'Hostel not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes('unavailable')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

    if (error.code === 11000 || error.message.includes('duplicate')) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this hostel'
      });
    }

    res.status(500).json({
      success: false,
      message: 'An error occurred while submitting the review'
    });
  }
};

/**
 * Get Reviews by Hostel Controller
 * GET /hostels/:hostelId/reviews
 */
exports.getReviewsByHostel = async (req, res) => {
  try {
    const { hostelId } = req.params;
    const { page, limit } = req.query;

    const result = await reviewService.getReviewsByHostel(hostelId, {
      page,
      limit
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get reviews error:', error);

    if (error.message === 'Hostel not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching reviews'
    });
  }
};

/**
 * Update Review Controller
 * PUT /reviews/:reviewId
 */
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await reviewService.updateReview(reviewId, req.body, req.userId);

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: { review }
    });
  } catch (error) {
    console.error('Update review error:', error);

    if (error.message === 'Review not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes('Not authorized')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes('Rating must be')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'An error occurred while updating the review'
    });
  }
};

/**
 * Delete Review Controller
 * DELETE /reviews/:reviewId
 */
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    await reviewService.deleteReview(reviewId, req.userId);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);

    if (error.message === 'Review not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes('Not authorized')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the review'
    });
  }
};
