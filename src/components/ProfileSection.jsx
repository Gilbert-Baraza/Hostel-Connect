import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useAuth } from '../auth/AuthContext';

/**
 * ProfileSection Component
 * Manages landlord profile information
 */
const ProfileSection = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    emergencyContact: ''
  });

  const [saved, setSaved] = useState(false);
  const [validated, setValidated] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simulate API call
    console.log('Profile data to save:', formData);
    setSaved(true);
    
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Row className="g-4">
      {/* Profile Information */}
      <Col lg={8}>
        <Card className="profile-card border-0 shadow-sm">
          <Card.Header className="bg-white">
            <h5 className="mb-0 fw-bold">
              <i className="bi bi-person me-2"></i>
              Profile Information
            </h5>
          </Card.Header>
          <Card.Body className="p-4">
            {saved && (
              <Alert variant="success" className="mb-3">
                <i className="bi bi-check-circle me-2"></i>
                Profile updated successfully!
              </Alert>
            )}

            <Form noValidate validated={validated} onSubmit={handleSubmit}>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group controlId="name">
                    <Form.Label className="fw-medium">Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group controlId="email">
                    <Form.Label className="fw-medium">Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      disabled
                    />
                    <small className="text-muted">Email cannot be changed</small>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group controlId="phone">
                    <Form.Label className="fw-medium">Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group controlId="address">
                    <Form.Label className="fw-medium">Address</Form.Label>
                    <Form.Control
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter your address"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group controlId="emergencyContact">
                    <Form.Label className="fw-medium">Emergency Contact</Form.Label>
                    <Form.Control
                      type="tel"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                      placeholder="Emergency contact number"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="mt-4">
                <Button variant="primary" type="submit">
                  <i className="bi bi-check-lg me-2"></i>
                  Save Changes
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Col>

      {/* Account Info Sidebar */}
      <Col lg={4}>
        <Card className="account-info-card border-0 shadow-sm mb-4">
          <Card.Header className="bg-white">
            <h6 className="mb-0 fw-bold">
              <i className="bi bi-shield-check me-2"></i>
              Account Information
            </h6>
          </Card.Header>
          <Card.Body>
            <div className="account-detail mb-3">
              <small className="text-muted d-block">Account Type</small>
              <span className="badge bg-primary">Landlord</span>
            </div>
            <div className="account-detail mb-3">
              <small className="text-muted d-block">Member Since</small>
              <span>January 2024</span>
            </div>
            <div className="account-detail mb-3">
              <small className="text-muted d-block">Verification Status</small>
              <span className="badge bg-success">
                <i className="bi bi-patch-check-fill me-1"></i>
                Verified
              </span>
            </div>
          </Card.Body>
        </Card>

        <Card className="password-card border-0 shadow-sm">
          <Card.Header className="bg-white">
            <h6 className="mb-0 fw-bold">
              <i className="bi bi-lock me-2"></i>
              Change Password
            </h6>
          </Card.Header>
          <Card.Body>
            <Form>
              <Form.Group className="mb-3" controlId="currentPassword">
                <Form.Label>Current Password</Form.Label>
                <Form.Control type="password" placeholder="Enter current password" />
              </Form.Group>
              <Form.Group className="mb-3" controlId="newPassword">
                <Form.Label>New Password</Form.Label>
                <Form.Control type="password" placeholder="Enter new password" />
              </Form.Group>
              <Form.Group className="mb-3" controlId="confirmPassword">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control type="password" placeholder="Confirm new password" />
              </Form.Group>
              <Button variant="outline-primary" className="w-100" disabled>
                <i className="bi bi-key me-2"></i>
                Update Password
              </Button>
              <small className="text-muted d-block mt-2 text-center">
                Password change UI placeholder
              </small>
            </Form>
          </Card.Body>
        </Card>
      </Col>

      <style>{`
        .profile-card, .account-info-card, .password-card {
          transition: box-shadow 0.2s ease;
        }

        .profile-card:hover, .account-info-card:hover, .password-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>
    </Row>
  );
};

export default ProfileSection;
