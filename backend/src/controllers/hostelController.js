const hostelService = require('../services/hostelService');

/**
 * Validate hostel input
 */
const validateHostelInput = (data, isUpdate = false) => {
  const errors = [];
  
  if (!isUpdate || data.name !== undefined) {
    if (!data.name || data.name.length < 3) {
      errors.push('Name must be at least 3 characters');
    }
  }
  
  if (!isUpdate || data.hostelType !== undefined) {
    if (!data.hostelType || !['male', 'female', 'mixed'].includes(data.hostelType)) {
      errors.push('Valid hostel type (male/female/mixed) is required');
    }
  }
  
  if (!isUpdate || data.address !== undefined) {
    if (!data.address) {
      errors.push('Address is required');
    } else {
      if (!data.address.street) errors.push('Street address is required');
      if (!data.address.city) errors.push('City is required');
      if (!data.address.county) errors.push('County is required');
    }
  }
  
  if (!isUpdate || data.pricing !== undefined) {
    if (data.pricing) {
      if (data.pricing.minPrice === undefined || data.pricing.minPrice === null) {
        errors.push('Minimum price is required');
      } else if (data.pricing.minPrice < 0) {
        errors.push('Minimum price cannot be negative');
      }
    } else {
      errors.push('Minimum price is required');
    }
  }
  
  return errors;
};

/**
 * Create Hostel Controller
 * POST /hostels
 */
exports.createHostel = async (req, res) => {
  try {
    // Validate input
    const errors = validateHostelInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    const hostel = await hostelService.createHostel(req.body, req.userId);

    res.status(201).json({
      success: true,
      message: 'Hostel created successfully. Awaiting verification.',
      data: { hostel }
    });
  } catch (error) {
    console.error('Create hostel error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while creating the hostel'
    });
  }
};

/**
 * Get All Hostels Controller
 * GET /hostels
 */
exports.getHostels = async (req, res) => {
  try {
    const { page, limit, sort, ...filters } = req.query;
    const role = req.userRole;
    const userId = req.userId;

    const result = await hostelService.getHostels(
      { page, limit, sort, ...filters },
      role,
      userId
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get hostels error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching hostels'
    });
  }
};

/**
 * Get Single Hostel Controller
 * GET /hostels/:id
 */
exports.getHostel = async (req, res) => {
  try {
    const { id } = req.params;
    const role = req.userRole;
    const userId = req.userId;

    const hostel = await hostelService.getHostelById(id, role, userId);

    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: 'Hostel not found'
      });
    }

    res.json({
      success: true,
      data: { hostel }
    });
  } catch (error) {
    console.error('Get hostel error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching the hostel'
    });
  }
};

/**
 * Update Hostel Controller
 * PUT /hostels/:id
 */
exports.updateHostel = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate input
    const errors = validateHostelInput(req.body, true);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    const hostel = await hostelService.updateHostel(id, req.body, req.userId, req.userRole);

    res.json({
      success: true,
      message: 'Hostel updated successfully. Verification status reset to pending.',
      data: { hostel }
    });
  } catch (error) {
    console.error('Update hostel error:', error);
    
    if (error.message === 'Hostel not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message === 'Not authorized to update this hostel') {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating the hostel'
    });
  }
};

/**
 * Delete Hostel Controller (Permanent)
 * DELETE /hostels/:id
 */
exports.deleteHostel = async (req, res) => {
  try {
    const { id } = req.params;
    
    await hostelService.deleteHostel(id);

    res.json({
      success: true,
      message: 'Hostel deleted permanently'
    });
  } catch (error) {
    console.error('Delete hostel error:', error);
    
    if (error.message === 'Hostel not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the hostel'
    });
  }
};

/**
 * Disable Hostel Controller (Admin)
 * PATCH /admin/hostels/:id/disable
 */
exports.disableHostel = async (req, res) => {
  try {
    const { id } = req.params;
    
    const hostel = await hostelService.disableHostel(id, req.userId);

    res.json({
      success: true,
      message: 'Hostel disabled successfully',
      data: { hostel }
    });
  } catch (error) {
    console.error('Disable hostel error:', error);
    
    if (error.message === 'Hostel not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'An error occurred while disabling the hostel'
    });
  }
};

/**
 * Enable Hostel Controller (Admin)
 * PATCH /admin/hostels/:id/enable
 */
exports.enableHostel = async (req, res) => {
  try {
    const { id } = req.params;
    
    const hostel = await hostelService.enableHostel(id, req.userId);

    res.json({
      success: true,
      message: 'Hostel enabled successfully',
      data: { hostel }
    });
  } catch (error) {
    console.error('Enable hostel error:', error);
    
    if (error.message === 'Hostel not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'An error occurred while enabling the hostel'
    });
  }
};

/**
 * Verify Hostel Controller (Admin)
 * PATCH /admin/hostels/:id/verify
 */
exports.verifyHostel = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be "approved" or "rejected"'
      });
    }
    
    if (status === 'rejected' && !reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const hostel = await hostelService.verifyHostel(id, status, req.userId, reason);

    res.json({
      success: true,
      message: `Hostel ${status} successfully`,
      data: { hostel }
    });
  } catch (error) {
    console.error('Verify hostel error:', error);
    
    if (error.message === 'Hostel not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message === 'Invalid verification status') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'An error occurred while verifying the hostel'
    });
  }
};
