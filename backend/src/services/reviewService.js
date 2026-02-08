const mongoose = require('mongoose');
const Review = require('../models/Review');
const Hostel = require('../models/Hostel');

/**
 * Review Service - Business Logic Layer
 */

const validateReviewInput = (data) => {
  const errors = [];
  const rating = Number(data.rating);

  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    errors.push('Rating must be a number between 1 and 5');
  }

  if (data.comment && String(data.comment).length > 1000) {
    errors.push('Comment cannot exceed 1000 characters');
  }

  return errors;
};

const createReview = async (hostelId, data, studentId) => {
  const hostel = await Hostel.findById(hostelId);
  if (!hostel) {
    throw new Error('Hostel not found');
  }

  if (!hostel.isActive || hostel.verificationStatus !== 'approved') {
    throw new Error('Cannot review an unavailable hostel');
  }

  const review = new Review({
    hostelId,
    studentId,
    rating: Number(data.rating),
    comment: data.comment ? String(data.comment).trim() : undefined
  });

  await review.save();
  return review;
};

const getReviewStatsByHostel = async (hostelId) => {
  const hostelObjectId = new mongoose.Types.ObjectId(hostelId);
  const result = await Review.aggregate([
    { $match: { hostelId: hostelObjectId, isActive: true } },
    {
      $group: {
        _id: '$hostelId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (!result.length) {
    return { averageRating: 0, totalReviews: 0 };
  }

  return {
    averageRating: Number(result[0].averageRating?.toFixed(2)) || 0,
    totalReviews: result[0].totalReviews || 0
  };
};

const getReviewsByHostel = async (hostelId, options = {}) => {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  const hostel = await Hostel.findById(hostelId);
  if (!hostel) {
    throw new Error('Hostel not found');
  }

  const [reviews, stats] = await Promise.all([
    Review.find({ hostelId, isActive: true })
      .populate('studentId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    getReviewStatsByHostel(hostelId)
  ]);

  return {
    reviews,
    stats,
    pagination: {
      page,
      limit
    }
  };
};

const updateReview = async (reviewId, data, studentId) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new Error('Review not found');
  }

  if (String(review.studentId) !== String(studentId)) {
    throw new Error('Not authorized to update this review');
  }

  if (data.rating !== undefined) {
    const rating = Number(data.rating);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      throw new Error('Rating must be a number between 1 and 5');
    }
    review.rating = rating;
  }

  if (data.comment !== undefined) {
    review.comment = String(data.comment).trim() || undefined;
  }

  await review.save();
  return review;
};

const deleteReview = async (reviewId, studentId) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new Error('Review not found');
  }

  if (String(review.studentId) !== String(studentId)) {
    throw new Error('Not authorized to delete this review');
  }

  await Review.findByIdAndDelete(reviewId);
  return { message: 'Review deleted successfully' };
};

module.exports = {
  validateReviewInput,
  createReview,
  getReviewsByHostel,
  getReviewStatsByHostel,
  updateReview,
  deleteReview
};
