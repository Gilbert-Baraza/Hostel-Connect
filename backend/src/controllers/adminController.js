const User = require('../models/User');
const Hostel = require('../models/Hostel');
const Report = require('../models/Report');

const toNumber = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const getLandlordStatus = (landlord) => {
  const status = landlord.verificationStatus
    ? landlord.verificationStatus
    : (landlord.isVerified ? 'approved' : 'pending');

  if (status === 'approved') return 'verified';
  if (status === 'rejected') return 'rejected';
  return 'pending';
};

/**
 * Admin Overview
 * GET /admin/overview
 */
exports.getOverview = async (req, res) => {
  try {
    const pendingLandlordsQuery = {
      role: 'landlord',
      $or: [
        { verificationStatus: 'pending' },
        { verificationStatus: { $exists: false }, isVerified: { $ne: true } }
      ]
    };

    const [
      totalStudents,
      totalLandlords,
      totalHostels,
      pendingLandlordVerifications,
      pendingHostelVerifications,
      reportedListings,
      activeListings,
      suspendedUsers
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'landlord' }),
      Hostel.countDocuments(),
      User.countDocuments(pendingLandlordsQuery),
      Hostel.countDocuments({ verificationStatus: 'pending' }),
      Report.countDocuments({ status: 'pending' }),
      Hostel.countDocuments({ verificationStatus: 'approved', isActive: true }),
      User.countDocuments({ status: 'suspended' })
    ]);

    res.json({
      success: true,
      data: {
        totalStudents,
        totalLandlords,
        totalHostels,
        pendingLandlordVerifications,
        pendingHostelVerifications,
        reportedListings,
        activeListings,
        suspendedUsers
      }
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching admin overview'
    });
  }
};

/**
 * Get users (admin)
 * GET /admin/users
 */
exports.getUsers = async (req, res) => {
  try {
    const { role, status, search, sort } = req.query;
    const page = Math.max(toNumber(req.query.page, 1), 1);
    const limit = Math.min(Math.max(toNumber(req.query.limit, 20), 1), 500);
    const skip = (page - 1) * limit;

    const query = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('name email role status createdAt lastLogin')
        .sort(sort || { createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching users'
    });
  }
};

/**
 * Update user status (admin)
 * PATCH /admin/users/:id/status
 */
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['active', 'suspended', 'deactivated'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be active, suspended, or deactivated'
      });
    }

    const user = await User.findById(id).select('name email role status createdAt lastLogin');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.status = status;
    await user.save();

    res.json({
      success: true,
      message: 'User status updated',
      data: { user }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating user status'
    });
  }
};

/**
 * Get landlords (admin)
 * GET /admin/landlords
 */
exports.getLandlords = async (req, res) => {
  try {
    const { status, search, sort } = req.query;
    const page = Math.max(toNumber(req.query.page, 1), 1);
    const limit = Math.min(Math.max(toNumber(req.query.limit, 50), 1), 500);
    const skip = (page - 1) * limit;

    const query = { role: 'landlord' };
    const andConditions = [];

    if (search) {
      andConditions.push({
        $or: [
          { name: new RegExp(search, 'i') },
          { email: new RegExp(search, 'i') },
          { phone: new RegExp(search, 'i') }
        ]
      });
    }

    if (status && ['pending', 'verified', 'rejected'].includes(status)) {
      if (status === 'verified') {
        andConditions.push({
          $or: [
            { verificationStatus: 'approved' },
            { verificationStatus: { $exists: false }, isVerified: true }
          ]
        });
      } else if (status === 'rejected') {
        andConditions.push({ verificationStatus: 'rejected' });
      } else {
        andConditions.push({
          $or: [
            { verificationStatus: 'pending' },
            { verificationStatus: { $exists: false }, isVerified: { $ne: true } }
          ]
        });
      }
    }

    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    const [landlords, total] = await Promise.all([
      User.find(query)
        .select('name email phone isVerified verificationStatus verificationNotes createdAt')
        .sort(sort || { createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);

    const landlordIds = landlords.map((landlord) => landlord._id);
    const hostelCounts = await Hostel.aggregate([
      { $match: { landlordId: { $in: landlordIds } } },
      { $group: { _id: '$landlordId', count: { $sum: 1 } } }
    ]);

    const countMap = new Map(
      hostelCounts.map((entry) => [entry._id.toString(), entry.count])
    );

    const data = landlords.map((landlord) => ({
      id: landlord._id,
      userId: landlord._id,
      name: landlord.name,
      email: landlord.email,
      phone: landlord.phone || '',
      idNumber: landlord.idNumber || null,
      status: getLandlordStatus(landlord),
      rejectionReason: landlord.verificationNotes?.rejectionReason || null,
      hostelsCount: countMap.get(landlord._id.toString()) || 0,
      createdAt: landlord.createdAt,
      verifiedAt: landlord.verificationNotes?.reviewedAt || null
    }));

    res.json({
      success: true,
      data: {
        landlords: data,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get landlords error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching landlords'
    });
  }
};

/**
 * Verify or reject landlord (admin)
 * PATCH /admin/landlords/:id/verify
 */
  exports.verifyLandlord = async (req, res) => {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;

      if (!status || !['approved', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be approved or rejected'
        });
      }

      if (status === 'rejected' && !reason) {
        return res.status(400).json({
          success: false,
          message: 'Rejection reason is required'
        });
      }

    const landlord = await User.findById(id);
    if (!landlord || landlord.role !== 'landlord') {
      return res.status(404).json({
        success: false,
        message: 'Landlord not found'
      });
    }

    landlord.verificationStatus = status;
    landlord.isVerified = status === 'approved';
    landlord.verificationNotes = {
      reviewedBy: req.userId,
      reviewedAt: new Date(),
      rejectionReason: status === 'rejected' ? reason : undefined,
      adminComments: status === 'approved' ? 'Verified by admin' : 'Rejected by admin'
    };

    await landlord.save();

    const sanitized = {
      id: landlord._id,
      name: landlord.name,
      email: landlord.email,
      role: landlord.role,
      status: landlord.status,
      isVerified: landlord.isVerified,
      verificationStatus: landlord.verificationStatus,
      verificationNotes: landlord.verificationNotes
    };

    res.json({
      success: true,
      message: `Landlord ${status}`,
      data: { landlord: sanitized }
    });
  } catch (error) {
    console.error('Verify landlord error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while verifying landlord'
    });
  }
};

/**
 * Get reports (admin)
 * GET /admin/reports
 */
exports.getReports = async (req, res) => {
  try {
    const { status } = req.query;
    const page = Math.max(toNumber(req.query.page, 1), 1);
    const limit = Math.min(Math.max(toNumber(req.query.limit, 50), 1), 500);
    const skip = (page - 1) * limit;

    const query = {};
    if (status) query.status = status;

    const [reports, total] = await Promise.all([
      Report.find(query)
        .populate('hostelId', 'name')
        .populate('reporterId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Report.countDocuments(query)
    ]);

    const data = reports.map((report) => ({
      id: report._id,
      hostelId: report.hostelId?._id || report.hostelId,
      hostelName: report.hostelId?.name || 'Unknown',
      reporterId: report.reporterId?._id || report.reporterId,
      reporterName: report.reporterId?.name || 'Unknown',
      reason: report.reason,
      description: report.description,
      status: report.status,
      adminNotes: report.adminNotes || null,
      createdAt: report.createdAt
    }));

    res.json({
      success: true,
      data: {
        reports: data,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching reports'
    });
  }
};

/**
 * Update report (admin)
 * PATCH /admin/reports/:id
 */
exports.updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!status || !['pending', 'reviewed', 'resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be pending, reviewed, or resolved'
      });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    report.status = status;
    if (adminNotes !== undefined) {
      report.adminNotes = adminNotes;
    }
    if (status === 'resolved') {
      report.resolvedAt = new Date();
    }

    await report.save();

    res.json({
      success: true,
      message: 'Report updated',
      data: { report }
    });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating report'
    });
  }
};
