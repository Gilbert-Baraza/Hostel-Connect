const bookingService = require('../services/bookingService');

/**
 * Create Booking Controller
 * POST /rooms/:roomId/book
 */
exports.createBooking = async (req, res) => {
  try {
    const { roomId } = req.params;
    const studentId = req.userId;
    
    // Validate input
    const errors = bookingService.validateBookingInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    const { startDate, endDate } = req.body;

    const booking = await bookingService.createBooking(
      roomId,
      studentId,
      { startDate, endDate },
      {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    );

    res.status(201).json({
      success: true,
      message: 'Booking created successfully. Awaiting landlord approval.',
      data: { booking }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    
    if (error.message === 'Room not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message.includes('not available') || error.message.includes('Not authorized')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'An error occurred while creating the booking'
    });
  }
};

/**
 * Get Student Bookings Controller
 * GET /bookings/my
 */
exports.getMyBookings = async (req, res) => {
  try {
    const { page, limit, status } = req.query;
    const studentId = req.userId;

    const result = await bookingService.getStudentBookings(studentId, {
      page,
      limit,
      status
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching bookings'
    });
  }
};

/**
 * Get Hostel Bookings Controller
 * GET /hostels/:hostelId/bookings
 */
exports.getHostelBookings = async (req, res) => {
  try {
    const { hostelId } = req.params;
    const { page, limit, status } = req.query;
    const landlordId = req.userId;

    const result = await bookingService.getHostelBookings(
      hostelId,
      landlordId,
      { page, limit, status }
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get hostel bookings error:', error);
    
    if (error.message === 'Hostel not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message.includes('Not authorized')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching bookings'
    });
  }
};

/**
 * Get Single Booking Controller
 * GET /bookings/:bookingId
 */
exports.getBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.userId;
    const role = req.userRole;

    const booking = await bookingService.getBookingById(bookingId, userId, role);

    res.json({
      success: true,
      data: { booking }
    });
  } catch (error) {
    console.error('Get booking error:', error);
    
    if (error.message === 'Booking not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message.includes('Not authorized')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching the booking'
    });
  }
};

/**
 * Approve/Reject Booking Controller
 * PATCH /bookings/:bookingId/decision
 */
exports.decideBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { action, reason } = req.body;
    const landlordId = req.userId;

    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be "approve" or "reject"'
      });
    }

    if (action === 'reject' && !reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const booking = await bookingService.decideBooking(
      bookingId,
      landlordId,
      action,
      reason
    );

    res.json({
      success: true,
      message: `Booking ${action}d successfully`,
      data: { booking }
    });
  } catch (error) {
    console.error('Decide booking error:', error);
    
    if (error.message === 'Booking not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message.includes('Not authorized') || error.message.includes('cannot be decided')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing the decision'
    });
  }
};

/**
 * Cancel Booking Controller
 * PATCH /bookings/:bookingId/cancel
 */
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;
    const studentId = req.userId;

    const booking = await bookingService.cancelBooking(bookingId, studentId, reason);

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    
    if (error.message === 'Booking not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message.includes('Not authorized') || error.message.includes('cannot be cancelled')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'An error occurred while cancelling the booking'
    });
  }
};

/**
 * Force Cancel Booking Controller (Admin)
 * PATCH /admin/bookings/:bookingId/force-cancel
 */
exports.forceCancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;
    const adminId = req.userId;

    const booking = await bookingService.forceCancelBooking(bookingId, adminId, reason);

    res.json({
      success: true,
      message: 'Booking force-cancelled successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Force cancel booking error:', error);
    
    if (error.message === 'Booking not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'An error occurred while force-cancelling the booking'
    });
  }
};

/**
 * Get All Bookings Controller (Admin)
 * GET /admin/bookings
 */
exports.getAllBookings = async (req, res) => {
  try {
    const { page, limit, status, hostelId } = req.query;

    const result = await bookingService.getAllBookings({
      page,
      limit,
      status,
      hostelId
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching bookings'
    });
  }
};

/**
 * Expire Bookings Controller (For cron job)
 * POST /bookings/expire
 */
exports.expireBookings = async (req, res) => {
  try {
    const count = await bookingService.expireOldBookings();

    res.json({
      success: true,
      message: `Expired ${count} bookings`
    });
  } catch (error) {
    console.error('Expire bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while expiring bookings'
    });
  }
};
