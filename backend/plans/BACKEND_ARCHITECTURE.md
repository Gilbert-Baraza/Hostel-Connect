# Hostel Connect - Production-Grade Backend Architecture

## 1. System Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CLIENT LAYER                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   React     │  │   React     │  │   React     │  │   Mobile    │        │
│  │  (Student)  │  │  (Landlord) │  │   (Admin)   │  │     App     │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
└─────────┼────────────────┼────────────────┼────────────────┼────────────────┘
          │                │                │                │
          └────────────────┴────────────────┴────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY                                     │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐                 │
│  │  Rate Limiting │  │    JWT Auth    │  │  Role-Based    │                 │
│  │    (Redis)     │  │    (Verify)    │  │    Access      │                 │
│  └────────────────┘  └────────────────┘  └────────────────┘                 │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION SERVER                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                           Express.js Server                           │    │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐            │    │
│  │  │  Routes   │ │Controllers│ │ Services  │ │ Middleware│            │    │
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘            │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                      │
│  ┌─────────────────────────┐              ┌─────────────────────────┐      │
│  │      MongoDB Atlas       │              │       Redis             │      │
│  │   (Primary Database)     │              │   (Caching/Sessions)    │      │
│  └─────────────────────────┘              └─────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 API Flow

```mermaid
sequenceDiagram
    participant Client
    participant API_Gateway
    participant Auth_Middleware
    participant Controller
    participant Service
    participant MongoDB

    Client->>API_Gateway: API Request + JWT Token
    API_Gateway->>Auth_Middleware: Verify Token
    
    alt Invalid Token
        Auth_Middleware-->>Client: 401 Unauthorized
    else Valid Token
        Auth_Middleware->>Auth_Middleware: Extract User Role
        Auth_Middleware->>Auth_Middleware: Check Permissions
        
        alt Insufficient Permissions
            Auth_Middleware-->>Client: 403 Forbidden
        else Authorized
            Auth_Middleware->>Controller: Route Request
            Controller->>Service: Process Business Logic
            Service->>MongoDB: Database Operations
            MongoDB-->>Service: Query Results
            Service-->>Controller: Processed Data
            Controller-->>Client: JSON Response
        end
    end
```

### 1.3 Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Auth_Controller
    participant User_Model
    participant JWT_Service
    participant Redis

    User->>Auth_Controller: POST /api/auth/register
    Auth_Controller->>User_Model: Create User Document
    User_Model-->>Auth_Controller: User Created (unverified)
    
    User->>Auth_Controller: POST /api/auth/login
    Auth_Controller->>User_Model: Find User by Email
    User_Model-->>Auth_Controller: User Data
    Auth_Controller->>Auth_Controller: Validate Password (bcrypt)
    
    alt Valid Credentials
        Auth_Controller->>JWT_Service: Generate Tokens
        JWT_Service-->>Auth_Controller: Access + Refresh Tokens
        Auth_Controller->>Redis: Store Refresh Token
        Auth_Controller-->>User: { accessToken, refreshToken, user }
    else Invalid Credentials
        Auth_Controller-->>User: 401 Invalid credentials
    end

    User->>Auth_Controller: POST /api/auth/refresh
    Auth_Controller->>Redis: Validate Refresh Token
    Auth_Controller->>JWT_Service: Generate New Access Token
    Auth_Controller-->>User: { accessToken }
```

### 1.4 Separation of Concerns

| Layer | Responsibility | Examples |
|-------|---------------|----------|
| **Routes** | HTTP method routing, URL mapping | `router.post('/login', authController.login)` |
| **Controllers** | Request/response handling, input validation | Extract params, call services, format responses |
| **Services** | Business logic, data transformation | `hostelService.createHostel(data)` |
| **Models** | Schema definitions, database operations | Mongoose schemas, static methods |
| **Middleware** | Cross-cutting concerns | Auth verification, role checks, rate limiting |
| **Utils** | Helper functions | JWT generation, password hashing, validation |

---

## 2. Database Design (MongoDB + Mongoose)

### 2.1 User Schema

```javascript
// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['student', 'landlord', 'admin'],
    required: true
  },
  accountStatus: {
    type: String,
    enum: ['active', 'suspended', 'deactivated'],
    default: 'active',
    index: true
  },
  isVerified: {
    type: Boolean,
    default: false,
    index: true
  },
  verificationDocuments: [{
    type: {
      type: String,
      enum: ['national_id', 'university_id', 'property_deeds', 'business_license']
    },
    url: String,
    uploadedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  }],
  profileImage: String,
  lastLogin: Date,
  refreshTokens: [{
    token: String,
    expiresAt: Date,
    userAgent: String,
    createdAt: { type: Date, default: Date.now }
  }],
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  loginAttempts: {
    count: { type: Number, default: 0 },
    lastAttempt: Date
  }
}, {
  timestamps: true
});

// Indexes for performance
userSchema.index({ email: 1, role: 1 });
userSchema.index({ accountStatus: 1, isVerified: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if account is locked
userSchema.methods.isLocked = function() {
  return this.accountStatus === 'suspended';
};

// Increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // Reset attempts if lock has expired
  if (this.loginAttempts.lastAttempt && 
      Date.now() - this.loginAttempts.lastAttempt > 2 * 60 * 60 * 1000) {
    return this.updateOne({
      $set: { 'loginAttempts.count': 1, 'loginAttempts.lastAttempt': new Date() }
    });
  }
  return this.updateOne({
    $inc: { 'loginAttempts.count': 1 },
    $set: { 'loginAttempts.lastAttempt': new Date() }
  });
};

// Hide sensitive fields when converting to JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.refreshTokens;
  delete user.passwordResetToken;
  delete user.__v;
  return user;
};

module.exports = mongoose.model('User', userSchema);
```

### 2.2 Hostel Schema

```javascript
// models/Hostel.js
const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  county: String,
  postalCode: String,
  landmark: String,
  coordinates: {
    latitude: { type: Number, min: -90, max: 90 },
    longitude: { type: Number, min: -180, max: 180 }
  }
}, { _id: false });

const amenitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ['essential', 'comfort', 'security', 'study', 'entertainment'],
    required: true
  }
}, { _id: false });

const hostelSchema = new mongoose.Schema({
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: 2000
  },
  address: {
    type: addressSchema,
    required: true
  },
  university: {
    name: String,
    distanceKm: Number
  },
  hostelType: {
    type: String,
    enum: ['male', 'female', 'mixed'],
    required: true
  },
  amenities: [amenitySchema],
  images: [{
    url: String,
    caption: String,
    isPrimary: { type: Boolean, default: false },
    uploadedAt: { type: Date, default: Date.now }
  }],
  houseRules: {
    curfew: String,
    visitorsAllowed: Boolean,
    smokingAllowed: Boolean,
    petAllowed: Boolean,
    additionalRules: [String]
  },
  pricing: {
    minPrice: { type: Number, required: true },
    maxPrice: Number,
    currency: { type: String, default: 'KES' },
    priceNegotiable: { type: Boolean, default: false }
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'under_review', 'verified', 'rejected', 'suspended'],
    default: 'pending',
    index: true
  },
  verificationNotes: {
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    rejectionReason: String
  },
  visibilityStatus: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
    index: true
  },
  statistics: {
    totalViews: { type: Number, default: 0 },
    totalInquiries: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 }
  },
  featured: {
    type: Boolean,
    default: false
  },
  flaggedCount: {
    type: Number,
    default: 0,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
hostelSchema.index({ 'address.city': 1, 'address.county': 1 });
hostelSchema.index({ hostelType: 1, 'pricing.minPrice': 1 });
hostelSchema.index({ verificationStatus: 1, visibilityStatus: 1 });
hostelSchema.index({ landlord: 1, createdAt: -1 });
hostelSchema.index({ 'university.name': 'text', name: 'text', description: 'text' });

// Virtual for rooms
hostelSchema.virtual('rooms', {
  ref: 'Room',
  localField: '_id',
  foreignField: 'hostel'
});

// Static method to find hostels by criteria
hostelSchema.statics.findByFilters = async function(filters) {
  const query = {};
  
  if (filters.hostelType) query.hostelType = filters.hostelType;
  if (filters.city) query['address.city'] = filters.city;
  if (filters.minPrice) query['pricing.minPrice'] = { $gte: filters.minPrice };
  if (filters.maxPrice) query['pricing.maxPrice'] = { $lte: filters.maxPrice };
  if (filters.verificationStatus) query.verificationStatus = filters.verificationStatus;
  if (filters.university) query['university.name'] = { $regex: filters.university, $options: 'i' };
  
  // Only show verified and published hostels to students
  if (filters.publicView) {
    query.verificationStatus = 'verified';
    query.visibilityStatus = 'published';
  }
  
  return this.find(query)
    .populate('landlord', 'name email phone')
    .sort(filters.sort || { createdAt: -1 })
    .skip(filters.skip || 0)
    .limit(filters.limit || 20);
};

module.exports = mongoose.model('Hostel', hostelSchema);
```

### 2.3 Room Schema

```javascript
// models/Room.js
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: true,
    index: true
  },
  roomNumber: {
    type: String,
    required: true
  },
  roomType: {
    type: String,
    enum: ['single', 'double', 'triple', 'quad', 'studio', 'bedspace'],
    required: true
  },
  description: String,
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  pricing: {
    amount: { type: Number, required: true },
    period: { type: String, enum: ['monthly', 'semester', 'yearly'], default: 'monthly' },
    currency: { type: String, default: 'KES' },
    deposit: Number,
    depositNonRefundable: Boolean
  },
  availability: {
    type: String,
    enum: ['available', 'reserved', 'occupied', 'maintenance'],
    default: 'available',
    index: true
  },
  availableBeds: {
    type: Number,
    default: 0
  },
  features: {
    bed: { type: Boolean, default: true },
    desk: { type: Boolean, default: true },
    wardrobe: { type: Boolean, default: true },
    window: { type: Boolean, default: false },
    ac: { type: Boolean, default: false },
    balcony: { type: Boolean, default: false },
    ensuiteBathroom: { type: Boolean, default: false }
  },
  images: [{
    url: String,
    caption: String
  }],
  occupancyHistory: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    checkIn: Date,
    checkOut: Date,
    status: { type: String, enum: ['confirmed', 'active', 'completed', 'cancelled'] }
  }]
}, {
  timestamps: true
});

// Compound index for unique room per hostel
roomSchema.index({ hostel: 1, roomNumber: 1 }, { unique: true });
roomSchema.index({ hostel: 1, availability: 1 });

// Pre-save hook to update availableBeds
roomSchema.pre('save', function(next) {
  if (this.isModified('capacity') || this.isModified('occupancyHistory')) {
    const occupied = this.occupancyHistory.filter(
      o => o.status === 'confirmed' || o.status === 'active'
    ).length;
    this.availableBeds = this.capacity - occupied;
  }
  next();
});

module.exports = mongoose.model('Room', roomSchema);
```

### 2.4 SavedHostel Schema

```javascript
// models/SavedHostel.js
const mongoose = require('mongoose');

const savedHostelSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: true,
    index: true
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound unique index to prevent duplicate saves
savedHostelSchema.index({ student: 1, hostel: 1 }, { unique: true });

// Static method to find all saved hostels for a student
savedHostelSchema.statics.findByStudent = function(studentId, options = {}) {
  return this.find({ student: studentId })
    .populate({
      path: 'hostel',
      populate: {
        path: 'landlord',
        select: 'name email phone'
      }
    })
    .sort({ createdAt: -1 })
    .skip(options.skip || 0)
    .limit(options.limit || 20);
};

module.exports = mongoose.model('SavedHostel', savedHostelSchema);
```

### 2.5 Viewing/Booking Request Schema

```javascript
// models/Request.js
const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: true,
    index: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  },
  requestType: {
    type: String,
    enum: ['viewing', 'booking', 'inquiry'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rejected'],
    default: 'pending',
    index: true
  },
  preferredDates: [{
    date: Date,
    timeSlot: {
      start: String,
      end: String
    }
  }],
  scheduledDate: Date,
  message: {
    type: String,
    maxlength: 1000
  },
  landlordResponse: {
    status: { type: String, enum: ['pending', 'accepted', 'declined', 'rescheduled'] },
    message: String,
    responseDate: Date,
    scheduledDate: Date
  },
  metadata: {
    source: { type: String, default: 'web' },
    utmSource: String,
    utmMedium: String
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    }
  }
}, {
  timestamps: true
});

// Indexes
requestSchema.index({ student: 1, status: 1, createdAt: -1 });
requestSchema.index({ hostel: 1, status: 1, createdAt: -1 });
requestSchema.index({ status: 1, expiresAt: 1 }, { expireAfterSeconds: 0 });

// Prevent duplicate pending requests for same hostel
requestSchema.index({ student: 1, hostel: 1, status: 1 }, { unique: true });

module.exports = mongoose.model('Request', requestSchema);
```

### 2.6 Report/Flag Schema

```javascript
// models/Report.js
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel'
  },
  reportType: {
    type: String,
    enum: [
      'fake_listing',
      'misleading_photos',
      'safety_concern',
      'harassment',
      'spam',
      'inappropriate_content',
      'other'
    ],
    required: true
  },
  reason: {
    type: String,
    required: true,
    maxlength: 2000
  },
  evidence: [{
    type: { type: String },
    url: String,
    description: String
  }],
  status: {
    type: String,
    enum: ['pending', 'under_review', 'resolved', 'dismissed'],
    default: 'pending',
    index: true
  },
  adminNotes: {
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    actionTaken: String,
    resolution: String,
    adminComments: String
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    index: true
  }
}, {
  timestamps: true
});

// Indexes
reportSchema.index({ status: 1, priority: 1, createdAt: -1 });
reportSchema.index({ hostel: 1, status: 1 });
reportSchema.index({ reportedUser: 1, status: 1 });

module.exports = mongoose.model('Report', reportSchema);
```

---

## 3. API Endpoint Design

### 3.1 Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| POST | `/api/auth/logout` | Logout user | Authenticated |
| POST | `/api/auth/refresh` | Refresh access token | Public (with refresh token) |
| POST | `/api/auth/forgot-password` | Request password reset | Public |
| POST | `/api/auth/reset-password` | Reset password | Public (with token) |
| GET | `/api/auth/me` | Get current user | Authenticated |
| PUT | `/api/auth/profile` | Update profile | Authenticated |

#### Request/Response Examples

**Register:**
```json
POST /api/auth/register
{
  "email": "student@uni.edu",
  "password": "SecurePass123!",
  "name": "John Doe",
  "phone": "+254700000000",
  "role": "student"
}

Response (201 Created):
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "student@uni.edu",
      "name": "John Doe",
      "role": "student",
      "isVerified": false
    },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

**Login:**
```json
POST /api/auth/login
{
  "email": "landlord@example.com",
  "password": "SecurePass123!"
}

Response (200 OK):
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "landlord@example.com",
      "name": "Jane Smith",
      "role": "landlord",
      "isVerified": true,
      "accountStatus": "active"
    },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

### 3.2 Student Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/hostels` | List all verified hostels | Student |
| GET | `/api/hostels/:id` | Get hostel details | Student |
| GET | `/api/hostels/:id/rooms` | Get available rooms | Student |
| GET | `/api/saved-hostels` | Get saved hostels | Student |
| POST | `/api/saved-hostels` | Save a hostel | Student |
| DELETE | `/api/saved-hostels/:id` | Unsave a hostel | Student |
| POST | `/api/requests` | Create viewing/booking request | Student |
| GET | `/api/requests` | Get my requests | Student |
| GET | `/api/requests/:id` | Get request details | Student |
| DELETE | `/api/requests/:id` | Cancel request | Student |
| POST | `/api/reports` | Report a listing/user | Student |
| GET | `/api/landlords/:id/reviews` | Get landlord reviews | Student |

### 3.3 Landlord Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/hostels` | Create new hostel listing | Landlord |
| GET | `/api/hostels/my-listings` | Get my hostels | Landlord |
| GET | `/api/hostels/:id` | Get my hostel details | Landlord (owner) |
| PUT | `/api/hostels/:id` | Update hostel | Landlord (owner) |
| PATCH | `/api/hostels/:id/visibility` | Toggle visibility | Landlord (owner) |
| DELETE | `/api/hostels/:id` | Delete hostel | Landlord (owner) |
| POST | `/api/hostels/:id/rooms` | Add room to hostel | Landlord (owner) |
| PUT | `/api/rooms/:id` | Update room | Landlord (owner) |
| PATCH | `/api/rooms/:id/availability` | Toggle room availability | Landlord (owner) |
| DELETE | `/api/rooms/:id` | Delete room | Landlord (owner) |
| GET | `/api/requests/received` | Get requests for my hostels | Landlord |
| PATCH | `/api/requests/:id/respond` | Respond to request | Landlord |
| GET | `/api/verifications/my-documents` | Get verification status | Landlord |
| POST | `/api/verifications` | Submit verification documents | Landlord |
| GET | `/api/analytics/hostel/:id` | Get hostel analytics | Landlord (owner) |

### 3.4 Admin Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/admin/users` | List all users | Admin |
| GET | `/api/admin/users/:id` | Get user details | Admin |
| PATCH | `/api/admin/users/:id/status` | Update user status | Admin |
| DELETE | `/api/admin/users/:id` | Deactivate user | Admin |
| GET | `/api/admin/landlords/pending` | Get unverified landlords | Admin |
| PATCH | `/api/admin/landlords/:id/verify` | Verify landlord | Admin |
| GET | `/api/admin/hostels/pending` | Get unverified hostels | Admin |
| PATCH | `/api/admin/hostels/:id/verify` | Verify hostel | Admin |
| PATCH | `/api/admin/hostels/:id/suspend` | Suspend hostel | Admin |
| GET | `/api/admin/reports` | Get all reports | Admin |
| PATCH | `/api/admin/reports/:id` | Process report | Admin |
| GET | `/api/admin/analytics` | Platform analytics | Admin |
| GET | `/api/admin/audit-log` | Audit log | Admin |

---

## 4. Authorization Rules

### 4.1 Role Capabilities Matrix

| Action | Student | Landlord | Admin |
|--------|---------|----------|-------|
| View verified hostels | ✅ | ✅ | ✅ |
| Save/bookmark hostels | ✅ | ❌ | ❌ |
| Create viewing request | ✅ | ❌ | ❌ |
| Create hostel listing | ❌ | ✅ | ✅ |
| Edit own hostel listing | ❌ | ✅ | ✅ |
| Delete own hostel | ❌ | ✅ | ✅ |
| Verify landlords | ❌ | ❌ | ✅ |
| Verify hostels | ❌ | ❌ | ✅ |
| Suspend users | ❌ | ❌ | ✅ |
| Access admin dashboard | ❌ | ❌ | ✅ |
| View platform analytics | ❌ | Limited | ✅ |
| Submit reports | ✅ | ✅ | ✅ |
| Process reports | ❌ | ❌ | ✅ |

### 4.2 Data Visibility Rules

```javascript
// middleware/authorization.js

// Rule: Students cannot see unverified listings
const verifyLandlordOnly = (req, res, next) => {
  if (req.user.role !== 'landlord') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Landlord role required.'
    });
  }
  next();
};

// Rule: Students only see verified and published hostels
const filterPublicHostels = async (req, res, next) => {
  if (req.user.role === 'student') {
    req.query.verificationStatus = 'verified';
    req.query.visibilityStatus = 'published';
  }
  next();
};

// Rule: Landlord can only access their own listings
const ownsHostel = async (req, res, next) => {
  const hostel = await Hostel.findById(req.params.id);
  
  if (!hostel) {
    return res.status(404).json({
      success: false,
      error: 'Hostel not found'
    });
  }
  
  if (hostel.landlord.toString() !== req.user._id.toString() && 
      req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to access this resource'
    });
  }
  
  req.hostel = hostel;
  next();
};

// Rule: Admin override - can access any resource
const adminOverride = (req, res, next) => {
  if (req.user.role === 'admin') {
    req.adminOverride = true;
  }
  next();
};
```

### 4.3 Landlord Contact Visibility

```javascript
// Only reveal landlord contact after booking confirmation
const sanitizeHostelResponse = (hostel, user) => {
  const sanitized = hostel.toObject();
  
  // Students only see basic info until verified
  if (user.role === 'student') {
    sanitized.landlord = {
      name: sanitized.landlord.name,
      // Hide contact info from students
      phone: undefined,
      email: undefined
    };
    
    // Only show exact location after booking
    sanitized.address.landmark = undefined;
    sanitized.address.coordinates = undefined;
  }
  
  // Verified users see more details
  if (user.role === 'landlord' || user.role === 'admin') {
    // Show all details
  }
  
  return sanitized;
};
```

---

## 5. Security Considerations

### 5.1 Authentication Security

```javascript
// middleware/auth.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Redis = require('../utils/redis');

const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User no longer exists.'
      });
    }
    
    // Check if user changed password after token was issued
    if (user.passwordChangedAt) {
      const changedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
      if (decoded.iat < changedTimestamp) {
        return res.status(401).json({
          success: false,
          error: 'Password recently changed. Please log in again.'
        });
      }
    }
    
    // Check if account is locked
    if (user.isLocked()) {
      return res.status(423).json({
        success: false,
        error: 'Account is temporarily locked.'
      });
    }
    
    // Add user to request
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired.',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    next(error);
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Role ${req.user.role} is not authorized to access this route.`
      });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
```

### 5.2 Rate Limiting

```javascript
// middleware/rateLimiter.js

const rateLimit = require('express-rate-limit');
const Redis = require('ioredis');

// Custom store using Redis
class RedisStore extends rateLimit.Store {
  constructor(options) {
    super(options);
    this.client = new Redis(process.env.REDIS_URL);
    this.windowMs = options.windowMs || 60000;
    this.max = options.max || 100;
  }
  
  async increment(key) {
    const results = await this.client.multi()
      .incr(key)
      .expire(key, Math.ceil(this.windowMs / 1000))
      .exec();
    return results[0][1];
  }
  
  async decrement(key) {
    return this.client.decr(key);
  }
  
  async resetKey(key) {
    return this.client.del(key);
  }
}

// General API rate limiter
const apiLimiter = rateLimit({
  store: new RedisStore(),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    error: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter limiter for auth endpoints
const authLimiter = rateLimit({
  store: new RedisStore(),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 login attempts per hour
  message: {
    success: false,
    error: 'Too many login attempts. Please try again after an hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Don't count successful logins
});

// Very strict limiter for password reset
const passwordResetLimiter = rateLimit({
  store: new RedisStore(),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: {
    success: false,
    error: 'Too many password reset attempts.'
  }
});

module.exports = { apiLimiter, authLimiter, passwordResetLimiter };
```

### 5.3 Input Validation

```javascript
// utils/validators.js

const Joi = require('joi');

const registerValidator = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .required()
    .messages({
      'string.pattern.base': 'Password must be at least 8 characters with uppercase, lowercase, number and special character'
    }),
  name: Joi.string().min(2).max(100).required(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
  role: Joi.string().valid('student', 'landlord').required()
});

const hostelValidator = Joi.object({
  name: Joi.string().min(3).max(200).required(),
  description: Joi.string().max(2000),
  address: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    county: Joi.string().required(),
    postalCode: Joi.string(),
    landmark: Joi.string(),
    coordinates: Joi.object({
      latitude: Joi.number().min(-90).max(90),
      longitude: Joi.number().min(-180).max(180)
    })
  }).required(),
  hostelType: Joi.string().valid('male', 'female', 'mixed').required(),
  amenities: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    category: Joi.string().valid('essential', 'comfort', 'security', 'study', 'entertainment').required()
  })),
  pricing: Joi.object({
    minPrice: Joi.number().positive().required(),
    maxPrice: Joi.number().positive().greater(Joi.ref('minPrice')),
    currency: Joi.string().default('KES')
  }).required()
});

const validate = (validator) => {
  return (req, res, next) => {
    const { error } = validator.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map(d => ({
          field: d.path.join('.'),
          message: d.message
        }))
      });
    }
    
    next();
  };
};

module.exports = { registerValidator, hostelValidator, validate };
```

### 5.4 Audit Logging

```javascript
// middleware/auditLogger.js

const AuditLog = require('../models/AuditLog');

const auditLogger = (action) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);
    
    // Override json method
    res.json = async function(data) {
      // Only log admin actions
      if (req.user && req.user.role === 'admin') {
        try {
          await AuditLog.create({
            user: req.user._id,
            action,
            resourceType: getResourceType(req.originalUrl),
            resourceId: req.params.id,
            previousState: req.previousState,
            newState: data,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            statusCode: res.statusCode
          });
        } catch (error) {
          console.error('Audit log error:', error);
        }
      }
      
      return originalJson(data);
    };
    
    next();
  };
};

const getResourceType = (url) => {
  if (url.includes('/users')) return 'User';
  if (url.includes('/hostels')) return 'Hostel';
  if (url.includes('/reports')) return 'Report';
  return 'Unknown';
};

module.exports = auditLogger;
```

---

## 6. MongoDB Best Practices

### 6.1 Indexing Strategy

```javascript
// models/indexes.js

// User indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1, accountStatus: 1 });
UserSchema.index({ createdAt: -1 });

// Hostel indexes
HostelSchema.index({ 'address.city': 1, 'address.county': 1 });
HostelSchema.index({ verificationStatus: 1, visibilityStatus: 1 });
HostelSchema.index({ landlord: 1, createdAt: -1 });
HostelSchema.index({ hostelType: 1, 'pricing.minPrice': 1 });
HostelSchema.index({ 'university.name': 'text', name: 'text', description: 'text' });

// Room indexes
RoomSchema.index({ hostel: 1, roomNumber: 1 }, { unique: true });
RoomSchema.index({ hostel: 1, availability: 1 });

// Request indexes
RequestSchema.index({ student: 1, status: 1, createdAt: -1 });
RequestSchema.index({ hostel: 1, status: 1 });
RequestSchema.index({ status: 1, expiresAt: 1 }, { expireAfterSeconds: 0 });

// Report indexes
ReportSchema.index({ status: 1, priority: 1 });
ReportSchema.index({ hostel: 1, status: 1 });
```

### 6.2 Soft Delete Pattern

```javascript
// models/mixins/softDelete.js

const softDeletePlugin = (schema) => {
  schema.add({
    deletedAt: {
      type: Date,
      index: true
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  });
  
  schema.methods.softDelete = async function(userId) {
    this.deletedAt = new Date();
    this.deletedBy = userId;
    return this.save();
  };
  
  schema.methods.restore = async function() {
    this.deletedAt = undefined;
    this.deletedBy = undefined;
    return this.save();
  };
  
  // Override find to exclude soft-deleted documents
  schema.statics.find = function(...args) {
    return super.find(...args).where('deletedAt').equals(null);
  };
  
  schema.statics.findOne = function(...args) {
    return super.findOne(...args).where('deletedAt').equals(null);
  };
};

module.exports = softDeletePlugin;
```

### 6.3 Connection Management

```javascript
// config/database.js

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });
    
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.warn('MongoDB connection closed through app termination');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

---

## 7. Folder Structure

```
backend/
├── .env.example                    # Environment variables template
├── .gitignore
├── package.json
├── README.md
└── src/
    ├── app.js                      # Express app entry point
    ├── server.js                    # Server startup
    │
    ├── config/
    │   ├── database.js              # MongoDB connection
    │   ├── redis.js                 # Redis client
    │   └── jwt.js                   # JWT configuration
    │
    ├── controllers/
    │   ├── authController.js
    │   ├── hostelController.js
    │   ├── roomController.js
    │   ├── requestController.js
    │   ├── savedHostelController.js
    │   ├── reportController.js
    │   └── adminController.js
    │
    ├── middleware/
    │   ├── auth.js                  # JWT authentication
    │   ├── authorization.js         # Role-based access
    │   ├── rateLimiter.js           # Rate limiting
    │   ├── validation.js            # Input validation
    │   ├── errorHandler.js          # Global error handling
    │   ├── auditLogger.js           # Audit logging
    │   └── upload.js                # File upload handling
    │
    ├── models/
    │   ├── User.js
    │   ├── Hostel.js
    │   ├── Room.js
    │   ├── Request.js
    │   ├── SavedHostel.js
    │   ├── Report.js
    │   ├── AuditLog.js
    │   └── index.js                 # Model exports
    │
    ├── routes/
    │   ├── authRoutes.js
    │   ├── hostelRoutes.js
    │   ├── roomRoutes.js
    │   ├── requestRoutes.js
    │   ├── savedHostelRoutes.js
    │   ├── reportRoutes.js
    │   ├── adminRoutes.js
    │   └── index.js                 # Route exports
    │
    ├── services/
    │   ├── authService.js
    │   ├── hostelService.js
    │   ├── emailService.js
    │   ├── notificationService.js
    │   └── analyticsService.js
    │
    ├── utils/
    │   ├── validators.js            # Joi validation schemas
    │   ├── helpers.js               # Common helper functions
    │   ├── errorResponse.js         # Custom error classes
    │   └── redisCache.js            # Redis caching utilities
    │
    └── uploads/                     # Temporary file uploads
        └── .gitkeep
```

---

## 8. Environment Variables

```bash
# .env.example

# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hostel_connect?retryWrites=true&w=majority

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./src/uploads

# Email (for notifications)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
```

---

## Summary

This architecture provides:

1. **Secure Authentication**: JWT with refresh tokens, bcrypt password hashing, rate limiting
2. **Role-Based Access**: Three distinct roles with granular permissions
3. **Scalable Data Model**: Normalized schemas with proper indexing
4. **Audit Trail**: Complete logging of admin actions
5. **Performance**: Redis caching, proper indexing, connection pooling
6. **API-First Design**: RESTful endpoints matching frontend requirements
7. **Production-Ready**: Error handling, validation, soft deletes, monitoring hooks
