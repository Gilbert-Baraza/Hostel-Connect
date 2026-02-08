import React from 'react';
import { Card, Button, Row, Col, Alert } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

/**
 * ContactPanel Component
 * Displays landlord contact information and action buttons
 * 
 * Props:
 * - landlord: Object containing landlord info { name, phone, email }
 * - hostelName: Name of the hostel (for display)
 * 
 * Note: Contact functionality will be enabled after login
 */
const ContactPanel = ({ landlord = {}, hostelName = '' }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { name = 'Landlord', phone = '', email = '' } = landlord;
  const hasContactDetails = Boolean(phone || email);

  const requireAuth = () => {
    if (isAuthenticated) return true;
    navigate('/login', { state: { from: location } });
    return false;
  };

  const handleCall = () => {
    if (!requireAuth()) return;
    if (phone) {
      window.location.href = `tel:${phone}`;
      return;
    }
    alert('Phone contact is not available yet.');
  };

  const handleEmail = () => {
    if (!requireAuth()) return;
    if (email) {
      window.location.href = `mailto:${email}?subject=Inquiry about ${encodeURIComponent(hostelName)}`;
      return;
    }
    alert('Email contact is not available yet.');
  };

  const handleRequestViewing = () => {
    if (!requireAuth()) return;
    if (email) {
      const requesterName = user?.name || 'Student';
      const requesterEmail = user?.email ? ` (${user.email})` : '';
      const subject = `Viewing request for ${hostelName}`;
      const body = `Hello ${name},%0D%0A%0D%0AI would like to request a viewing for ${hostelName}.%0D%0A%0D%0ARegards,%0D%0A${requesterName}${requesterEmail}`;
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${body}`;
      return;
    }
    if (phone) {
      window.location.href = `tel:${phone}`;
      return;
    }
    alert('Contact details are not available yet.');
  };
  
  return (
    <Card className="contact-panel shadow-sm border-0">
      <Card.Header className="bg-primary text-white py-3">
        <h5 className="mb-0 fw-bold">
          <i className="bi bi-person-vcard-fill me-2"></i>
          Contact Landlord
        </h5>
      </Card.Header>
      <Card.Body className="p-4">
        {/* Landlord Info */}
        <div className="landlord-info mb-4">
          <div className="d-flex align-items-center mb-3">
            <div className="landlord-avatar me-3">
              <i className="bi bi-person-circle fs-1 text-primary"></i>
            </div>
            <div>
              <h6 className="mb-1 fw-bold">{name}</h6>
              <small className="text-muted">Property Owner / Manager</small>
            </div>
          </div>
          
          {phone && (
            <div className="contact-item d-flex align-items-center py-2">
              <i className="bi bi-telephone-fill text-primary me-3"></i>
              <a href={`tel:${phone}`} className="text-decoration-none">
                {phone}
              </a>
            </div>
          )}
          
          {email && (
            <div className="contact-item d-flex align-items-center py-2">
              <i className="bi bi-envelope-fill text-primary me-3"></i>
              <a href={`mailto:${email}`} className="text-decoration-none">
                {email}
              </a>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="action-buttons">
          <Row className="g-2">
            <Col xs={12}>
              <Button
                variant="primary"
                className="w-100 py-2 fw-bold"
                onClick={handleCall}
                disabled={isAuthenticated ? !phone : false}
              >
                <i className="bi bi-telephone-fill me-2"></i>
                Call Now
              </Button>
            </Col>
            <Col xs={12}>
              <Button
                variant="outline-primary"
                className="w-100 py-2 fw-bold"
                onClick={handleEmail}
                disabled={isAuthenticated ? !email : false}
              >
                <i className="bi bi-envelope me-2"></i>
                Send Email
              </Button>
            </Col>
            <Col xs={12}>
              <Button
                variant="success"
                className="w-100 py-2 fw-bold"
                onClick={handleRequestViewing}
              >
                <i className="bi bi-calendar-check me-2"></i>
                Request Viewing
              </Button>
            </Col>
          </Row>
        </div>

        {!isAuthenticated && (
          <Alert variant="info" className="mt-4 mb-0">
            <i className="bi bi-info-circle-fill me-2"></i>
            Login to contact the landlord and request a viewing.
          </Alert>
        )}

        {isAuthenticated && !hasContactDetails && (
          <Alert variant="warning" className="mt-4 mb-0">
            <i className="bi bi-shield-lock me-2"></i>
            Contact details will appear after your booking request is approved.
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default ContactPanel;
