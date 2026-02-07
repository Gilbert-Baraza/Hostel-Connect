const Hostel = require('../models/Hostel');

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
  
  await hostel.save();
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
    // Students/public: only approved and active
    query.verificationStatus = 'approved';
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
  if (filters.verificationStatus && role !== 'student') {
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
  
  return {
    hostels,
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
  
  // Role-based sanitization
  if (role === 'student') {
    // Hide landlord contact info from students
    const sanitized = hostel.toObject();
    sanitized.landlordId = {
      name: hostel.landlordId.name
    };
    return sanitized;
  }
  
  if (role === 'landlord') {
    // Landlord sees their own hostels fully, others sanitized
    if (hostel.isOwnedBy(userId)) {
      return hostel;
    }
    // Other landlords see sanitized version
    const sanitized = hostel.toObject();
    sanitized.landlordId = {
      name: hostel.landlordId.name
    };
    return sanitized;
  }
  
  // Admin sees everything
  return hostel;
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
const disableHostel = async (id, adminId) => {
  const hostel = await Hostel.findById(id);
  
  if (!hostel) {
    throw new Error('Hostel not found');
  }
  
  hostel.isActive = false;
  hostel.verificationNotes = {
    ...hostel.verificationNotes,
    reviewedBy: adminId,
    reviewedAt: new Date(),
    adminComments: 'Disabled by admin'
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
const enableHostel = async (id, adminId) => {
  const hostel = await Hostel.findById(id);
  
  if (!hostel) {
    throw new Error('Hostel not found');
  }
  
  hostel.isActive = true;
  hostel.verificationNotes = {
    ...hostel.verificationNotes,
    reviewedBy: adminId,
    reviewedAt: new Date(),
    adminComments: 'Enabled by admin'
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
