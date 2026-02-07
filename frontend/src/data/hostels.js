/**
 * Dummy Hostel Data
 * Static dataset for the Hostel Listings Page and Hostel Details Page
 * Structured for easy replacement with API data
 */

// =============================================================================
// DATA TYPES (for reference when integrating with backend)
// =============================================================================
// 
// Hostel Object Structure:
// {
//   id: number,
//   name: string,
//   location: string,
//   distance: string,        // e.g., "0.5 km from main gate"
//   price: number,           // Monthly rent in NGN
//   availability: string,    // "Available", "Limited", "Full"
//   verified: boolean,       // Admin verification status
//   image: string,           // Main image URL (for listings page)
//   images: string[],        // Array of image URLs (for details page)
//   amenities: string[],      // Array of amenity names
//   description: string,     // Detailed hostel description
//   rules: string[],         // Array of hostel rules
//   landlord: {
//     name: string,
//     phone: string,
//     email: string
//   },
//   rating: number,          // Average rating (0-5)
//   reviewsCount: number,    // Number of reviews
//   roomsAvailable: number,  // Number of rooms left
//   type: string            // "Male", "Female", "Mixed"
// }
// =============================================================================

// Helper function to get a valid Unsplash image URL
const getUnsplashImage = (keyword, width = 400, height = 300) => {
  // Using reliable Unsplash source URLs with specific keywords
  const keywords = {
    'hostel': '1555854877-bab0e564b8d5',
    'building': '1522708323590-d24dbb6b0267',
    'apartment': '1566073771259-6a8506099945',
    'room': '1493809842364-78817add7ffb',
    'interior': '1574362848149-11496d93a93c',
    'living': '1502672260266-1c1ef2d93688',
    'architecture': '1536376072261-38c75010e6c9',
    'student': '1484154218962-a197022b5858'
  };
  
  const imageId = keywords[keyword] || keywords['hostel'];
  return `https://images.unsplash.com/photo-${imageId}?w=${width}&h=${height}&fit=crop&q=80`;
};

export const hostels = [
  {
    id: 1,
    name: "Greenview Hostel",
    location: "University Road, Near Main Gate",
    distance: "0.5 km from main gate",
    price: 15000,
    availability: "Available",
    verified: true,
    image: getUnsplashImage('hostel', 800, 600),
    images: [
      getUnsplashImage('hostel', 800, 600),
      getUnsplashImage('building', 800, 600),
      getUnsplashImage('room', 800, 600),
      getUnsplashImage('interior', 800, 600)
    ],
    amenities: [
      "Water Availability",
      "High-Speed WiFi",
      "24/7 Security",
      "Electricity",
      "Laundry Facilities",
      "Study Room",
      "Common Area",
      "CCTV Surveillance"
    ],
    description: "Greenview Hostel offers comfortable and affordable accommodation for students just 500 meters from the university main gate. Our hostel features spacious rooms, modern amenities, and a conducive learning environment. Students enjoy our well-maintained facilities including a dedicated study room, laundry services, and round-the-clock security.",
    rules: [
      "Quiet hours from 10 PM to 6 AM",
      "No guests allowed after 9 PM",
      "Keep rooms clean and tidy",
      "No smoking or alcohol on premises",
      "Respect other tenants and staff",
      "Pay rent on or before the 5th of each month",
      "Report maintenance issues promptly"
    ],
    landlord: {
      name: "Mr. John Ochieng",
      phone: "+254 712 345 678",
      email: "john.ochieng@greenview-hostels.com"
    },
    rating: 4.8,
    reviewsCount: 42,
    roomsAvailable: 5,
    type: "Mixed"
  },
  {
    id: 2,
    name: "Sunrise Student Residence",
    location: "Kenyatta Avenue, Zone 2",
    distance: "0.8 km from campus",
    price: 12000,
    availability: "Available",
    verified: true,
    image: getUnsplashImage('building', 800, 600),
    images: [
      getUnsplashImage('building', 800, 600),
      getUnsplashImage('hostel', 800, 600),
      getUnsplashImage('room', 800, 600)
    ],
    amenities: [
      "Water Availability",
      "High-Speed WiFi",
      "24/7 Security",
      "Electricity",
      "Laundry Facilities"
    ],
    description: "Sunrise Student Residence provides a warm and welcoming environment for students. Located on Kenyatta Avenue in Zone 2, we offer comfortable rooms at affordable prices. Our hostel is known for its friendly atmosphere and responsive management.",
    rules: [
      "Quiet hours from 11 PM to 7 AM",
      "No loud parties or gatherings",
      "Maintain cleanliness in common areas",
      "No pets allowed",
      "Guests must be registered at the front desk"
    ],
    landlord: {
      name: "Mrs. Sarah Wanjiku",
      phone: "+254 723 456 789",
      email: "sarah.wanjiku@sunrise-residence.co.ke"
    },
    rating: 4.5,
    reviewsCount: 28,
    roomsAvailable: 3,
    type: "Female"
  },
  {
    id: 3,
    name: "Campus View Hostel",
    location: "Library Road, Opposite Sports Complex",
    distance: "0.3 km from library",
    price: 18000,
    availability: "Limited",
    verified: true,
    image: getUnsplashImage('room', 800, 600),
    images: [
      getUnsplashImage('room', 800, 600),
      getUnsplashImage('interior', 800, 600),
      getUnsplashImage('building', 800, 600),
      getUnsplashImage('hostel', 800, 600),
      getUnsplashImage('living', 800, 600)
    ],
    amenities: [
      "Water Availability",
      "High-Speed WiFi",
      "24/7 Security",
      "Electricity",
      "Study Room",
      "Cafeteria",
      "Gym",
      "Library Access",
      "Sports Complex Access"
    ],
    description: "Campus View Hostel offers premium accommodation for serious students. Located just 300 meters from the university library and opposite the sports complex, we provide the perfect balance of study and recreation. Our modern facilities include a fully-equipped study room, cafeteria serving healthy meals, and access to the sports complex.",
    rules: [
      "Quiet hours from 10 PM to 6 AM for dedicated study time",
      "Academic performance review each semester",
      "Community meetings every Sunday",
      "Mandatory participation in cleanliness rotations",
      "No external food allowed in rooms"
    ],
    landlord: {
      name: "Dr. James Muthomi",
      phone: "+254 734 567 890",
      email: "admin@campusview-hostels.com"
    },
    rating: 4.9,
    reviewsCount: 67,
    roomsAvailable: 2,
    type: "Male"
  },
  {
    id: 4,
    name: "Unity Hostels",
    location: "Moi Street, Behind Shopping Center",
    distance: "1.2 km from main gate",
    price: 10000,
    availability: "Available",
    verified: false,
    image: getUnsplashImage('living', 800, 600),
    images: [
      getUnsplashImage('living', 800, 600),
      getUnsplashImage('architecture', 800, 600)
    ],
    amenities: [
      "Water Availability",
      "High-Speed WiFi",
      "24/7 Security"
    ],
    description: "Unity Hostels offers budget-friendly accommodation for students. While we may not have all the amenities of premium hostels, we provide a clean and safe environment at the most affordable prices in the area.",
    rules: [
      "Respect community living",
      "Pay rent by the 7th of each month",
      "No sub-letting allowed"
    ],
    landlord: {
      name: "Mr. Peter Odhiambo",
      phone: "+254 745 678 901",
      email: "peter.unityhostels@gmail.com"
    },
    rating: 4.2,
    reviewsCount: 15,
    roomsAvailable: 8,
    type: "Mixed"
  },
  {
    id: 5,
    name: "Scholar's Paradise",
    location: "College Hill, Near Medical School",
    distance: "0.2 km from medical school",
    price: 20000,
    availability: "Available",
    verified: true,
    image: getUnsplashImage('interior', 800, 600),
    images: [
      getUnsplashImage('interior', 800, 600),
      getUnsplashImage('room', 800, 600),
      getUnsplashImage('hostel', 800, 600),
      getUnsplashImage('building', 800, 600)
    ],
    amenities: [
      "Water Availability",
      "High-Speed WiFi",
      "24/7 Security",
      "Electricity",
      "Study Room",
      "Gym",
      "Laundry Facilities",
      "Medical Store Nearby",
      "Cafeteria",
      "Parking Space"
    ],
    description: "Scholar's Paradise is the ultimate accommodation for medical and engineering students. Located just 200 meters from the Medical School, our hostel is designed with students' unique needs in mind. We offer late-night study hours, medical emergency support, and premium amenities.",
    rules: [
      "Dedicated quiet hours from 8 PM to 6 AM",
      "Medical students get priority for late-night access",
      "Group study sessions allowed in common areas",
      "Health and safety compliance required",
      "Regular room inspections for safety"
    ],
    landlord: {
      name: "Dr. Emily Akinyi",
      phone: "+254 756 789 012",
      email: "info@scholarsparadise.co.ke"
    },
    rating: 4.7,
    reviewsCount: 53,
    roomsAvailable: 4,
    type: "Mixed"
  },
  {
    id: 6,
    name: "Budget Stay Hostel",
    location: "Industrial Area, Bus Route",
    distance: "2.0 km from main gate",
    price: 8000,
    availability: "Available",
    verified: false,
    image: getUnsplashImage('architecture', 800, 600),
    images: [
      getUnsplashImage('architecture', 800, 600)
    ],
    amenities: [
      "Water Availability",
      "Security"
    ],
    description: "Budget Stay Hostel provides the most affordable accommodation option for students on a tight budget. While amenities are basic, we ensure a safe and clean environment.",
    rules: [
      "Basic community rules apply",
      "Monthly rent payment required"
    ],
    landlord: {
      name: "Mr. David Njoroge",
      phone: "+254 767 890 123",
      email: "david.budgetstay@gmail.com"
    },
    rating: 3.9,
    reviewsCount: 8,
    roomsAvailable: 12,
    type: "Mixed"
  },
  {
    id: 7,
    name: "Peaceful Gardens Hostel",
    location: "Park View Estate",
    distance: "1.5 km from campus",
    price: 16000,
    availability: "Available",
    verified: true,
    image: getUnsplashImage('living', 800, 600),
    images: [
      getUnsplashImage('living', 800, 600),
      getUnsplashImage('interior', 800, 600),
      getUnsplashImage('hostel', 800, 600)
    ],
    amenities: [
      "Water Availability",
      "High-Speed WiFi",
      "24/7 Security",
      "Electricity",
      "Garden",
      "Laundry Facilities",
      "BBQ Area",
      "Meditation Room"
    ],
    description: "Peaceful Gardens Hostel offers a serene living environment surrounded by beautiful gardens. Perfect for students who value peace and quiet, our hostel provides a tranquil retreat from the hustle and bustle of campus life.",
    rules: [
      "Quiet and peaceful environment required",
      "Gardening activities available on weekends",
      "Meditation room available for all residents",
      "No loud music or parties"
    ],
    landlord: {
      name: "Mrs. Grace Njeri",
      phone: "+254 778 901 234",
      email: "grace@peacefulgardens.co.ke"
    },
    rating: 4.6,
    reviewsCount: 31,
    roomsAvailable: 6,
    type: "Female"
  },
  {
    id: 8,
    name: "Metro Student Living",
    location: "City Center, Near Bus Station",
    distance: "1.8 km from main gate",
    price: 14000,
    availability: "Limited",
    verified: true,
    image: getUnsplashImage('student', 800, 600),
    images: [
      getUnsplashImage('student', 800, 600),
      getUnsplashImage('room', 800, 600),
      getUnsplashImage('hostel', 800, 600)
    ],
    amenities: [
      "Water Availability",
      "High-Speed WiFi",
      "24/7 Security",
      "Electricity",
      "Study Room",
      "Rooftop Lounge",
      "Bike Storage",
      "Package Locker"
    ],
    description: "Metro Student Living is perfect for students who want to be close to the city action while maintaining easy access to campus. Our modern facilities include a rooftop lounge with city views, secure bike storage, and smart package lockers.",
    rules: [
      "City living - some urban noise expected",
      "Bike storage available (registration required)",
      "Rooftop access until 11 PM",
      "Package collection within 24 hours"
    ],
    landlord: {
      name: "Mr. Robert Kiprop",
      phone: "+254 789 012 345",
      email: "robert@metrostudentliving.co.ke"
    },
    rating: 4.4,
    reviewsCount: 24,
    roomsAvailable: 7,
    type: "Mixed"
  }
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Find a hostel by ID
 * @param {number} id - The hostel ID to search for
 * @returns {object|undefined} The hostel object or undefined if not found
 */
export const getHostelById = (id) => {
  return hostels.find(hostel => hostel.id === parseInt(id));
};

/**
 * Filter hostels by various criteria
 * @param {object} filters - Object containing filter criteria
 * @returns {array} Array of filtered hostels
 */
export const filterHostels = (filters = {}) => {
  let filtered = [...hostels];
  
  if (filters.priceMin !== undefined) {
    filtered = filtered.filter(h => h.price >= filters.priceMin);
  }
  if (filters.priceMax !== undefined) {
    filtered = filtered.filter(h => h.price <= filters.priceMax);
  }
  if (filters.distanceMax !== undefined) {
    const distanceNum = parseFloat(filters.distanceMax);
    filtered = filtered.filter(h => {
      const dist = parseFloat(h.distance);
      return !isNaN(dist) && dist <= distanceNum;
    });
  }
  if (filters.amenities && filters.amenities.length > 0) {
    filtered = filtered.filter(h => 
      filters.amenities.every(a => h.amenities.includes(a))
    );
  }
  if (filters.verified !== undefined) {
    filtered = filtered.filter(h => h.verified === filters.verified);
  }
  if (filters.type) {
    filtered = filtered.filter(h => h.type === filters.type);
  }
  
  return filtered;
};

// =============================================================================
// FILTER OPTIONS (for filter components)
// =============================================================================

export const filterOptions = {
  priceRanges: [
    { label: "Under ₦10,000", min: 0, max: 10000 },
    { label: "₦10,000 - ₦15,000", min: 10000, max: 15000 },
    { label: "₦15,000 - ₦20,000", min: 15000, max: 20000 },
    { label: "Over ₦20,000", min: 20000, max: Infinity }
  ],
  distanceRanges: [
    { label: "Within 1 km", max: 1 },
    { label: "1-2 km", min: 1, max: 2 },
    { label: "2-3 km", min: 2, max: 3 },
    { label: "Over 3 km", min: 3 }
  ],
  amenities: [
    { id: "water", label: "Water", icon: "bi-droplet-fill" },
    { id: "wifi", label: "WiFi", icon: "bi-wifi" },
    { id: "security", label: "Security", icon: "bi-shield-check" },
    { id: "electricity", label: "Electricity", icon: "bi-lightning-charge-fill" },
    { id: "laundry", label: "Laundry", icon: "biwasher" },
    { id: "study", label: "Study Room", icon: "bi-book-fill" },
    { id: "gym", label: "Gym", icon: "bi-heart-pulse-fill" },
    { id: "garden", label: "Garden", icon: "bi-tree-fill" }
  ],
  hostelTypes: [
    { id: "male", label: "Male Only" },
    { id: "female", label: "Female Only" },
    { id: "mixed", label: "Mixed" }
  ]
};

// Debug helper - uncomment to log data in console
// console.log('Hostels data loaded:', hostels.map(h => ({ id: h.id, name: h.name, image: h.image })));
