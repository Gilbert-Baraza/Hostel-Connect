const mongoose = require('mongoose');

/**
 * Room Image Schema (embedded)
 */
const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  caption: { type: String },
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false });

/**
 * Room Amenity Schema (embedded)
 */
const amenitySchema = new mongoose.Schema({
  name: { type: String, required: true }
}, { _id: false });

/**
 * Room Schema for Hostel Connect
 */
const roomSchema = new mongoose.Schema({
  hostelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: [true, 'Hostel ID is required'],
    index: true
  },
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    trim: true
  },
  roomType: {
    type: String,
    enum: ['single', 'double', 'triple', 'quad', 'studio', 'bedspace'],
    required: [true, 'Room type is required']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    max: [10, 'Capacity cannot exceed 10']
  },
  price: {
    amount: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    period: {
      type: String,
      enum: ['monthly', 'semester', 'yearly'],
      default: 'monthly'
    },
    currency: { type: String, default: 'KES' },
    deposit: { type: Number, default: 0 }
  },
  amenities: [amenitySchema],
  images: [imageSchema],
  isAvailable: {
    type: Boolean,
    default: true,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  features: {
    bed: { type: Boolean, default: true },
    desk: { type: Boolean, default: true },
    wardrobe: { type: Boolean, default: true },
    window: { type: Boolean, default: false },
    ac: { type: Boolean, default: false },
    ensuiteBathroom: { type: Boolean, default: false },
    balcony: { type: Boolean, default: false }
  },
  currentOccupancy: {
    type: Number,
    default: 0,
    min: 0
  },
  disabledAt: {
    type: Date
  },
  disabledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  disableReason: {
    type: String
  }
}, {
  timestamps: true
});

// Compound unique index: room number must be unique within a hostel
roomSchema.index({ hostelId: 1, roomNumber: 1 }, { unique: true });
roomSchema.index({ isActive: 1, isAvailable: 1 });
roomSchema.index({ price: 1 });
roomSchema.index({ capacity: 1 });

// Pre-save validation
roomSchema.pre('save', function(next) {
  // Ensure current occupancy doesn't exceed capacity
  if (this.currentOccupancy > this.capacity) {
    return next(new Error('Current occupancy cannot exceed room capacity'));
  }
  
  // Auto-set isAvailable based on occupancy
  if (this.currentOccupancy >= this.capacity) {
    this.isAvailable = false;
  }
  
  next();
});

// Virtual for available beds
roomSchema.virtual('availableBeds').get(function() {
  return this.capacity - this.currentOccupancy;
});

// Instance method to check if user owns this room's hostel
roomSchema.methods.isOwnedBy = function(userId) {
  return this.hostelId.toString() === userId.toString();
};

// Static method to find rooms for a specific hostel
roomSchema.statics.findByHostel = function(hostelId, options = {}) {
  const query = { hostelId };
  
  // Filter by availability for students/public
  if (options.publicView) {
    query.isActive = true;
    query.isAvailable = true;
  }
  
  return this.find(query)
    .sort(options.sort || { roomNumber: 1 })
    .skip(options.skip || 0)
    .limit(options.limit || 20);
};

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
