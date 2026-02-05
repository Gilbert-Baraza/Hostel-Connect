import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';

/**
 * TrustSection Component
 * Displays trust badges, verification status, and fraud prevention info
 * 
 * Props:
 * - verified: boolean - Whether the listing is verified
 * - hostelName: string - Name of the hostel for display
 */
const TrustSection = ({ verified = false, hostelName = '' }) => {
  const trustItems = [
    {
      icon: 'bi-patch-check-fill',
      title: 'Verified Landlord',
      description: 'Landlord identity has been verified through our strict verification process.',
      color: 'text-success'
    },
    {
      icon: 'bi-shield-check',
      title: 'Admin-Approved Listing',
      description: 'This listing has been reviewed and approved by our administration team.',
      color: 'text-primary'
    },
    {
      icon: 'bi-check-circle-fill',
      title: 'Quality Assured',
      description: 'Property meets our minimum quality standards for student accommodation.',
      color: 'text-info'
    }
  ];
  
  const fraudItems = [
    {
      icon: 'bi-exclamation-triangle-fill',
      title: 'Report Suspicious Activity',
      description: 'If something feels off, report it immediately. We investigate all reports.',
      action: 'Learn how to stay safe'
    },
    {
      icon: 'bi-currency-dollar',
      title: 'No Advance Payments',
      description: 'Never send money before viewing. Legitimate landlords won\'t ask for this.',
      action: 'Read our safety tips'
    },
    {
      icon: 'bi-person-check-fill',
      title: 'Meet in Safe Places',
      description: 'Always meet landlords in public places when viewing properties.',
      action: 'View safety guidelines'
    }
  ];
  
  return (
    <div className="trust-section">
      {/* Verification Badge */}
      {verified && (
        <div className="verification-badge mb-4 p-3 bg-success-subtle rounded-3 border border-success border-opacity-25">
          <div className="d-flex align-items-center">
            <div className="verified-icon me-3">
              <i className="bi bi-patch-check-fill fs-1 text-success"></i>
            </div>
            <div>
              <h5 className="mb-1 fw-bold text-success">
                <i className="bi bi-check-shield-fill me-2"></i>
                Verified Listing
              </h5>
              <p className="mb-0 text-muted">
                <strong>{hostelName}</strong> has been verified by our team. 
                This landlord and property have passed our verification checks.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Trust Features */}
      <Card className="trust-features-card mb-4 border-0 shadow-sm">
        <Card.Header className="bg-white">
          <h5 className="mb-0 fw-bold text-primary">
            <i className="bi bi-shield-fill me-2"></i>
            Trust & Verification
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            {trustItems.map((item, index) => (
              <Col key={index} xs={12} md={4} className="mb-3 mb-md-0">
                <div className="trust-item text-center h-100 p-3 rounded-2 bg-light">
                  <div className={`trust-icon mb-2 ${item.color}`}>
                    <i className={`bi ${item.icon} fs-2`}></i>
                  </div>
                  <h6 className="fw-bold mb-2">{item.title}</h6>
                  <small className="text-muted">{item.description}</small>
                </div>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>
      
      {/* Fraud Prevention */}
      <Card className="fraud-prevention-card border-0 shadow-sm">
        <Card.Header className="bg-warning-subtle">
          <h5 className="mb-0 fw-bold text-warning">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Fraud Prevention Tips
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            {fraudItems.map((item, index) => (
              <Col key={index} xs={12} md={4} className="mb-3 mb-md-0">
                <div className="fraud-item d-flex align-items-start h-100">
                  <div className="fraud-icon me-3 mt-1">
                    <i className={`bi ${item.icon} fs-4 text-warning`}></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">{item.title}</h6>
                    <small className="text-muted d-block mb-2">{item.description}</small>
                    <a 
                      href="#" 
                      className="text-primary small text-decoration-none fw-bold"
                    >
                      {item.action} <i className="bi bi-arrow-right"></i>
                    </a>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>
      
      {/* Safety Notice */}
      <div className="safety-notice mt-4 p-3 bg-primary-subtle rounded-3 border border-primary border-opacity-25">
        <div className="d-flex align-items-center">
          <i className="bi bi-shield-lock-fill fs-4 text-primary me-3"></i>
          <div>
            <strong>Your Safety Matters</strong>
            <p className="mb-0 text-muted small">
              Hostel Connect is committed to creating a safe marketplace. 
              We actively monitor and remove suspicious listings to protect students.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustSection;
