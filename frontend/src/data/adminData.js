/**
 * Admin Dashboard Dummy Data
 * 
 * This file contains dummy data structured like real backend responses.
 * Used for testing and development until backend integration is complete.
 * 
 * Data structures mirror expected API responses for easy API mapping later.
 */

// =============================================================================
// USER DATA
// =============================================================================

/**
 * @typedef {Object} User
 * @property {string} id - Unique user identifier
 * @property {string} name - User's full name
 * @property {string} email - User's email address
 * @property {string} role - User role: 'student', 'landlord', or 'admin'
 * @property {string} status - Account status: 'active', 'suspended', 'pending'
 * @property {string} createdAt - Account creation date (ISO format)
 * @property {string|null} lastLogin - Last login date (ISO format)
 */

/** @type {User[]} */
export const users = [
  {
    id: 'user_1',
    name: 'John Mwangi',
    email: 'john.mwangi@student.kenya',
    role: 'student',
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z',
    lastLogin: '2024-12-05T14:22:00Z'
  },
  {
    id: 'user_2',
    name: 'Sarah Adhiambo',
    email: 'sarah.adhiambo@student.kenya',
    role: 'student',
    status: 'active',
    createdAt: '2024-02-20T08:15:00Z',
    lastLogin: '2024-12-04T16:45:00Z'
  },
  {
    id: 'user_3',
    name: 'David Ochieng',
    email: 'david.ochieng@landlord.kenya',
    role: 'landlord',
    status: 'active',
    createdAt: '2024-01-10T09:00:00Z',
    lastLogin: '2024-12-05T11:30:00Z'
  },
  {
    id: 'user_4',
    name: 'Grace Wanjiku',
    email: 'grace.wanjiku@landlord.kenya',
    role: 'landlord',
    status: 'pending',
    createdAt: '2024-12-01T07:20:00Z',
    lastLogin: null
  },
  {
    id: 'user_5',
    name: 'Michael Odhiambo',
    email: 'michael.odhiambo@student.kenya',
    role: 'student',
    status: 'suspended',
    createdAt: '2024-03-05T12:00:00Z',
    lastLogin: '2024-11-20T09:15:00Z'
  },
  {
    id: 'user_6',
    name: 'Emily Akinyi',
    email: 'emily.akinyi@student.kenya',
    role: 'student',
    status: 'active',
    createdAt: '2024-04-12T15:30:00Z',
    lastLogin: '2024-12-05T10:00:00Z'
  },
  {
    id: 'user_7',
    name: 'Robert Kamau',
    email: 'robert.kamau@landlord.kenya',
    role: 'landlord',
    status: 'active',
    createdAt: '2024-02-28T11:45:00Z',
    lastLogin: '2024-12-03T08:20:00Z'
  },
  {
    id: 'user_8',
    name: 'Faith Njeri',
    email: 'faith.njeri@student.kenya',
    role: 'student',
    status: 'active',
    createdAt: '2024-05-18T14:10:00Z',
    lastLogin: '2024-12-05T09:30:00Z'
  },
];

// =============================================================================
// LANDLORD DATA
// =============================================================================

/**
 * @typedef {Object} Landlord
 * @property {string} id - Unique landlord identifier
 * @property {string} userId - Reference to user ID
 * @property {string} name - Landlord's full name
 * @property {string} email - Contact email
 * @property {string} phone - Phone number
 * @property {string} idNumber - National ID number
 * @property {string} status - Verification status: 'pending', 'verified', 'rejected'
 * @property {string|null} rejectionReason - Reason for rejection if applicable
 * @property {number} hostelsCount - Number of hostels listed
 * @property {string} createdAt - Registration date (ISO format)
 * @property {string|null} verifiedAt - Verification date (ISO format)
 */

/** @type {Landlord[]} */
export const landlords = [
  {
    id: 'landlord_1',
    userId: 'user_3',
    name: 'David Ochieng',
    email: 'david.ochieng@landlord.kenya',
    phone: '+254712345678',
    idNumber: '12345678',
    status: 'verified',
    rejectionReason: null,
    hostelsCount: 3,
    createdAt: '2024-01-10T09:00:00Z',
    verifiedAt: '2024-01-12T14:30:00Z'
  },
  {
    id: 'landlord_2',
    userId: 'user_4',
    name: 'Grace Wanjiku',
    email: 'grace.wanjiku@landlord.kenya',
    phone: '+254723456789',
    idNumber: '23456789',
    status: 'pending',
    rejectionReason: null,
    hostelsCount: 1,
    createdAt: '2024-12-01T07:20:00Z',
    verifiedAt: null
  },
  {
    id: 'landlord_3',
    userId: 'user_7',
    name: 'Robert Kamau',
    email: 'robert.kamau@landlord.kenya',
    phone: '+254734567890',
    idNumber: '34567890',
    status: 'verified',
    rejectionReason: null,
    hostelsCount: 2,
    createdAt: '2024-02-28T11:45:00Z',
    verifiedAt: '2024-03-02T10:00:00Z'
  },
  {
    id: 'landlord_4',
    userId: 'user_9',
    name: 'James Otieno',
    email: 'james.otieno@landlord.kenya',
    phone: '+254745678901',
    idNumber: '45678901',
    status: 'pending',
    rejectionReason: null,
    hostelsCount: 2,
    createdAt: '2024-12-03T08:30:00Z',
    verifiedAt: null
  },
  {
    id: 'landlord_5',
    userId: 'user_10',
    name: 'Patricia Mulili',
    email: 'patricia.mulili@landlord.kenya',
    phone: '+254756789012',
    idNumber: '56789012',
    status: 'rejected',
    rejectionReason: 'Submitted documents are unclear and expired national ID provided',
    hostelsCount: 1,
    createdAt: '2024-11-15T09:00:00Z',
    verifiedAt: null
  },
];

// =============================================================================
// HOSTEL DATA
// =============================================================================

/**
 * @typedef {Object} Hostel
 * @property {string} id - Unique hostel identifier
 * @property {string} landlordId - Reference to landlord ID
 * @property {string} name - Hostel name
 * @property {string} location - Physical address/location
 * @property {string} description - Hostel description
 * @property {number} price - Monthly rent price
 * @property {string} type - Hostel type: 'male', 'female', 'mixed'
 * @property {string} status - Verification status: 'pending', 'verified', 'rejected', 'disabled'
 * @property {string|null} rejectionReason - Reason for rejection if applicable
 * @property {string[]} amenities - List of amenities
 * @property {string[]} images - Array of image URLs
 * @property {number} capacity - Total bed capacity
 * @property {number} availableRooms - Number of available rooms
 * @property {string} createdAt - Submission date (ISO format)
 */

/** @type {Hostel[]} */
export const hostels = [
  {
    id: 'hostel_1',
    landlordId: 'landlord_1',
    name: 'Sunrise Students Hostel',
    location: 'Moi Avenue, Eldoret',
    description: 'Modern student accommodation with all essential amenities. Located near Moi University main gate.',
    price: 3500,
    type: 'mixed',
    status: 'verified',
    rejectionReason: null,
    amenities: ['WiFi', 'Study Room', 'Laundry', 'Cafeteria', 'Security', 'Water Heater'],
    images: ['hostel1.jpg', 'hostel1_room.jpg'],
    capacity: 50,
    availableRooms: 12,
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'hostel_2',
    landlordId: 'landlord_2',
    name: 'Green Valley Hostel',
    location: 'Kenyatta Street, Nakuru',
    description: 'Affordable and comfortable hostel for university students. Peaceful environment for studying.',
    price: 2800,
    type: 'female',
    status: 'pending',
    rejectionReason: null,
    amenities: ['WiFi', 'Study Room', 'Kitchen', 'Security'],
    images: ['hostel2.jpg'],
    capacity: 30,
    availableRooms: 8,
    createdAt: '2024-12-02T14:30:00Z'
  },
  {
    id: 'hostel_3',
    landlordId: 'landlord_1',
    name: 'Academic Heights',
    location: 'University Road, Kisumu',
    description: 'Premium student housing with excellent facilities. Walking distance to campus.',
    price: 4500,
    type: 'male',
    status: 'verified',
    rejectionReason: null,
    amenities: ['WiFi', 'Study Room', 'Gym', 'Swimming Pool', 'Laundry', 'Cafeteria', '24/7 Security'],
    images: ['hostel3.jpg', 'hostel3_room.jpg', 'hostel3_facilities.jpg'],
    capacity: 80,
    availableRooms: 20,
    createdAt: '2024-02-20T09:15:00Z'
  },
  {
    id: 'hostel_4',
    landlordId: 'landlord_3',
    name: 'Cozy Corner Hostel',
    location: 'Nairobi Road, Thika',
    description: 'Budget-friendly option for students. Basic amenities provided.',
    price: 2500,
    type: 'mixed',
    status: 'pending',
    rejectionReason: null,
    amenities: ['WiFi', 'Shared Kitchen', 'Security'],
    images: ['hostel4.jpg'],
    capacity: 25,
    availableRooms: 5,
    createdAt: '2024-12-04T11:00:00Z'
  },
  {
    id: 'hostel_5',
    landlordId: 'landlord_3',
    name: 'Scholar\'s Paradise',
    location: 'College View, Nyeri',
    description: 'Ideal for serious students. Quiet environment with dedicated study areas.',
    price: 3200,
    type: 'female',
    status: 'verified',
    rejectionReason: null,
    amenities: ['WiFi', 'Study Room', 'Library Access', 'Laundry', 'Security'],
    images: ['hostel5.jpg', 'hostel5_study.jpg'],
    capacity: 40,
    availableRooms: 10,
    createdAt: '2024-03-10T08:00:00Z'
  },
  {
    id: 'hostel_6',
    landlordId: 'landlord_4',
    name: 'Unity Hostel',
    location: 'Town Center, Machakos',
    description: 'Community-style living for students. Great social environment.',
    price: 3000,
    type: 'male',
    status: 'pending',
    rejectionReason: null,
    amenities: ['WiFi', 'Common Room', 'Kitchen', 'Security', 'TV Room'],
    images: ['hostel6.jpg'],
    capacity: 35,
    availableRooms: 7,
    createdAt: '2024-12-05T10:45:00Z'
  },
  {
    id: 'hostel_7',
    landlordId: 'landlord_1',
    name: 'City View Hostel',
    location: 'Downtown, Mombasa',
    description: 'Beach-side student accommodation. Modern facilities.',
    price: 5000,
    type: 'mixed',
    status: 'disabled',
    rejectionReason: 'Temporarily closed for renovations',
    amenities: ['WiFi', 'Sea View', 'Study Room', 'Gym', 'Beach Access'],
    images: ['hostel7.jpg'],
    capacity: 60,
    availableRooms: 0,
    createdAt: '2024-04-05T12:00:00Z'
  },
  {
    id: 'hostel_8',
    landlordId: 'landlord_4',
    name: 'Lakeside Hostel',
    location: 'Lake View, Kisumu',
    description: 'Beautiful lakeside accommodation with scenic views.',
    price: 3800,
    type: 'female',
    status: 'rejected',
    rejectionReason: 'Submitted photos do not match the described property. Please resubmit with accurate photos.',
    amenities: ['WiFi', 'Lake View', 'Study Room', 'Cafeteria'],
    images: ['hostel8.jpg'],
    capacity: 45,
    availableRooms: 15,
    createdAt: '2024-11-20T09:30:00Z'
  },
];

// =============================================================================
// REPORTS DATA
// =============================================================================

/**
 * @typedef {Object} Report
 * @property {string} id - Unique report identifier
 * @property {string} hostelId - Reference to hostel ID
 * @property {string} hostelName - Name of reported hostel
 * @property {string} reporterId - User ID of reporter
 * @property {string} reporterName - Name of reporter
 * @property {string} reason - Report reason category
 * @property {string} description - Detailed description of the issue
 * @property {string} status - Report status: 'pending', 'reviewed', 'resolved'
 * @property {string|null} adminNotes - Notes from admin review
 * @property {string} createdAt - Report submission date (ISO format)
 */

/** @type {Report[]} */
export const reports = [
  {
    id: 'report_1',
    hostelId: 'hostel_1',
    hostelName: 'Sunrise Students Hostel',
    reporterId: 'user_1',
    reporterName: 'John Mwangi',
    reason: 'fake_listing',
    description: 'The photos shown online do not match the actual condition of the rooms. Room was much smaller and facilities were not as described.',
    status: 'resolved',
    adminNotes: 'Verified and addressed with landlord. Photos have been updated.',
    createdAt: '2024-11-15T14:20:00Z'
  },
  {
    id: 'report_2',
    hostelId: 'hostel_3',
    hostelName: 'Academic Heights',
    reporterId: 'user_2',
    reporterName: 'Sarah Adhiambo',
    reason: 'pricing_issue',
    description: 'Hidden fees were charged that were not mentioned in the listing. Asked to pay extra for water and electricity.',
    status: 'pending',
    adminNotes: null,
    createdAt: '2024-12-03T16:45:00Z'
  },
  {
    id: 'report_3',
    hostelId: 'hostel_5',
    hostelName: "Scholar's Paradise",
    reporterId: 'user_6',
    reporterName: 'Emily Akinyi',
    reason: 'harassment',
    description: 'Landlord has been making inappropriate comments and visiting rooms without notice.',
    status: 'reviewed',
    adminNotes: 'Landlord warned about privacy policies. Case under monitoring.',
    createdAt: '2024-12-01T10:30:00Z'
  },
  {
    id: 'report_4',
    hostelId: 'hostel_7',
    hostelName: 'City View Hostel',
    reporterId: 'user_8',
    reporterName: 'Faith Njeri',
    reason: 'safety_concern',
    description: 'Security is poor. Several students have reported items missing from their rooms.',
    status: 'pending',
    adminNotes: null,
    createdAt: '2024-12-05T09:00:00Z'
  },
  {
    id: 'report_5',
    hostelId: 'hostel_2',
    hostelName: 'Green Valley Hostel',
    reporterId: 'user_1',
    reporterName: 'John Mwangi',
    reason: 'scam',
    description: 'Asked to pay booking fee before viewing. When I asked for more information, they became aggressive.',
    status: 'pending',
    adminNotes: null,
    createdAt: '2024-12-05T11:15:00Z'
  },
];

// =============================================================================
// ADMIN PROFILE & ACTIVITY DATA
// =============================================================================

/**
 * @typedef {Object} AdminUser
 * @property {string} id - Admin user ID
 * @property {string} name - Admin's full name
 * @property {string} email - Admin's email
 * @property {string} role - Admin role level
 * @property {string} createdAt - Account creation date
 */

/** @type {AdminUser} */
export const adminUser = {
  id: 'admin_1',
  name: 'System Administrator',
  email: 'admin@hostelconnect.com',
  role: 'super_admin',
  createdAt: '2024-01-01T00:00:00Z'
};

/**
 * @typedef {Object} AdminActivity
 * @property {string} id - Activity ID
 * @property {string} action - Action performed
 * @property {string} target - Target of the action
 * @property {string} timestamp - When action was performed
 */

/** @type {AdminActivity[]} */
export const adminActivity = [
  {
    id: 'activity_1',
    action: 'VERIFIED_LANDLORD',
    target: 'David Ochieng (landlord_1)',
    timestamp: '2024-12-05T10:30:00Z'
  },
  {
    id: 'activity_2',
    action: 'APPROVED_HOSTEL',
    target: 'Sunrise Students Hostel (hostel_1)',
    timestamp: '2024-12-05T09:15:00Z'
  },
  {
    id: 'activity_3',
    action: 'DISABLED_LISTING',
    target: 'City View Hostel (hostel_7)',
    timestamp: '2024-12-04T14:00:00Z'
  },
  {
    id: 'activity_4',
    action: 'SUSPENDED_USER',
    target: 'Michael Odhiambo (user_5)',
    timestamp: '2024-12-03T16:30:00Z'
  },
  {
    id: 'activity_5',
    action: 'RESOLVED_REPORT',
    target: 'Report #report_1',
    timestamp: '2024-12-02T11:45:00Z'
  },
];

// =============================================================================
// PLATFORM STATISTICS (Dashboard Metrics)
// =============================================================================

/**
 * @typedef {Object} PlatformStats
 * @property {number} totalStudents - Total number of student users
 * @property {number} totalLandlords - Total number of landlords
 * @property {number} totalHostels - Total number of hostels
 * @property {number} pendingLandlordVerifications - Pending landlord verification count
 * @property {number} pendingHostelVerifications - Pending hostel verification count
 * @property {number} reportedListings - Number of reported listings
 * @property {number} activeListings - Number of verified and active listings
 * @property {number} suspendedUsers - Number of suspended users
 */

export const platformStats = {
  totalStudents: 1250,
  totalLandlords: 45,
  totalHostels: 128,
  pendingLandlordVerifications: 3,
  pendingHostelVerifications: 4,
  reportedListings: 5,
  activeListings: 98,
  suspendedUsers: 2
};

// =============================================================================
// REPORT REASONS (For dropdown options)
// =============================================================================

export const reportReasons = [
  { value: 'fake_listing', label: 'Fake or Misleading Listing' },
  { value: 'pricing_issue', label: 'Pricing or Hidden Fees' },
  { value: 'harassment', label: 'Harassment or Misconduct' },
  { value: 'safety_concern', label: 'Safety Concern' },
  { value: 'scam', label: 'Suspected Scam' },
  { value: 'property_condition', label: 'Property Not as Described' },
  { value: 'other', label: 'Other' }
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get landlord by ID
 * @param {string} landlordId - Landlord ID to find
 * @returns {Landlord|null}
 */
export const getLandlordById = (landlordId) => {
  return landlords.find(l => l.id === landlordId) || null;
};

/**
 * Get hostel by ID
 * @param {string} hostelId - Hostel ID to find
 * @returns {Hostel|null}
 */
export const getHostelById = (hostelId) => {
  return hostels.find(h => h.id === hostelId) || null;
};

/**
 * Get user by ID
 * @param {string} userId - User ID to find
 * @returns {User|null}
 */
export const getUserById = (userId) => {
  return users.find(u => u.id === userId) || null;
};

/**
 * Get landlords by status
 * @param {string} status - Status to filter by
 * @returns {Landlord[]}
 */
export const getLandlordsByStatus = (status) => {
  return landlords.filter(l => l.status === status);
};

/**
 * Get hostels by status
 * @param {string} status - Status to filter by
 * @returns {Hostel[]}
 */
export const getHostelsByStatus = (status) => {
  return hostels.filter(h => h.status === status);
};

/**
 * Get reports by status
 * @param {string} status - Status to filter by
 * @returns {Report[]}
 */
export const getReportsByStatus = (status) => {
  return reports.filter(r => r.status === status);
};
