import React from 'react';
import { Card, Button, Row, Col } from 'react-bootstrap';

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
  const { name = 'Landlord', phone = '', email = '' } = landlord;
  
  const handleCall = () => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };
  
  const handleEmail = () => {
    if (email) {
      window.location.href = `mailto:${email}?subject=Inquiry about ${encodeURIComponent(hostelName)}`;
    }
  };
  
  const handleRequestViewing = () => {
    // Placeholder for viewing request functionality
    alert('Please login to request a viewing. This feature will be enabled after authentication.');
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
                disabled={!phone}
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
                disabled={!email}
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
        
        {/* Login Notice */}
        <div className="login-notice mt-4 p-3 bg-light rounded-2">
          <div className="d-flex align-items-start">
            <i className="bi bi-info-circle-fill text-info me-2 mt-1"></i>
            <div>
              <small className="text-muted d-block mb-1">
                <strong>Contact functionality</strong>
              </small>
              <small className="text-muted">
                Full contact details and messaging will be available after login.
                Create an account to connect directly with landlords.
              </small>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ContactPanel;
