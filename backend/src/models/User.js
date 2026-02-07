const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * User Schema for Hostel Connect
 * Supports students, landlords, and admins with role-based access
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Never return password in queries
  },
  role: {
    type: String,
    enum: ['student', 'landlord', 'admin'],
    default: 'student',
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'deactivated'],
    default: 'active'
  },
  phone: {
    type: String,
    trim: true
  },
  profileImage: {
    type: String,
    default: null
  },
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    count: { type: Number, default: 0 },
    lastAttempt: { type: Date }
  },
  passwordChangedAt: {
    type: Date
  },
  refreshTokens: [{
    token: String,
    expiresAt: Date,
    userAgent: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.passwordHash;
      delete ret.refreshTokens;
      delete ret.__v;
      return ret;
    }
  }
});

// Index for performance (email index removed - unique: true already creates it)
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

/**
 * Pre-save middleware to hash password
 */
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified or new
  if (!this.isModified('passwordHash')) return next();
  
  // Hash password with bcrypt (minimum 10 rounds)
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
  this.passwordHash = await bcrypt.hash(this.passwordHash, saltRounds);
  
  // Set password changed timestamp
  this.passwordChangedAt = new Date();
  
  next();
});

/**
 * Instance method to compare passwords
 * @param {string} candidatePassword - Plain text password to compare
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

/**
 * Instance method to check if password was changed after token was issued
 * @param {number} jwtTimestamp - JWT issued timestamp
 * @returns {boolean}
 */
userSchema.methods.changedPasswordAfter = function(jwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return jwtTimestamp < changedTimestamp;
  }
  return false;
};

/**
 * Instance method to check if account is locked
 * @returns {boolean}
 */
userSchema.methods.isLocked = function() {
  return this.status === 'suspended';
};

/**
 * Instance method to increment login attempts
 */
userSchema.methods.incLoginAttempts = function() {
  // Reset attempts if last attempt was more than 2 hours ago
  if (this.loginAttempts.lastAttempt && 
      Date.now() - this.loginAttempts.lastAttempt > 2 * 60 * 60 * 1000) {
    return this.updateOne({
      $set: { 
        'loginAttempts.count': 1, 
        'loginAttempts.lastAttempt': new Date() 
      }
    });
  }
  
  // Increment attempts
  return this.updateOne({
    $inc: { 'loginAttempts.count': 1 },
    $set: { 'loginAttempts.lastAttempt': new Date() }
  });
};

/**
 * Reset login attempts on successful login
 */
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $set: { 
      'loginAttempts.count': 0, 
      lastLogin: new Date() 
    }
  });
};

/**
 * Static method to find user by email with password
 * @param {string} email - User email
 * @returns {Promise<User>}
 */
userSchema.statics.findByEmailWithPassword = function(email) {
  return this.findOne({ email }).select('+passwordHash');
};

/**
 * Static method to check if email exists
 * @param {string} email - User email
 * @returns {Promise<boolean>}
 */
userSchema.statics.emailExists = async function(email) {
  const user = await this.findOne({ email });
  return !!user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
