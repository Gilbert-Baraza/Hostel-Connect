const User = require('../models/User');
const Hostel = require('../models/Hostel');

/**
 * Get saved hostels for current student
 * GET /students/saved-hostels
 */
exports.getSavedHostels = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate({
      path: 'savedHostels.hostel',
      match: { verificationStatus: { $ne: 'rejected' }, isActive: true },
      populate: { path: 'landlordId', select: 'name email phone' }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const savedHostels = (user.savedHostels || []).filter((entry) => entry.hostel);

    res.json({
      success: true,
      data: { savedHostels }
    });
  } catch (error) {
    console.error('Get saved hostels error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching saved hostels'
    });
  }
};

/**
 * Save a hostel to student's saved list
 * POST /students/saved-hostels/:hostelId
 */
exports.saveHostel = async (req, res) => {
  try {
    const { hostelId } = req.params;

    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: 'Hostel not found'
      });
    }

    if (hostel.verificationStatus === 'rejected' || hostel.isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'Hostel is not available to save'
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const alreadySaved = (user.savedHostels || []).some(
      (entry) => entry.hostel?.toString() === hostelId
    );

    if (!alreadySaved) {
      user.savedHostels.push({ hostel: hostelId });
      await user.save();
    }

    res.json({
      success: true,
      message: alreadySaved ? 'Hostel already saved' : 'Hostel saved successfully'
    });
  } catch (error) {
    console.error('Save hostel error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while saving the hostel'
    });
  }
};

/**
 * Remove a hostel from saved list
 * DELETE /students/saved-hostels/:hostelId
 */
exports.removeSavedHostel = async (req, res) => {
  try {
    const { hostelId } = req.params;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const before = user.savedHostels?.length || 0;
    user.savedHostels = (user.savedHostels || []).filter(
      (entry) => entry.hostel?.toString() !== hostelId
    );

    if (user.savedHostels.length !== before) {
      await user.save();
    }

    res.json({
      success: true,
      message: 'Hostel removed from saved list'
    });
  } catch (error) {
    console.error('Remove saved hostel error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while removing the hostel'
    });
  }
};
