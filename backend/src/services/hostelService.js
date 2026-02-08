const Hostel = require('../models/Hostel');
const Room = require('../models/Room');
const { geocodeAddress } = require('./geocodingService');
const Review = require('../models/Review');
const { queueAdminNotification, queueNotification } = require('./notificationService');

const DEFAULT_ROOM_STATS = Object.freeze({
  roomsCount: 0,
  roomsAvailable: 0,
  capacity: 0
});

const DEFAULT_REVIEW_STATS = Object.freeze({
  rating: 0,
  reviewsCount: 0
});

const hasCoordinateValue = (value) => value !== undefined && value !== null && value !== '';

const shouldGeocode = (address = {}) => {
  const latitude = address?.coordinates?.latitude;
  const longitude = address?.coordinates?.longitude;
  return !(hasCoordinateValue(latitude) && hasCoordinateValue(longitude));
};

const buildGeocodePayload = (data = {}, fallback = {}) => ({
  street: data.address?.street ?? fallback.address?.street,
  city: data.address?.city ?? fallback.address?.city,
  county: data.address?.county ?? fallback.address?.county,
  university: data.university?.name ?? fallback.university?.name,
  country: 'Kenya'
});

const getRoomStatsByHostelIds = async (hostelIds = []) => {
  const ids = (hostelIds || []).filter(Boolean);
  if (ids.length === 0) return new Map();

  const stats = await Room.aggregate([
    { $match: { hostelId: { $in: ids } } },
    {
      $group: {
        _id: '$hostelId',
        roomsCount: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        },
        roomsAvailable: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$isActive', true] },
                  { $eq: ['$isAvailable', true] }
                ]
              },
              1,
              0
            ]
          }
        },
        capacity: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, '$capacity', 0] }
        }
      }
    }
  ]);

  const map = new Map();
  stats.forEach((entry) => {
    map.set(entry._id.toString(), {
      roomsCount: entry.roomsCount || 0,
      roomsAvailable: entry.roomsAvailable || 0,
      capacity: entry.capacity || 0
    });
  });

  return map;
};

const getReviewStatsByHostelIds = async (hostelIds = []) => {
  const ids = (hostelIds || []).filter(Boolean);
  if (ids.length === 0) return new Map();

  const stats = await Review.aggregate([
    { $match: { hostelId: { $in: ids }, isActive: true } },
    {
      $group: {
        _id: '$hostelId',
        averageRating: { $avg: '$rating' },
        reviewsCount: { $sum: 1 }
      }
    }
  ]);

  const map = new Map();
  stats.forEach((entry) => {
    map.set(entry._id.toString(), {
      rating: Number(entry.averageRating?.toFixed(2)) || 0,
      reviewsCount: entry.reviewsCount || 0
    });
  });

  return map;
};

/**
 * Hostel Service - Business Logic Layer
 */

/**
 * Create a new hostel
 * @param {Object} data - Hostel data
 * @param {string} landlordId - Landlord's user ID
 * @returns {Promise<Object>} Created hostel
 */
const createHostel = async (data, landlordId) => {
  const hostel = new Hostel({
    ...data,
    landlordId
  });

  if (shouldGeocode(data.address)) {
    try {
      const coords = await geocodeAddress(buildGeocodePayload(data));
      if (coords) {
        hostel.address = {
          ...hostel.address,
          coordinates: coords
        };
      }
    } catch (error) {
      console.warn('Geocoding failed during hostel creation:', error.message);
    }
  }

  await hostel.save();

  queueAdminNotification({
    title: 'New hostel submitted',
    message: `Hostel "${hostel.name}" was submitted for verification.`,
    type: 'admin'
  });

  return hostel;
};

/**
 * Get hostels with role-based filtering
 * @param {Object} options - Query options
 * @param {string} role - User role
 * @param {string} userId - Current user ID
 * @returns {Promise<Object>} Query result with hostels and pagination
 */
const getHostels = async (options, role, userId) => {
  const { page = 1, limit = 20, sort, ...filters } = options;
  const skip = (page - 1) * limit;
  
  let query = {};
  
  // Role-based filtering
  if (role === 'student' || role === 'public') {
    // Students/public: show non-rejected active listings (pending + approved)
    query.verificationStatus = { $ne: 'rejected' };
    query.isActive = true;
  } else if (role === 'landlord') {
    // Landlords: only their own hostels
    query.landlordId = userId;
  }
  // Admin sees all - no filter needed
  
  // Apply filters
  if (filters.hostelType) query.hostelType = filters.hostelType;
  if (filters.city) query['address.city'] = filters.city;
  if (filters.minPrice) query['pricing.minPrice'] = { $gte: filters.minPrice };
  if (filters.maxPrice) query['pricing.maxPrice'] = { $lte: filters.maxPrice };
  if (filters.verificationStatus && (role === 'admin' || role === 'landlord')) {
    query.verificationStatus = filters.verificationStatus;
  }
  
  // Execute query
  const [hostels, total] = await Promise.all([
    Hostel.find(query)
      .populate('landlordId', 'name email phone')
      .sort(sort || { createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Hostel.countDocuments(query)
  ]);

  const hostelIds = hostels.map((hostel) => hostel._id);
  const [roomStatsByHostel, reviewStatsByHostel] = await Promise.all([
    getRoomStatsByHostelIds(hostelIds),
    getReviewStatsByHostelIds(hostelIds)
  ]);

  const enrichedHostels = hostels.map((hostel) => {
    const stats = roomStatsByHostel.get(String(hostel._id)) || DEFAULT_ROOM_STATS;
    const reviewStats = reviewStatsByHostel.get(String(hostel._id)) || DEFAULT_REVIEW_STATS;
    return {
      ...hostel,
      ...stats,
      ...reviewStats
    };
  });
  
  return {
    hostels: enrichedHostels,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get single hostel by ID with role-based access
 * @param {string} id - Hostel ID
 * @param {string} role - User role
 * @param {string} userId - Current user ID
 * @returns {Promise<Object|null>} Hostel or null
 */
const getHostelById = async (id, role, userId) => {
  const hostel = await Hostel.findById(id)
    .populate('landlordId', 'name email phone');
  
  if (!hostel) return null;
  
  // Increment view count
  hostel.statistics.totalViews += 1;
  await hostel.save();
  
  const [roomStatsByHostel, reviewStatsByHostel] = await Promise.all([
    getRoomStatsByHostelIds([hostel._id]),
    getReviewStatsByHostelIds([hostel._id])
  ]);
  const roomStats = roomStatsByHostel.get(String(hostel._id)) || DEFAULT_ROOM_STATS;
  const reviewStats = reviewStatsByHostel.get(String(hostel._id)) || DEFAULT_REVIEW_STATS;
  const enrichedHostel = {
    ...hostel.toObject(),
    ...roomStats,
    ...reviewStats
  };

  // Role-based sanitization
  if (role === 'student') {
    // Hide landlord contact info from students
    enrichedHostel.landlordId = {
      name: hostel.landlordId?.name
    };
    return enrichedHostel;
  }
  
  if (role === 'landlord') {
    // Landlord sees their own hostels fully, others sanitized
    if (hostel.isOwnedBy(userId)) {
      return enrichedHostel;
    }
    // Other landlords see sanitized version
    return {
      ...enrichedHostel,
      landlordId: {
        name: hostel.landlordId?.name
      }
    };
  }
  
  // Admin sees everything
  return enrichedHostel;
};

/**
 * Update hostel with ownership check
 * @param {string} id - Hostel ID
 * @param {Object} data - Update data
 * @param {string} userId - Current user ID
 * @param {string} role - User role
 * @returns {Promise<Object>} Updated hostel
 */
const updateHostel = async (id, data, userId, role) => {
  const hostel = await Hostel.findById(id);
  
  if (!hostel) {
    throw new Error('Hostel not found');
  }
  
  // Ownership check
  const isOwner = hostel.isOwnedBy(userId);
  
  if (!isOwner && role !== 'admin') {
    throw new Error('Not authorized to update this hostel');
  }
  
  // Prevent updates if hostel is disabled (non-admin)
  if (!hostel.isActive && role !== 'admin') {
    throw new Error('Cannot update a disabled hostel');
  }
  
  // Update fields (prevent mass assignment)
  const allowedUpdates = [
    'name', 'description', 'address', 'distanceFromCampus', 'university',
    'hostelType', 'amenities', 'images', 'pricing', 'houseRules', 'isActive'
  ];
  
  allowedUpdates.forEach(field => {
    if (data[field] !== undefined) {
      hostel[field] = data[field];
    }
  });

  const addressUpdated = data.address !== undefined;
  const universityUpdated = data.university !== undefined;
  const coordinatesProvided = hasCoordinateValue(data.address?.coordinates?.latitude) &&
    hasCoordinateValue(data.address?.coordinates?.longitude);

  if ((addressUpdated || universityUpdated) && !coordinatesProvided) {
    const addressToCheck = addressUpdated ? data.address : hostel.address;
    if (shouldGeocode(addressToCheck)) {
      try {
        const coords = await geocodeAddress(buildGeocodePayload(data, hostel));
        if (coords) {
          hostel.address = {
            ...hostel.address,
            coordinates: coords
          };
        }
      } catch (error) {
        console.warn('Geocoding failed during hostel update:', error.message);
      }
    }
  }
  
  // Reset verification status if edited by landlord (excluding simple active toggle)
  if (isOwner) {
    const updateKeys = Object.keys(data || {});
    const requiresVerification = updateKeys.some((key) => key !== 'isActive');
    if (requiresVerification) {
      hostel.verificationStatus = 'pending';
    }
  }
  
  await hostel.save();
  return hostel;
};

/**
 * Disable hostel (soft delete)
 * @param {string} id - Hostel ID
 * @param {string} adminId - Admin user ID
 * @returns {Promise<Object>} Updated hostel
 */
const disableHostel = async (id, adminId, reason) => {
  const hostel = await Hostel.findById(id);
  
  if (!hostel) {
    throw new Error('Hostel not found');
  }
  
  hostel.isActive = false;
  hostel.verificationNotes = {
    ...hostel.verificationNotes,
    reviewedBy: adminId,
    reviewedAt: new Date(),
    adminComments: reason ? `Disabled by admin: ${reason}` : 'Disabled by admin'
  };
  
  await hostel.save();
  return hostel;
};

/**
 * Enable hostel
 * @param {string} id - Hostel ID
 * @param {string} adminId - Admin user ID
 * @returns {Promise<Object>} Updated hostel
 */
const enableHostel = async (id, adminId, reason) => {
  const hostel = await Hostel.findById(id);
  
  if (!hostel) {
    throw new Error('Hostel not found');
  }
  
  hostel.isActive = true;
  hostel.verificationNotes = {
    ...hostel.verificationNotes,
    reviewedBy: adminId,
    reviewedAt: new Date(),
    adminComments: reason ? `Enabled by admin: ${reason}` : 'Enabled by admin'
  };
  
  await hostel.save();
  return hostel;
};

/**
 * Verify or reject hostel
 * @param {string} id - Hostel ID
 * @param {string} status - Verification status ('approved' or 'rejected')
 * @param {string} adminId - Admin user ID
 * @param {string} reason - Rejection reason (if applicable)
 * @returns {Promise<Object>} Updated hostel
 */
const verifyHostel = async (id, status, adminId, reason) => {
  if (!['approved', 'rejected'].includes(status)) {
    throw new Error('Invalid verification status');
  }
  
  const hostel = await Hostel.findById(id);
  
  if (!hostel) {
    throw new Error('Hostel not found');
  }
  
  hostel.verificationStatus = status;
  hostel.verificationNotes = {
    reviewedBy: adminId,
    reviewedAt: new Date(),
    rejectionReason: status === 'rejected' ? reason : undefined,
    adminComments: status === 'approved' ? 'Verified by admin' : 'Rejected by admin'
  };
  
  await hostel.save();

  if (hostel.landlordId) {
    if (status === 'approved') {
      queueNotification({
        userId: hostel.landlordId,
        title: 'Hostel approved',
        message: `Your hostel "${hostel.name}" has been approved and is now live.`,
        type: 'admin'
      });
    } else {
      const rejectionReason = reason ? String(reason).trim() : 'No reason provided';
      queueNotification({
        userId: hostel.landlordId,
        title: 'Hostel rejected',
        message: `Your hostel "${hostel.name}" was rejected. Reason: ${rejectionReason}.`,
        type: 'admin'
      });
    }
  }

  return hostel;
};

/**
 * Delete hostel permanently
 * @param {string} id - Hostel ID
 * @returns {Promise<void>}
 */
const deleteHostel = async (id) => {
  await Hostel.findByIdAndDelete(id);
};

module.exports = {
  createHostel,
  getHostels,
  getHostelById,
  updateHostel,
  disableHostel,
  enableHostel,
  verifyHostel,
  deleteHostel
};
