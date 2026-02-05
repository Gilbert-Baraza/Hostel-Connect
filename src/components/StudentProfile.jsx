import React, { useState } from 'react';
import { Row, Col, Card, Button, Form, Alert, Badge } from 'react-bootstrap';

/**
 * StudentProfile Component
 * Student profile and preferences management
 * 
 * @param {Object} props
 * @param {Object} props.user - Current user object from AuthContext
 * @param {Function} props.onUpdate - Callback to update profile
 */
const StudentProfile = ({ user, onUpdate }) => {
  const [profile, setProfile] = useState({
    name: user?.name || 'Test Student',
    email: user?.email || 'student@test.com',
    phone: '+254 712 345 678',
    university: 'Egerton University',
    preferences: {
      budgetRange: '3000-5000',
      roomType: 'single',
      distancePreference: 'near'
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
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

  const handleSave = () => {
    setSaveSuccess(true);
    setIsEditing(false);
    if (onUpdate) onUpdate(profile);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSaveSuccess(false);
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
            <Alert variant="success" className="border-0 shadow-sm">
              <i className="bi bi-check-circle me-2"></i>
              Profile updated successfully!
            </Alert>
          </Col>
        </Row>
      )}

      <Row className="g-4">
        {/* Account Information */}
        <Col xs={12} lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white">
              <div className="d-flex align-items-center justify-content-between">
                <h5 className="mb-0 fw-bold">
                  <i className="bi bi-person-badge me-2"></i>
                  Account Information
                </h5>
                {!isEditing && (
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <i className="bi bi-pencil me-1"></i>
                    Edit
                  </Button>
                )}
              </div>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter your full name"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={profile.email}
                    disabled
                    className="bg-light"
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
                  />
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
                  />
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
                      <Badge bg="success">Verified</Badge>
                    </div>
                  </div>
                </Col>
                <Col xs={12} sm={6} md={3}>
                  <div className="d-flex align-items-center p-3 border rounded">
                    <i className="bi bi-phone-check fs-4 text-success me-3"></i>
                    <div>
                      <small className="text-muted d-block">Phone</small>
                      <Badge bg="success">Verified</Badge>
                    </div>
                  </div>
                </Col>
                <Col xs={12} sm={6} md={3}>
                  <div className="d-flex align-items-center p-3 border rounded">
                    <i className="bi bi-person-check fs-4 text-success me-3"></i>
                    <div>
                      <small className="text-muted d-block">Identity</small>
                      <Badge bg="success">Verified</Badge>
                    </div>
                  </div>
                </Col>
                <Col xs={12} sm={6} md={3}>
                  <div className="d-flex align-items-center p-3 border rounded">
                    <i className="bi bi-person-vcard fs-4 text-primary me-3"></i>
                    <div>
                      <small className="text-muted d-block">Role</small>
                      <Badge bg="primary">Student</Badge>
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
      `}</style>
    </>
  );
};

export default StudentProfile;
