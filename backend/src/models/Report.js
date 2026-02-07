const mongoose = require('mongoose');

/**
 * Report Schema for user-reported issues and fraud flags
 */
const reportSchema = new mongoose.Schema({
  hostelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: [true, 'Hostel ID is required'],
    index: true
  },
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reporter ID is required'],
    index: true
  },
  reason: {
    type: String,
    enum: [
      'fake_listing',
      'pricing_issue',
      'harassment',
      'safety_concern',
      'scam',
      'property_condition',
      'other'
    ],
    required: [true, 'Report reason is required']
  },
  description: {
    type: String,
    required: [true, 'Report description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending',
    index: true
  },
  adminNotes: {
    type: String
  },
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

reportSchema.index({ status: 1, createdAt: -1 });

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
