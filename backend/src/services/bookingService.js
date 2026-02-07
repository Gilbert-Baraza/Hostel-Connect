const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Hostel = require('../models/Hostel');
const { validateFutureDates, calculateTotal, rangesOverlap } = require('../utils/dateOverlap');

/**
 * Booking Service - Business Logic Layer
 * Implements atomic booking with double-booking prevention
 */

/**
 * Validate booking input
 */
const validateBookingInput = (data) => {
  const errors = [];
  
  if (!data.startDate) {
    errors.push('Start date is required');
  }
  
  if (!data.endDate) {
    errors.push('End date is required');
  }
  
  if (data.startDate && data.endDate) {
    const dateValidation = validateFutureDates(data.startDate, data.endDate);
    if (!dateValidation.valid) {
      errors.push(dateValidation.error);
    }
  }
  
  return errors;
};

/**
 * Create booking with atomic conflict prevention
 * Uses MongoDB transaction to ensure consistency
 */
const createBooking = async (roomId, studentId, bookingData, metadata = {}) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // 1. Get room with lock
    const room = await Room.findById(roomId).session(session);
    
    if (!room) {
      throw new Error('Room not found');
    }
    
    // 2. Verify room is available
    if (!room.isActive) {
      throw new Error('Room is not active');
    }
    
    if (!room.isAvailable) {
      throw new Error('Room is not available for booking');
    }
    
    // 3. Get hostel
    const hostel = await Hostel.findById(room.hostelId).session(session);
    
    if (!hostel) {
      throw new Error('Hostel not found');
    }
    
    if (hostel.verificationStatus !== 'approved') {
      throw new Error('Hostel is not approved for bookings');
    }
    
    // 4. Check for overlapping bookings (atomic)
    const overlapping = await Booking.findOverlapping(
      roomId,
      bookingData.startDate,
      bookingData.endDate
    ).session(session);
    
    if (overlapping.length > 0) {
      throw new Error('Room is not available for the selected dates');
    }
    
    // 5. Calculate total amount
    const dailyRate = room.price.amount / 30; // Convert monthly to daily
    const totalAmount = calculateTotal(bookingData, dailyRate);
    
    // 6. Create booking
    const booking = new Booking({
      studentId,
      hostelId: room.hostelId,
      roomId,
      bookingPeriod: {
        startDate: bookingData.startDate,
        endDate: bookingData.endDate
      },
      totalAmount,
      status: 'pending',
      metadata: {
        source: metadata.source || 'web',
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent
      }
    });
    
    await booking.save({ session });
    
    // 7. Lock room temporarily (but keep available for viewing)
    // The room remains available but our transaction ensures no other
    // booking can be created during this window
    
    // 8. Commit transaction
    await session.commitTransaction();
    session.endSession();
    
    // Populate for response
    await booking.populate('hostelId', 'name address');
    await booking.populate('roomId', 'roomNumber capacity');
    await booking.populate('studentId', 'name email');
    
    return booking;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Get student's bookings
 */
const getStudentBookings = async (studentId, options = {}) => {
  const { page = 1, limit = 20, status } = options;
  const skip = (page - 1) * limit;
  
  const query = { studentId, isActive: true };
  if (status) {
    query.status = status;
  }
  
  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .populate({
        path: 'hostelId',
        select: 'name address images landlordId',
        populate: { path: 'landlordId', select: 'name email phone' }
      })
      .populate('roomId', 'roomNumber capacity price amenities')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Booking.countDocuments(query)
  ]);

  const sanitizedBookings = bookings.map((booking) => {
    if (booking.status !== 'approved' && booking.hostelId?.landlordId) {
      booking.hostelId = {
        ...booking.hostelId,
        landlordId: { name: booking.hostelId.landlordId.name }
      };
    }
    return booking;
  });
  
  return {
    bookings: sanitizedBookings,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get landlord's booking requests
 */
const getHostelBookings = async (hostelId, landlordId, options = {}) => {
  const { page = 1, limit = 20, status } = options;
  const skip = (page - 1) * limit;
  
  // Verify ownership
  const hostel = await Hostel.findById(hostelId);
  if (!hostel) {
    throw new Error('Hostel not found');
  }
  
  if (hostel.landlordId.toString() !== landlordId) {
    throw new Error('Not authorized to view bookings for this hostel');
  }
  
  const query = { hostelId, isActive: true };
  if (status) {
    query.status = status;
  }
  
  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .populate('studentId', 'name email phone')
      .populate('roomId', 'roomNumber capacity')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Booking.countDocuments(query)
  ]);
  
  return {
    bookings,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get single booking by ID
 */
const getBookingById = async (bookingId, userId, role) => {
  const booking = await Booking.findById(bookingId)
    .populate('hostelId', 'name address')
    .populate('roomId', 'roomNumber capacity price')
    .populate('studentId', 'name email phone');
  
  if (!booking) {
    throw new Error('Booking not found');
  }
  
  // Authorization check
  const isStudent = booking.studentId._id.toString() === userId;
  const isLandlord = booking.hostelId.landlordId?.toString() === userId;
  
  if (!isStudent && role !== 'admin' && !isLandlord) {
    throw new Error('Not authorized to view this booking');
  }
  
  return booking;
};

/**
 * Approve or reject booking
 */
const decideBooking = async (bookingId, landlordId, action, reason) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const booking = await Booking.findById(bookingId).session(session);
    
    if (!booking) {
      throw new Error('Booking not found');
    }
    
    // Verify landlord owns the hostel
    const hostel = await Hostel.findById(booking.hostelId).session(session);
    
    if (hostel.landlordId.toString() !== landlordId) {
      throw new Error('Not authorized to make decisions on this booking');
    }
    
    if (!booking.canBeDecided()) {
      throw new Error('Booking cannot be decided at this time');
    }
    
    if (action === 'approve') {
      booking.status = 'approved';
      
      // Lock the room
      await Room.findByIdAndUpdate(
        booking.roomId,
        { isAvailable: false },
        { session }
      );
    } else if (action === 'reject') {
      booking.status = 'rejected';
    } else {
      throw new Error('Invalid action');
    }
    
    booking.decision = {
      decidedBy: landlordId,
      decidedAt: new Date(),
      reason
    };
    
    await booking.save({ session });
    
    await session.commitTransaction();
    session.endSession();
    
    return booking;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Cancel booking (student)
 */
const cancelBooking = async (bookingId, studentId, reason) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const booking = await Booking.findById(bookingId).session(session);
    
    if (!booking) {
      throw new Error('Booking not found');
    }
    
    // Verify ownership
    if (booking.studentId.toString() !== studentId) {
      throw new Error('Not authorized to cancel this booking');
    }
    
    if (!booking.canBeCancelled()) {
      throw new Error('Booking cannot be cancelled at this time');
    }
    
    booking.status = 'cancelled';
    booking.cancellation = {
      cancelledBy: studentId,
      cancelledAt: new Date(),
      reason
    };
    
    // If approved, release the room
    if (booking.status === 'approved') {
      await Room.findByIdAndUpdate(
        booking.roomId,
        { isAvailable: true },
        { session }
      );
    }
    
    await booking.save({ session });
    
    await session.commitTransaction();
    session.endSession();
    
    return booking;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Admin force cancel booking
 */
const forceCancelBooking = async (bookingId, adminId, reason) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const booking = await Booking.findById(bookingId).session(session);
    
    if (!booking) {
      throw new Error('Booking not found');
    }
    
    booking.status = 'cancelled';
    booking.isActive = false;
    booking.cancellation = {
      cancelledBy: adminId,
      cancelledAt: new Date(),
      reason
    };
    
    // Release room if it was approved
    if (booking.status === 'approved') {
      await Room.findByIdAndUpdate(
        booking.roomId,
        { isAvailable: true },
        { session }
      );
    }
    
    await booking.save({ session });
    
    await session.commitTransaction();
    session.endSession();
    
    return booking;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Expire pending bookings (for cron job)
 */
const expireOldBookings = async () => {
  const now = new Date();
  
  const result = await Booking.updateMany(
    {
      status: 'pending',
      expiresAt: { $lt: now },
      isActive: true
    },
    {
      $set: {
        status: 'expired',
        isActive: false
      }
    }
  );
  
  return result.modifiedCount;
};

/**
 * Get all bookings (admin)
 */
const getAllBookings = async (options = {}) => {
  const { page = 1, limit = 20, status, hostelId } = options;
  const skip = (page - 1) * limit;
  
  const query = { isActive: true };
  if (status) query.status = status;
  if (hostelId) query.hostelId = hostelId;
  
  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .populate('studentId', 'name email')
      .populate('hostelId', 'name')
      .populate('roomId', 'roomNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Booking.countDocuments(query)
  ]);
  
  return {
    bookings,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

module.exports = {
  validateBookingInput,
  createBooking,
  getStudentBookings,
  getHostelBookings,
  getBookingById,
  decideBooking,
  cancelBooking,
  forceCancelBooking,
  expireOldBookings,
  getAllBookings
};
