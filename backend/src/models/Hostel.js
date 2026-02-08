const mongoose = require('mongoose');

/**
 * Address Schema (embedded)
 */
const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  county: { type: String, required: true },
  postalCode: { type: String },
  landmark: { type: String },
  coordinates: {
    latitude: { type: Number, min: -90, max: 90 },
    longitude: { type: Number, min: -180, max: 180 }
  }
}, { _id: false });

/**
 * Amenity Schema (embedded)
 */
const amenitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['essential', 'comfort', 'security', 'study', 'entertainment'],
    required: true 
  }
}, { _id: false });

/**
 * Hostel Image Schema (embedded)
 */
const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String },
  caption: { type: String },
  isPrimary: { type: Boolean, default: false },
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false });

/**
 * Hostel Schema for Hostel Connect
 */
const hostelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hostel name is required'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters'],
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  address: {
    type: addressSchema,
    required: [true, 'Address is required']
  },
  distanceFromCampus: {
    type: Number,
    min: [0, 'Distance cannot be negative'],
    max: [50, 'Distance seems unrealistic']
  },
  university: {
    name: { type: String },
    distanceKm: { type: Number }
  },
  hostelType: {
    type: String,
    enum: ['male', 'female', 'mixed'],
    required: [true, 'Hostel type is required']
  },
  amenities: [amenitySchema],
  images: [imageSchema],
  pricing: {
    minPrice: { type: Number, required: [true, 'Minimum price is required'], min: [0, 'Price cannot be negative'] },
    maxPrice: { type: Number, min: [0, 'Price cannot be negative'] },
    currency: { type: String, default: 'KES' },
    priceNegotiable: { type: Boolean, default: false }
  },
  houseRules: {
    curfew: { type: String },
    visitorsAllowed: { type: Boolean, default: true },
    smokingAllowed: { type: Boolean, default: false },
    petAllowed: { type: Boolean, default: false },
    additionalRules: [{ type: String }]
  },
  landlordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Landlord ID is required'],
    index: true
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  verificationNotes: {
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    rejectionReason: String,
    adminComments: String
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  statistics: {
    totalViews: { type: Number, default: 0 },
    totalInquiries: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
hostelSchema.index({ 'address.city': 1, 'address.county': 1 });
hostelSchema.index({ hostelType: 1, 'pricing.minPrice': 1 });
hostelSchema.index({ verificationStatus: 1, isActive: 1 });
hostelSchema.index({ landlordId: 1, createdAt: -1 });
hostelSchema.index({ name: 'text', description: 'text' });

// Virtual for primary image
hostelSchema.virtual('primaryImage').get(function() {
  console.log('[DEBUG] primaryImage virtual called, this.images:', this.images);
  const primary = this.images && this.images.find ? this.images.find(img => img.isPrimary) : null;
  return primary ? primary.url : (this.images?.[0]?.url || null);
});

// Pre-save middleware
hostelSchema.pre('save', function(next) {
  // Ensure maxPrice >= minPrice
  if (this.pricing.maxPrice && this.pricing.maxPrice < this.pricing.minPrice) {
    return next(new Error('Maximum price must be greater than or equal to minimum price'));
  }
  next();
});

// Instance method to check if landlord owns this hostel
hostelSchema.methods.isOwnedBy = function(userId) {
  return this.landlordId.toString() === userId.toString();
};

// Static method for public listings (approved and active)
hostelSchema.statics.findPublicListings = function(options = {}) {
  const query = {
    verificationStatus: 'approved',
    isActive: true
  };
  
  return this.find(query)
    .populate('landlordId', 'name email phone')
    .select('-verificationNotes -statistics')
    .sort(options.sort || { createdAt: -1 })
    .skip(options.skip || 0)
    .limit(options.limit || 20);
};

// Static method to find by ID with role-aware sanitization
hostelSchema.statics.findByIdWithRole = async function(id, role, userId) {
  const hostel = await this.findById(id)
    .populate('landlordId', 'name email phone');
  
  if (!hostel) return null;
  
  // Sanitize based on role
  if (role === 'student') {
    // Students only see landlord name, not contact info
    const sanitized = hostel.toObject();
    sanitized.landlordId = {
      name: hostel.landlordId.name
    };
    return sanitized;
  }
  
  if (role === 'landlord' && hostel.isOwnedBy(userId)) {
    // Owner sees everything
    return hostel;
  }
  
  return hostel;
};

const Hostel = mongoose.model('Hostel', hostelSchema);

module.exports = Hostel;
