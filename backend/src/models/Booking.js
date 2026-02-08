const mongoose = require('mongoose');

/**
 * Booking Schema for Hostel Connect
 */
const bookingSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required'],
    index: true
  },
  hostelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: [true, 'Hostel ID is required'],
    index: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room ID is required'],
    index: true
  },
  bookingPeriod: {
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'expired', 'completed'],
    default: 'pending',
    index: true
  },
  totalAmount: {
    type: Number,
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'KES'
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  lockedAt: {
    type: Date
  },
  expiresAt: {
    type: Date,
    index: true
  },
  decision: {
    decidedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    decidedAt: Date,
    reason: String
  },
  cancellation: {
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancelledAt: Date,
    reason: String
  },
  metadata: {
    source: { type: String, default: 'web' },
    ipAddress: String,
    userAgent: String
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes
bookingSchema.index({ roomId: 1, 'bookingPeriod.startDate': 1 });
bookingSchema.index({ studentId: 1, createdAt: -1 });
bookingSchema.index({ hostelId: 1, status: 1 });
bookingSchema.index({ studentId: 1, status: 1, isActive: 1 });

// Prevent overlapping bookings - using compound unique index
// Note: This will be enforced at application level with transactions

// Pre-save validation
bookingSchema.pre('save', function(next) {
  // Validate start date is in the future
  const now = new Date();
  if (this.bookingPeriod.startDate <= now) {
    return next(new Error('Start date must be in the future'));
  }
  
  // Calculate expiry (24 hours from creation if pending)
  if (this.isNew && this.status === 'pending') {
    const expiryHours = parseInt(process.env.BOOKING_EXPIRY_HOURS) || 24;
    this.expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);
    this.lockedAt = new Date();
  }
  
  next();
});

// Instance method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
  return ['pending', 'approved'].includes(this.status);
};

// Instance method to check if booking can be decided
bookingSchema.methods.canBeDecided = function() {
  return this.status === 'pending';
};

// Virtuals for easier access
bookingSchema.virtual('startDate').get(function() {
  return this.bookingPeriod?.startDate;
});

// Static method to check for duplicate booking on same date
bookingSchema.statics.findDuplicate = async function(roomId, startDate, excludeBookingId = null) {
  const query = {
    roomId,
    isActive: true,
    status: { $in: ['pending', 'approved'] },
    'bookingPeriod.startDate': { $eq: new Date(startDate) }
  };
  
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }
  
  return this.find(query);
};

// Static method for student's active bookings
bookingSchema.statics.findStudentActive = function(studentId) {
  return this.find({
    studentId,
    isActive: true,
    status: { $in: ['pending', 'approved'] }
  }).populate('hostelId roomId');
};

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
