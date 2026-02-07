const FALLBACK_IMAGE =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f8f9fa" width="400" height="300"/%3E%3Ctext x="200" y="150" text-anchor="middle" font-family="Arial" font-size="16" fill="%236c757d"%3ENo Image%3C/text%3E%3C/svg%3E';

const toTitleCase = (value) => {
  if (!value || typeof value !== 'string') return '';
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
};

export const normalizeHostel = (hostel = {}) => {
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

  const distanceKm = hostel.distanceFromCampus ?? hostel.university?.distanceKm;
  const distance =
    distanceKm !== undefined && distanceKm !== null
      ? `${distanceKm} km`
      : hostel.distance || 'N/A';

  const amenities = Array.isArray(hostel.amenities)
    ? hostel.amenities
        .map((amenity) =>
          typeof amenity === 'string' ? amenity : amenity?.name
        )
        .filter(Boolean)
    : [];

  const rules = Array.isArray(hostel.houseRules?.additionalRules)
    ? hostel.houseRules.additionalRules
    : Array.isArray(hostel.rules)
      ? hostel.rules
      : [];

  const price = hostel.pricing?.minPrice ?? hostel.price ?? 0;

  const type = hostel.hostelType
    ? toTitleCase(hostel.hostelType)
    : hostel.type || 'Mixed';

  const landlord =
    hostel.landlord ||
    (hostel.landlordId && typeof hostel.landlordId === 'object'
      ? {
          name: hostel.landlordId.name,
          phone: hostel.landlordId.phone,
          email: hostel.landlordId.email
        }
      : {});

  const verified = hostel.verificationStatus
    ? hostel.verificationStatus === 'approved'
    : !!hostel.verified;

  return {
    id: hostel._id || hostel.id,
    name: hostel.name || 'Unnamed Hostel',
    location,
    distance,
    price,
    availability:
      hostel.availability || (hostel.isActive === false ? 'Full' : 'Available'),
    verified,
    image: primaryImage,
    images,
    amenities,
    description: hostel.description || '',
    rules,
    landlord,
    rating: typeof hostel.rating === 'number' ? hostel.rating : 0,
    reviewsCount: typeof hostel.reviewsCount === 'number' ? hostel.reviewsCount : 0,
    roomsAvailable:
      typeof hostel.roomsAvailable === 'number' ? hostel.roomsAvailable : null,
    type
  };
};
