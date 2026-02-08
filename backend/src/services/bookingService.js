const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Hostel = require('../models/Hostel');
const { queueNotification } = require('./notificationService');

const buildBookingLabel = (hostel, room) => {
  const hostelName = hostel?.name || 'the hostel';
  const roomLabel = room?.roomNumber ? `Room ${room.roomNumber}` : 'the selected room';
  return `${hostelName} (${roomLabel})`;
};

const queueBookingSubmittedNotifications = ({ booking, hostel, room }) => {
  if (!booking || !hostel || !room) return;

  const bookingLabel = buildBookingLabel(hostel, room);
  const studentId = booking.studentId?._id || booking.studentId;
  const landlordId = hostel.landlordId;

  if (studentId) {
    queueNotification({
      userId: studentId,
      title: 'Booking request submitted',
      message: `Your booking request for ${bookingLabel} was submitted and is awaiting approval.`,
      type: 'booking'
    });
  }

  if (landlordId) {
    const studentName = booking.studentId?.name || 'A student';
    queueNotification({
      userId: landlordId,
      title: 'New booking request',
      message: `${studentName} submitted a booking request for ${bookingLabel}.`,
      type: 'booking'
    });
  }
};

const queueBookingDecisionNotification = ({ booking, hostel }, action) => {
  if (!booking || !hostel || !action) return;
  const studentId = booking.studentId?._id || booking.studentId;
  if (!studentId) return;

  const hostelName = hostel?.name || 'the hostel';
  const statusLabel = action === 'approve' ? 'approved' : 'rejected';

  queueNotification({
    userId: studentId,
    title: `Booking ${statusLabel}`,
    message: `Your booking request for ${hostelName} was ${statusLabel}.`,
    type: 'booking'
  });
};

const queueBookingCancellationNotifications = ({ booking, hostel }) => {
  if (!booking || !hostel) return;
  const studentId = booking.studentId?._id || booking.studentId;
  const landlordId = hostel.landlordId;
  const hostelName = hostel?.name || 'the hostel';

  if (studentId) {
    queueNotification({
      userId: studentId,
      title: 'Booking cancelled',
      message: `Your booking request for ${hostelName} has been cancelled.`,
      type: 'booking'
    });
  }

  if (landlordId) {
    queueNotification({
      userId: landlordId,
      title: 'Booking cancelled by student',
      message: `A booking request for ${hostelName} was cancelled by the student.`,
      type: 'booking'
    });
  }
};

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
  
  return errors;
};

/**
 * Create booking with atomic conflict prevention
 * Uses MongoDB transaction when available (replica set); falls back otherwise.
 */
const createBooking = async (roomId, studentId, bookingData, metadata = {}) => {
  const MAX_RETRIES = 3;

  const isRetryable = (error) => {
    if (!error) return false;
    if (error.errorLabels && error.errorLabels.includes('TransientTransactionError')) return true;
    if (error.errorLabels && error.errorLabels.includes('UnknownTransactionCommitResult')) return true;
    return error.code === 112 || `${error.message}`.toLowerCase().includes('write conflict');
  };

  const createBookingWithSession = async (session) => {
    const sessionOption = session ? { session } : {};
    // 1. Get room with lock
    const room = session
      ? await Room.findById(roomId).session(session)
      : await Room.findById(roomId);

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
    const hostel = session
      ? await Hostel.findById(room.hostelId).session(session)
      : await Hostel.findById(room.hostelId);

    if (!hostel) {
      throw new Error('Hostel not found');
    }

    if (hostel.verificationStatus !== 'approved') {
      throw new Error('Hostel is not approved for bookings');
    }

    // 4. Acquire per-room booking lock (write-conflict guard)
      const lockResult = await Room.updateOne(
        { _id: roomId },
        { $inc: { bookingVersion: 1 } },
        sessionOption
      );

    if (!lockResult || lockResult.modifiedCount !== 1) {
      throw new Error('Unable to secure room for booking');
    }

    const startDate = new Date(bookingData.startDate);

    // 5. Check for duplicate booking on same date (atomic)
    const duplicateQuery = await Booking.findDuplicate(
      roomId,
      startDate
    );
    const duplicate = session ? duplicateQuery.session(session) : duplicateQuery;

    if (duplicate.length > 0) {
      throw new Error('Room is already booked for the selected date');
    }

    // 6. Create booking (no totalAmount - pay at reception)
    const booking = new Booking({
      studentId,
      hostelId: room.hostelId,
      roomId,
      bookingPeriod: {
        startDate
      },
      status: 'pending',
      metadata: {
        source: metadata.source || 'web',
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent
      }
    });

    await booking.save(sessionOption);

    // Populate for response
    await booking.populate('hostelId', 'name address');
    await booking.populate('roomId', 'roomNumber capacity');
    await booking.populate('studentId', 'name email');

    return { booking, hostel, room };
  };

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const result = await createBookingWithSession(session);
      await session.commitTransaction();
      queueBookingSubmittedNotifications(result);
      return result.booking;
    } catch (error) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        // ignore abort errors
      }

      const message = `${error?.message || ''}`.toLowerCase();
      const isTransactionUnsupported =
        message.includes('transaction numbers are only allowed') ||
        message.includes('replica set') ||
        message.includes('mongos');

      if (isTransactionUnsupported) {
        session.endSession();
        break;
      }

      if (attempt < MAX_RETRIES && isRetryable(error)) {
        session.endSession();
        continue;
      }
      session.endSession();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Fallback: no transactions available (standalone MongoDB)
  const result = await createBookingWithSession(null);
  queueBookingSubmittedNotifications(result);
  return result.booking;
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
  } else {
    query.status = { $in: ['pending', 'approved'] };
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
    .populate('hostelId', 'name address landlordId')
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

  const decideWithSession = async (sessionToUse) => {
    const sessionOption = sessionToUse ? { session: sessionToUse } : {};
    const booking = sessionToUse
      ? await Booking.findById(bookingId).session(sessionToUse)
      : await Booking.findById(bookingId);

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Verify landlord owns the hostel
    const hostel = sessionToUse
      ? await Hostel.findById(booking.hostelId).session(sessionToUse)
      : await Hostel.findById(booking.hostelId);

    if (hostel.landlordId.toString() !== landlordId) {
      throw new Error('Not authorized to make decisions on this booking');
    }

    if (!booking.canBeDecided()) {
      throw new Error('Booking cannot be decided at this time');
    }

    const sanitizedReason = reason ? String(reason).trim() : undefined;

    if (action === 'approve') {
      const room = sessionToUse
        ? await Room.findById(booking.roomId).session(sessionToUse)
        : await Room.findById(booking.roomId);
      if (!room || !room.isActive || !room.isAvailable) {
        throw new Error('Room is not available for approval');
      }

      // Check if room is already booked for this date
      const duplicateQuery = await Booking.findDuplicate(
        booking.roomId,
        booking.bookingPeriod.startDate,
        booking._id
      );
      const duplicate = sessionToUse
        ? duplicateQuery.session(sessionToUse)
        : duplicateQuery;

      if (duplicate.length > 0) {
        throw new Error('Room is already booked for this date');
      }

      booking.status = 'approved';

      // Lock the room
      await Room.findByIdAndUpdate(
        booking.roomId,
        { isAvailable: false },
        sessionOption
      );
    } else if (action === 'reject') {
      booking.status = 'rejected';
    } else {
      throw new Error('Invalid action');
    }

    booking.decision = {
      decidedBy: landlordId,
      decidedAt: new Date(),
      reason: sanitizedReason
    };

    await booking.save(sessionOption);
    return { booking, hostel };
  };

  try {
    session.startTransaction();
    const result = await decideWithSession(session);
    await session.commitTransaction();
    queueBookingDecisionNotification(result, action);
    return result.booking;
  } catch (error) {
    try {
      await session.abortTransaction();
    } catch (abortError) {
      // ignore abort errors
    }

    const message = `${error?.message || ''}`.toLowerCase();
    const isTransactionUnsupported =
      message.includes('transaction numbers are only allowed') ||
      message.includes('replica set') ||
      message.includes('mongos');

    if (isTransactionUnsupported) {
      const result = await decideWithSession(null);
      queueBookingDecisionNotification(result, action);
      return result.booking;
    }

    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Cancel booking (student)
 */
const cancelBooking = async (bookingId, studentId, reason) => {
  const session = await mongoose.startSession();

  const cancelWithSession = async (sessionToUse) => {
    const sessionOption = sessionToUse ? { session: sessionToUse } : {};
    const booking = sessionToUse
      ? await Booking.findById(bookingId).session(sessionToUse)
      : await Booking.findById(bookingId);

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

    const wasApproved = booking.status === 'approved';
    const hostel = sessionToUse
      ? await Hostel.findById(booking.hostelId).session(sessionToUse)
      : await Hostel.findById(booking.hostelId);

    booking.status = 'cancelled';
    booking.cancellation = {
      cancelledBy: studentId,
      cancelledAt: new Date(),
      reason: reason ? String(reason).trim() : undefined
    };

    // If approved, release the room
    if (wasApproved) {
      await Room.findByIdAndUpdate(
        booking.roomId,
        { isAvailable: true },
        sessionOption
      );
    }

    await booking.save(sessionOption);
    return { booking, hostel };
  };

  try {
    session.startTransaction();
    const result = await cancelWithSession(session);
    await session.commitTransaction();
    queueBookingCancellationNotifications(result);
    return result.booking;
  } catch (error) {
    try {
      await session.abortTransaction();
    } catch (abortError) {
      // ignore abort errors
    }

    const message = `${error?.message || ''}`.toLowerCase();
    const isTransactionUnsupported =
      message.includes('transaction numbers are only allowed') ||
      message.includes('replica set') ||
      message.includes('mongos');

    if (isTransactionUnsupported) {
      const result = await cancelWithSession(null);
      queueBookingCancellationNotifications(result);
      return result.booking;
    }

    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Admin force cancel booking
 */
const forceCancelBooking = async (bookingId, adminId, reason) => {
  const session = await mongoose.startSession();

  const forceCancelWithSession = async (sessionToUse) => {
    const sessionOption = sessionToUse ? { session: sessionToUse } : {};
    const booking = sessionToUse
      ? await Booking.findById(bookingId).session(sessionToUse)
      : await Booking.findById(bookingId);

    if (!booking) {
      throw new Error('Booking not found');
    }

    const wasApproved = booking.status === 'approved';
    booking.status = 'cancelled';
    booking.isActive = false;
    booking.cancellation = {
      cancelledBy: adminId,
      cancelledAt: new Date(),
      reason: reason ? String(reason).trim() : undefined
    };

    // Release room if it was approved
    if (wasApproved) {
      await Room.findByIdAndUpdate(
        booking.roomId,
        { isAvailable: true },
        sessionOption
      );
    }

    await booking.save(sessionOption);
    return booking;
  };

  try {
    session.startTransaction();
    const booking = await forceCancelWithSession(session);
    await session.commitTransaction();
    return booking;
  } catch (error) {
    try {
      await session.abortTransaction();
    } catch (abortError) {
      // ignore abort errors
    }

    const message = `${error?.message || ''}`.toLowerCase();
    const isTransactionUnsupported =
      message.includes('transaction numbers are only allowed') ||
      message.includes('replica set') ||
      message.includes('mongos');

    if (isTransactionUnsupported) {
      return forceCancelWithSession(null);
    }

    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Expire pending bookings (for cron job)
 */
const expireOldBookings = async () => {
  const now = new Date();

  const expiringBookings = await Booking.find({
    status: 'pending',
    expiresAt: { $lt: now },
    isActive: true
  })
    .populate('hostelId', 'name')
    .select('studentId hostelId bookingPeriod')
    .lean();

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

  expiringBookings.forEach((booking) => {
    const studentId = booking.studentId;
    const hostelName = booking.hostelId?.name || 'the hostel';
    if (!studentId) return;
    queueNotification({
      userId: studentId,
      title: 'Booking expired',
      message: `Your booking request for ${hostelName} has expired. Please submit a new request if needed.`,
      type: 'booking'
    });
  });

  return result.modifiedCount;
};

/**
 * Get all bookings (admin)
 */
const getAllBookings = async (options = {}) => {
  const { page = 1, limit = 20, status, hostelId } = options;
  const skip = (page - 1) * limit;
  
  const query = {};
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
