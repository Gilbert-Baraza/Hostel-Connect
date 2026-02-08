import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Form, Alert, Badge, Spinner } from 'react-bootstrap';
import { useAuth } from '../auth/AuthContext';

/**
 * StudentProfile Component
 * Student profile and preferences management
 * 
 * @param {Object} props
 * @param {Object} props.user - Current user object from AuthContext
 * @param {Function} props.onUpdate - Callback to update profile
 */
const StudentProfile = ({ user, onUpdate }) => {
  const { updateProfile, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    university: user?.university || '',
    preferences: {
      budgetRange: user?.preferences?.budgetRange || '3000-5000',
      roomType: user?.preferences?.roomType || 'single',
      distancePreference: user?.preferences?.distancePreference || 'near'
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  // Sync profile state when user data changes
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        university: user.university || '',
        preferences: {
          budgetRange: user.preferences?.budgetRange || '3000-5000',
          roomType: user.preferences?.roomType || 'single',
          distancePreference: user.preferences?.distancePreference || 'near'
        }
      });
    }
  }, [user]);

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Loading profile...</span>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors(prev => ({ ...prev, [name]: '' }));
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfile(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!profile.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    if (!profile.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!profile.university.trim()) {
      newErrors.university = 'University is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    
    setSaveSuccess(true);
    setIsEditing(false);
    if (onUpdate) onUpdate(profile);
    if (updateProfile) updateProfile(profile);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSaveSuccess(false);
    setErrors({});
    // Reset to original user data
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        university: user.university || '',
        preferences: {
          budgetRange: user.preferences?.budgetRange || '3000-5000',
          roomType: user.preferences?.roomType || 'single',
          distancePreference: user.preferences?.distancePreference || 'near'
        }
      });
    }
  };

  const roomTypes = [
    { value: 'single', label: 'Single Room' },
    { value: 'shared', label: 'Shared Room' },
    { value: 'bedsit', label: 'Bedsitter' },
    { value: 'studio', label: 'Studio Apartment' }
  ];

  const budgetRanges = [
    { value: '1000-2000', label: 'KSh 1,000 - 2,000' },
    { value: '2000-3000', label: 'KSh 2,000 - 3,000' },
    { value: '3000-5000', label: 'KSh 3,000 - 5,000' },
    { value: '5000-7000', label: 'KSh 5,000 - 7,000' },
    { value: '7000+', label: 'KSh 7,000+' }
  ];

  const distanceOptions = [
    { value: 'near', label: 'Less than 1km (Near campus)' },
    { value: 'medium', label: '1-3 km (Walking distance)' },
    { value: 'far', label: 'More than 3km (Transport needed)' }
  ];

  // Generate avatar initials
  const getInitials = (name) => {
    if (!name) return 'S';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Get role badge color
  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'student': return 'primary';
      case 'landlord': return 'success';
      case 'admin': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <>
      <Row className="mb-4">
        <Col>
          <h4 className="fw-bold mb-1">
            <i className="bi bi-person me-2"></i>
            Profile & Preferences
          </h4>
          <p className="text-muted mb-0">
            Manage your account and search preferences
          </p>
        </Col>
      </Row>

      {/* Success Message */}
      {saveSuccess && (
        <Row className="mb-4">
          <Col>
            <Alert variant="success" className="border-0 shadow-sm d-flex align-items-center">
              <i className="bi bi-check-circle me-2 fs-5"></i>
              <span>Profile updated successfully!</span>
            </Alert>
          </Col>
        </Row>
      )}

      <Row className="g-4">
        {/* Profile Header Card */}
        <Col xs={12}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="d-flex flex-wrap align-items-center gap-4">
              <div 
                className="profile-avatar d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                style={{ width: '80px', height: '80px', fontSize: '1.75rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                aria-hidden="true"
              >
                {getInitials(profile.name)}
              </div>
              <div className="flex-grow-1">
                <h4 className="fw-bold mb-1">{profile.name || 'Student User'}</h4>
                <p className="text-muted mb-2">{profile.email || 'No email set'}</p>
                <div className="d-flex flex-wrap gap-2">
                  <Badge bg={getRoleBadgeVariant(user?.role)}>
                    <i className="bi bi-person-badge me-1"></i>
                    {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student'}
                  </Badge>
                  {user?.verified?.email && (
                    <Badge bg="success">
                      <i className="bi bi-envelope-check me-1"></i>Email Verified
                    </Badge>
                  )}
                  {user?.verified?.phone && (
                    <Badge bg="success">
                      <i className="bi bi-phone-check me-1"></i>Phone Verified
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                {!isEditing ? (
                  <Button 
                    variant="outline-primary" 
                    onClick={() => setIsEditing(true)}
                    aria-label="Edit profile"
                  >
                    <i className="bi bi-pencil me-1"></i>
                    Edit Profile
                  </Button>
                ) : (
                  <Button 
                    variant="secondary" 
                    onClick={handleCancel}
                    aria-label="Cancel editing"
                  >
                    <i className="bi bi-x me-1"></i>
                    Cancel
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Account Information */}
        <Col xs={12} lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white">
              <div className="d-flex align-items-center justify-content-between">
                <h5 className="mb-0 fw-bold">
                  <i className="bi bi-person-badge me-2"></i>
                  Account Information
                </h5>
              </div>
            </Card.Header>
            <Card.Body>
              <Form noValidate>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter your full name"
                    isInvalid={!!errors.name}
                    aria-label="Full name"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={profile.email}
                    disabled
                    className="bg-light"
                    aria-label="Email address"
                  />
                  <Form.Text className="text-muted">
                    Email cannot be changed
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter your phone number"
                    isInvalid={!!errors.phone}
                    aria-label="Phone number"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.phone}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-0">
                  <Form.Label className="fw-medium">University</Form.Label>
                  <Form.Control
                    type="text"
                    name="university"
                    value={profile.university}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter your university"
                    isInvalid={!!errors.university}
                    aria-label="University"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.university}
                  </Form.Control.Feedback>
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Preferences */}
        <Col xs={12} lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white">
              <h5 className="mb-0 fw-bold">
                <i className="bi bi-sliders me-2"></i>
                Search Preferences
              </h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Budget Range</Form.Label>
                  <Form.Select
                    name="preferences.budgetRange"
                    value={profile.preferences.budgetRange}
                    onChange={handleChange}
                    disabled={!isEditing}
                    aria-label="Budget range"
                  >
                    {budgetRanges.map((range) => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Preferred Room Type</Form.Label>
                  <Form.Select
                    name="preferences.roomType"
                    value={profile.preferences.roomType}
                    onChange={handleChange}
                    disabled={!isEditing}
                    aria-label="Preferred room type"
                  >
                    {roomTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-0">
                  <Form.Label className="fw-medium">Distance Preference</Form.Label>
                  <Form.Select
                    name="preferences.distancePreference"
                    value={profile.preferences.distancePreference}
                    onChange={handleChange}
                    disabled={!isEditing}
                    aria-label="Distance preference"
                  >
                    {distanceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Account Status */}
        <Col xs={12}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0 fw-bold">
                <i className="bi bi-shield-check me-2"></i>
                Account Status
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col xs={12} sm={6} md={3}>
                  <div className="d-flex align-items-center p-3 border rounded">
                    <i className="bi bi-envelope-check fs-4 text-success me-3"></i>
                    <div>
                      <small className="text-muted d-block">Email</small>
                      <Badge bg={user?.verified?.email ? 'success' : 'warning'}>
                        {user?.verified?.email ? 'Verified' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                </Col>
                <Col xs={12} sm={6} md={3}>
                  <div className="d-flex align-items-center p-3 border rounded">
                    <i className="bi bi-phone-check fs-4 text-success me-3"></i>
                    <div>
                      <small className="text-muted d-block">Phone</small>
                      <Badge bg={user?.verified?.phone ? 'success' : 'warning'}>
                        {user?.verified?.phone ? 'Verified' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                </Col>
                <Col xs={12} sm={6} md={3}>
                  <div className="d-flex align-items-center p-3 border rounded">
                    <i className="bi bi-person-check fs-4 text-success me-3"></i>
                    <div>
                      <small className="text-muted d-block">Identity</small>
                      <Badge bg={user?.verified?.identity ? 'success' : 'secondary'}>
                        {user?.verified?.identity ? 'Verified' : 'Not Uploaded'}
                      </Badge>
                    </div>
                  </div>
                </Col>
                <Col xs={12} sm={6} md={3}>
                  <div className="d-flex align-items-center p-3 border rounded">
                    <i className="bi bi-person-vcard fs-4 text-primary me-3"></i>
                    <div>
                      <small className="text-muted d-block">Role</small>
                      <Badge bg="primary">
                        {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student'}
                      </Badge>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Change Password */}
        <Col xs={12}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0 fw-bold">
                <i className="bi bi-key me-2"></i>
                Security
              </h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Row className="g-3">
                  <Col xs={12} md={4}>
                    <Form.Group>
                      <Form.Label className="fw-medium">Current Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Enter current password"
                        disabled={!isEditing}
                        aria-label="Current password"
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={4}>
                    <Form.Group>
                      <Form.Label className="fw-medium">New Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Enter new password"
                        disabled={!isEditing}
                        aria-label="New password"
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={4}>
                    <Form.Group>
                      <Form.Label className="fw-medium">Confirm Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Confirm new password"
                        disabled={!isEditing}
                        aria-label="Confirm password"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Action Buttons */}
        {isEditing && (
          <Col xs={12}>
            <div className="d-flex gap-2 justify-content-end">
              <Button variant="secondary" onClick={handleCancel}>
                <i className="bi bi-x me-1"></i>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave}>
                <i className="bi bi-check me-1"></i>
                Save Changes
              </Button>
            </div>
          </Col>
        )}
      </Row>

      <style>{`
        .form-control:disabled, .form-select:disabled {
          background: var(--gray-100);
          opacity: 0.7;
        }
        
        .profile-avatar {
          flex-shrink: 0;
        }
      `}</style>
    </>
  );
};

export default StudentProfile;
