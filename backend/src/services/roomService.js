const mongoose = require('mongoose');
const Room = require('../models/Room');
const Hostel = require('../models/Hostel');

/**
 * Room Service - Business Logic Layer
 */

/**
 * Validate room input
 */
const validateRoomInput = (data) => {
  const errors = [];
  
  if (!data.roomNumber) {
    errors.push('Room number is required');
  }
  
  if (!data.roomType || !['single', 'double', 'triple', 'quad', 'studio', 'bedspace'].includes(data.roomType)) {
    errors.push('Valid room type is required');
  }
  
  if (!data.capacity || data.capacity < 1 || data.capacity > 10) {
    errors.push('Capacity must be between 1 and 10');
  }
  
  if (data.price && (!data.price.amount || data.price.amount < 0)) {
    errors.push('Valid price is required');
  }
  
  return errors;
};

/**
 * Create a new room
 * @param {string} hostelId - Hostel ID
 * @param {Object} data - Room data
 * @param {string} userId - Landlord's user ID
 * @returns {Promise<Object>} Created room
 */
const createRoom = async (hostelId, data, userId) => {
  // Validate hostel exists and belongs to landlord
  const hostel = await Hostel.findById(hostelId);
  
  if (!hostel) {
    throw new Error('Hostel not found');
  }
  
  // Ownership check
  if (hostel.landlordId.toString() !== userId) {
    throw new Error('Not authorized to add rooms to this hostel');
  }
  
  // Check hostel status
  if (!hostel.isActive) {
    throw new Error('Cannot add rooms to an inactive hostel. Please contact support if you believe this is an error.');
  }

  if (hostel.verificationStatus !== 'approved') {
    if (hostel.verificationStatus === 'pending') {
      throw new Error('Cannot add rooms to a hostel that is pending approval. Your hostel must be reviewed and approved by an administrator before you can add rooms. Please wait for approval or contact support.');
    } else if (hostel.verificationStatus === 'rejected') {
      throw new Error('Cannot add rooms to a rejected hostel. Your hostel application was not approved. Please review the rejection notes and resubmit for approval.');
    } else {
      throw new Error('Cannot add rooms to an unapproved hostel');
    }
  }
  
  // Check for duplicate room number
  const existingRoom = await Room.findOne({ hostelId, roomNumber: data.roomNumber });
  if (existingRoom) {
    throw new Error('Room number already exists in this hostel');
  }
  
  const room = new Room({
    ...data,
    hostelId
  });
  
  await room.save();
  
  // Populate hostel info
  await room.populate('hostelId', 'name');
  
  return room;
};

/**
 * Get rooms for a hostel with role-based filtering
 */
const getRoomsByHostel = async (hostelId, options, role, userId) => {
  const { page = 1, limit = 20, sort, ...filters } = options;
  const skip = (page - 1) * limit;
  
  // Verify hostel exists
  const hostel = await Hostel.findById(hostelId);
  if (!hostel) {
    throw new Error('Hostel not found');
  }
  
  // Role-based query
  let query = { hostelId };
  
  if (role === 'student' || role === 'public') {
    // Students: only active, available rooms
    query.isActive = true;
    query.isAvailable = true;
  } else if (role === 'landlord') {
    // Landlord: only their hostel's rooms
    if (hostel.landlordId.toString() !== userId) {
      throw new Error('Not authorized to view rooms in this hostel');
    }
  }
  // Admin: sees all rooms
  
  // Apply filters
  if (filters.roomType) query.roomType = filters.roomType;
  if (filters.minPrice) query['price.amount'] = { $gte: filters.minPrice };
  if (filters.maxPrice) query['price.amount'] = { $lte: filters.maxPrice };
  if (filters.minCapacity) query.capacity = { $gte: filters.minCapacity };
  
  const [rooms, total] = await Promise.all([
    Room.find(query)
      .sort(sort || { roomNumber: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Room.countDocuments(query)
  ]);
  
  return {
    rooms,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get single room by ID
 */
const getRoomById = async (roomId, role, userId) => {
  const room = await Room.findById(roomId).populate('hostelId');
  
  if (!room) {
    throw new Error('Room not found');
  }
  
  const hostel = room.hostelId;
  
  // Role-based access
  if (role === 'student' || role === 'public') {
    // Check if room and hostel are active and approved
    if (!room.isActive || !hostel.isActive || hostel.verificationStatus !== 'approved') {
      throw new Error('Room not available');
    }
  } else if (role === 'landlord') {
    // Check ownership
    if (hostel.landlordId.toString() !== userId) {
      throw new Error('Not authorized to view this room');
    }
  }
  
  return room;
};

/**
 * Update room
 */
const updateRoom = async (roomId, data, userId, role) => {
  const room = await Room.findById(roomId).populate('hostelId');
  
  if (!room) {
    throw new Error('Room not found');
  }
  
  const hostel = room.hostelId;
  const isOwner = hostel.landlordId.toString() === userId;
  
  if (!isOwner && role !== 'admin') {
    throw new Error('Not authorized to update this room');
  }
  
  // Check if disabled
  if (!room.isActive && role !== 'admin') {
    throw new Error('Cannot update a disabled room');
  }
  
  // Prevent updates to certain fields if room has occupants
  if (room.currentOccupancy > 0) {
    const blockedFields = ['capacity', 'roomType'];
    blockedFields.forEach(field => {
      if (data[field] !== undefined) {
        delete data[field];
      }
    });
  }
  
  // Update allowed fields
  const allowedUpdates = [
    'roomNumber', 'roomType', 'description', 'capacity',
    'price', 'amenities', 'images', 'features'
  ];
  
  allowedUpdates.forEach(field => {
    if (data[field] !== undefined) {
      room[field] = data[field];
    }
  });
  
  await room.save();
  
  return room;
};

/**
 * Soft delete (disable) room
 */
const disableRoom = async (roomId, userId, reason, role) => {
  const room = await Room.findById(roomId).populate('hostelId');
  
  if (!room) {
    throw new Error('Room not found');
  }
  
  const hostel = room.hostelId;
  const isOwner = hostel.landlordId.toString() === userId;
  
  if (!isOwner && role !== 'admin') {
    throw new Error('Not authorized to disable this room');
  }
  
  room.isActive = false;
  room.isAvailable = false;
  room.disabledAt = new Date();
  room.disabledBy = userId;
  room.disableReason = reason;
  
  await room.save();
  
  return room;
};

/**
 * Enable room
 */
const enableRoom = async (roomId, userId, role) => {
  const room = await Room.findById(roomId).populate('hostelId');
  
  if (!room) {
    throw new Error('Room not found');
  }
  
  const hostel = room.hostelId;
  const isOwner = hostel.landlordId.toString() === userId;
  
  if (!isOwner && role !== 'admin') {
    throw new Error('Not authorized to enable this room');
  }
  
  room.isActive = true;
  room.disabledAt = undefined;
  room.disabledBy = undefined;
  room.disableReason = undefined;
  
  // Auto-set availability based on occupancy
  room.isAvailable = room.currentOccupancy < room.capacity;
  
  await room.save();
  
  return room;
};

/**
 * Toggle availability
 */
const toggleAvailability = async (roomId, isAvailable, userId, role) => {
  const room = await Room.findById(roomId).populate('hostelId');
  
  if (!room) {
    throw new Error('Room not found');
  }
  
  const hostel = room.hostelId;
  const isOwner = hostel.landlordId.toString() === userId;
  
  if (!isOwner && role !== 'admin') {
    throw new Error('Not authorized to update this room');
  }
  
  if (!room.isActive) {
    throw new Error('Cannot update availability of a disabled room');
  }
  
  room.isAvailable = isAvailable;
  await room.save();
  
  return room;
};

/**
 * Delete room permanently
 */
const deleteRoom = async (roomId) => {
  await Room.findByIdAndDelete(roomId);
};

module.exports = {
  validateRoomInput,
  createRoom,
  getRoomsByHostel,
  getRoomById,
  updateRoom,
  disableRoom,
  enableRoom,
  toggleAvailability,
  deleteRoom
};
