const roomService = require('../services/roomService');

/**
 * Create Room Controller
 * POST /hostels/:hostelId/rooms
 */
exports.createRoom = async (req, res) => {
  try {
    const { hostelId } = req.params;
    
    // Validate input
    const errors = roomService.validateRoomInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    const room = await roomService.createRoom(hostelId, req.body, req.userId);

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: { room }
    });
  } catch (error) {
    console.error('Create room error:', error);
    
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
    
    if (error.message.includes('already exists')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    // Hostel verification status errors
    if (error.message.includes('pending approval')) {
      return res.status(403).json({
        success: false,
        message: error.message,
        code: 'HOSTEL_PENDING_APPROVAL',
        suggestion: 'Please wait for your hostel to be approved by an administrator before adding rooms.'
      });
    }
    
    if (error.message.includes('rejected hostel')) {
      return res.status(403).json({
        success: false,
        message: error.message,
        code: 'HOSTEL_REJECTED',
        suggestion: 'Please review the rejection notes and resubmit your hostel for approval.'
      });
    }
    
    if (error.message.includes('inactive hostel')) {
      return res.status(403).json({
        success: false,
        message: error.message,
        code: 'HOSTEL_INACTIVE'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'An error occurred while creating the room'
    });
  }
};

/**
 * Get Rooms by Hostel Controller
 * GET /hostels/:hostelId/rooms
 */
exports.getRoomsByHostel = async (req, res) => {
  try {
    const { hostelId } = req.params;
    const { page, limit, sort, ...filters } = req.query;
    const role = req.userRole;
    const userId = req.userId;

    const result = await roomService.getRoomsByHostel(
      hostelId,
      { page, limit, sort, ...filters },
      role,
      userId
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    
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
      message: 'An error occurred while fetching rooms'
    });
  }
};

/**
 * Get Single Room Controller
 * GET /rooms/:roomId
 */
exports.getRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const role = req.userRole;
    const userId = req.userId;

    const room = await roomService.getRoomById(roomId, role, userId);

    res.json({
      success: true,
      data: { room }
    });
  } catch (error) {
    console.error('Get room error:', error);
    
    if (error.message === 'Room not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message.includes('Not authorized') || error.message === 'Room not available') {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching the room'
    });
  }
};

/**
 * Update Room Controller
 * PUT /rooms/:roomId
 */
exports.updateRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // Validate input
    const errors = roomService.validateRoomInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    const room = await roomService.updateRoom(roomId, req.body, req.userId, req.userRole);

    res.json({
      success: true,
      message: 'Room updated successfully',
      data: { room }
    });
  } catch (error) {
    console.error('Update room error:', error);
    
    if (error.message === 'Room not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message.includes('Not authorized') || error.message.includes('Cannot update')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating the room'
    });
  }
};

/**
 * Disable (Soft Delete) Room Controller
 * PATCH /rooms/:roomId/disable
 */
exports.disableRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { reason } = req.body;
    const userId = req.userId;
    const role = req.userRole;

    const room = await roomService.disableRoom(roomId, userId, reason, role);

    res.json({
      success: true,
      message: 'Room disabled successfully',
      data: { room }
    });
  } catch (error) {
    console.error('Disable room error:', error);
    
    if (error.message === 'Room not found') {
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
      message: 'An error occurred while disabling the room'
    });
  }
};

/**
 * Enable Room Controller
 * PATCH /rooms/:roomId/enable
 */
exports.enableRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.userId;
    const role = req.userRole;

    const room = await roomService.enableRoom(roomId, userId, role);

    res.json({
      success: true,
      message: 'Room enabled successfully',
      data: { room }
    });
  } catch (error) {
    console.error('Enable room error:', error);
    
    if (error.message === 'Room not found') {
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
      message: 'An error occurred while enabling the room'
    });
  }
};

/**
 * Toggle Availability Controller
 * PATCH /rooms/:roomId/availability
 */
exports.toggleAvailability = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { isAvailable } = req.body;
    const userId = req.userId;
    const role = req.userRole;

    if (isAvailable === undefined) {
      return res.status(400).json({
        success: false,
        message: 'isAvailable field is required'
      });
    }

    const room = await roomService.toggleAvailability(roomId, isAvailable, userId, role);

    res.json({
      success: true,
      message: 'Room availability updated',
      data: { room }
    });
  } catch (error) {
    console.error('Toggle availability error:', error);
    
    if (error.message === 'Room not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message.includes('Not authorized') || error.message.includes('Cannot update')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating availability'
    });
  }
};

/**
 * Delete Room Controller (Permanent)
 * DELETE /rooms/:roomId
 */
exports.deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    await roomService.deleteRoom(roomId);

    res.json({
      success: true,
      message: 'Room deleted permanently'
    });
  } catch (error) {
    console.error('Delete room error:', error);
    
    if (error.message === 'Room not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the room'
    });
  }
};
