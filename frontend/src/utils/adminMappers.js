const FALLBACK_IMAGE =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f8f9fa" width="400" height="300"/%3E%3Ctext x="200" y="150" text-anchor="middle" font-family="Arial" font-size="16" fill="%236c757d"%3ENo Image%3C/text%3E%3C/svg%3E';

export const normalizeAdminUser = (user = {}) => ({
  id: user._id ? String(user._id) : (user.id ? String(user.id) : ''),
  name: user.name || 'Unknown',
  email: user.email || '',
  role: user.role || 'student',
  status: user.status || 'active',
  createdAt: user.createdAt,
  lastLogin: user.lastLogin
});

export const normalizeAdminLandlord = (landlord = {}) => ({
  id: landlord.id ? String(landlord.id) : (landlord._id ? String(landlord._id) : ''),
  userId: landlord.userId ? String(landlord.userId) : (landlord._id ? String(landlord._id) : ''),
  name: landlord.name || 'Unknown',
  email: landlord.email || '',
  phone: landlord.phone || '',
  idNumber: landlord.idNumber || null,
  status: landlord.status || 'pending',
  rejectionReason: landlord.rejectionReason || null,
  hostelsCount: landlord.hostelsCount || 0,
  createdAt: landlord.createdAt,
  verifiedAt: landlord.verifiedAt || null
});

export const normalizeAdminHostel = (hostel = {}) => {
  const images = Array.isArray(hostel.images)
    ? hostel.images
        .map((image) => (typeof image === 'string' ? image : image?.url))
        .filter(Boolean)
    : [];

  const primaryImage =
    hostel.primaryImage ||
    hostel.image ||
    hostel.images?.find?.((image) => image?.isPrimary)?.url ||
    images[0] ||
    FALLBACK_IMAGE;

  const locationParts = [
    hostel.address?.street,
    hostel.address?.city,
    hostel.address?.county
  ].filter(Boolean);

  const location = locationParts.length
    ? locationParts.join(', ')
    : hostel.location || 'Location unavailable';

  const amenities = Array.isArray(hostel.amenities)
    ? hostel.amenities
        .map((amenity) =>
          typeof amenity === 'string' ? amenity : amenity?.name
        )
        .filter(Boolean)
    : [];

  const verificationStatus = hostel.verificationStatus;
  const status = hostel.isActive === false
    ? 'disabled'
    : verificationStatus === 'approved'
      ? 'verified'
      : verificationStatus === 'rejected'
        ? 'rejected'
        : 'pending';

  return {
    id: hostel._id ? String(hostel._id) : (hostel.id ? String(hostel.id) : ''),
    landlordId: hostel.landlordId?._id
      ? String(hostel.landlordId._id)
      : (hostel.landlordId ? String(hostel.landlordId) : ''),
    landlordName: hostel.landlordId?.name || hostel.landlord?.name || 'Unknown',
    name: hostel.name || 'Unnamed Hostel',
    location,
    description: hostel.description || '',
    price: Number(hostel.pricing?.minPrice ?? hostel.price ?? 0) || 0,
    type: hostel.hostelType || hostel.type || 'mixed',
    status,
    rejectionReason:
      hostel.verificationNotes?.rejectionReason ||
      (status === 'disabled' ? hostel.verificationNotes?.adminComments : null) ||
      null,
    amenities,
    images,
    image: primaryImage,
    capacity: hostel.capacity ?? null,
    availableRooms: hostel.availableRooms ?? hostel.roomsAvailable ?? null,
    createdAt: hostel.createdAt
  };
};

export const normalizeAdminReport = (report = {}) => ({
  id: report.id ? String(report.id) : (report._id ? String(report._id) : ''),
  hostelId: report.hostelId ? String(report.hostelId) : '',
  hostelName: report.hostelName || 'Unknown',
  reporterId: report.reporterId ? String(report.reporterId) : '',
  reporterName: report.reporterName || 'Unknown',
  reason: report.reason || '',
  description: report.description || '',
  status: report.status || 'pending',
  adminNotes: report.adminNotes || null,
  createdAt: report.createdAt
});
