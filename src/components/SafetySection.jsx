import React from 'react';
import { Row, Col, Card, Button, Alert, Accordion } from 'react-bootstrap';

/**
 * SafetySection Component
 * Educational content about verification and fraud prevention
 * 
 * @param {Object} props
 * @param {Function} props.onReport - Callback for reporting suspicious listing
 */
const SafetySection = ({ onReport }) => {
  const verificationBadges = [
    {
      icon: 'bi-patch-check-fill',
      title: 'Verified Badge',
      description: 'This hostel has been verified by our team. The landlord provided valid identification and property documents.',
      color: 'success'
    },
    {
      icon: 'bi-exclamation-circle',
      title: 'Pending Verification',
      description: 'This listing is under review. Our team is currently verifying the landlord and property documents.',
      color: 'warning'
    },
    {
      icon: 'bi-x-circle',
      title: 'Unverified',
      description: 'This listing has not been verified. Exercise caution and verify details independently before any payments.',
      color: 'danger'
    }
  ];

  const fraudSigns = [
    {
      icon: 'bi-currency-dollar',
      title: 'Requests Viewing Fees',
      description: 'Legitimate landlords never charge for property viewings. This is a common scam tactic.'
    },
    {
      icon: 'bi-bank',
      title: 'Demands Payment Before Viewing',
      description: 'Never pay any money before physically visiting and inspecting the property.'
    },
    {
      icon: 'bi-phone',
      title: 'Pressure Tactics',
      description: 'Scammers often pressure students to decide quickly, claiming other students are interested.'
    },
    {
      icon: 'bi-image',
      title: 'Generic or Stolen Photos',
      description: 'Be wary of listings using professional photos without specific room details.'
    },
    {
      icon: 'bi-person',
      title: 'Won\'t Meet in Person',
      description: 'A legitimate landlord will always meet you at the property for a viewing.'
    },
    {
      icon: 'bi-geo-alt',
      title: 'Vague Location',
      description: 'Scammers often give unclear locations to avoid meeting in person.'
    }
  ];

  const safetyTips = [
    'Always visit the property in person before making any payments',
    'Meet the landlord at the property and verify their identity',
    'Check that amenities mentioned in the listing actually exist',
    'Ask to see the original property documents or lease agreement',
    'Never share your personal information with unverified contacts',
    'Use the platform\'s messaging system for all communications',
    'Report any suspicious listings immediately',
    'Trust your instincts - if something feels wrong, walk away'
  ];

  return (
    <>
      <Row className="mb-4">
        <Col>
          <h4 className="fw-bold mb-1">
            <i className="bi bi-shield-check text-success me-2"></i>
            Safety & Verification
          </h4>
          <p className="text-muted mb-0">
            Learn how to stay safe and identify verified listings
          </p>
        </Col>
      </Row>

      {/* Verification Badges Section */}
      <Row className="mb-4">
        <Col>
          <h5 className="fw-bold mb-3">
            <i className="bi bi-patch-check me-2"></i>
            Understanding Verification Badges
          </h5>
          <Row className="g-3">
            {verificationBadges.map((badge, index) => (
              <Col key={index} xs={12} md={4}>
                <Card className={`border-0 shadow-sm h-100 border-${badge.color}`}>
                  <Card.Body>
                    <div className={`icon-box icon-box-${badge.color} mx-auto mb-3`}>
                      <i className={`bi ${badge.icon}`}></i>
                    </div>
                    <h6 className="fw-bold text-center mb-2">{badge.title}</h6>
                    <p className="text-muted small mb-0 text-center">
                      {badge.description}
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      {/* Warning Card */}
      <Row className="mb-4">
        <Col>
          <Alert variant="danger" className="border-0 shadow-sm">
            <div className="d-flex align-items-start">
              <i className="bi bi-exclamation-triangle-fill fs-4 me-3 mt-1"></i>
              <div>
                <h6 className="fw-bold mb-1">Important Safety Warning</h6>
                <p className="mb-2">
                  <strong>Never pay any money before physically verifying the hostel!</strong>
                </p>
                <ul className="mb-2 small">
                  <li>Legitimate landlords do not charge viewing fees</li>
                  <li>Do not transfer money via mobile money to unknown numbers</li>
                  <li>Always meet the landlord at the property</li>
                  <li>Report anyone asking for advance payments</li>
                </ul>
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={onReport}
                >
                  <i className="bi bi-flag me-1"></i>
                  Report Suspicious Listing
                </Button>
              </div>
            </div>
          </Alert>
        </Col>
      </Row>

      {/* Fraud Signs Accordion */}
      <Row className="mb-4">
        <Col>
          <h5 className="fw-bold mb-3">
            <i className="bi bi-exclamation-diamond me-2 text-danger"></i>
            Red Flags to Watch Out For
          </h5>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              <Accordion defaultActiveKey="0">
                {fraudSigns.map((sign, index) => (
                  <Accordion.Item key={index} eventKey={String(index)}>
                    <Accordion.Header>
                      <div className="d-flex align-items-center w-100">
                        <div className={`icon-box icon-box-${index < 2 ? 'danger' : 'secondary'} me-3`}>
                          <i className={`bi ${sign.icon}`}></i>
                        </div>
                        <span className="fw-medium">{sign.title}</span>
                      </div>
                    </Accordion.Header>
                    <Accordion.Body>
                      <p className="text-muted mb-0">{sign.description}</p>
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Safety Tips */}
      <Row className="mb-4">
        <Col>
          <h5 className="fw-bold mb-3">
            <i className="bi bi-lightbulb me-2 text-warning"></i>
            Safety Tips for Finding Your Hostel
          </h5>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <ul className="mb-0">
                {safetyTips.map((tip, index) => (
                  <li key={index} className="mb-2 d-flex align-items-start">
                    <i className="bi bi-check-circle-fill text-success me-2 mt-1"></i>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Report Section */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm bg-light">
            <Card.Body className="text-center py-4">
              <i className="bi bi-flag fs-1 text-secondary mb-3"></i>
              <h6 className="fw-bold mb-2">See Something Suspicious?</h6>
              <p className="text-muted small mb-3">
                Help us keep the platform safe by reporting suspicious listings or landlord behavior.
              </p>
              <Button variant="outline-danger" onClick={onReport}>
                <i className="bi bi-flag me-1"></i>
                Report a Problem
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style>{`
        .icon-box {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .icon-box-success {
          background: rgba(25, 135, 84, 0.1);
          color: #198754;
        }

        .icon-box-warning {
          background: rgba(255, 193, 7, 0.1);
          color: #ffc107;
        }

        .icon-box-danger {
          background: rgba(220, 53, 69, 0.1);
          color: #dc3545;
        }

        .icon-box-secondary {
          background: rgba(108, 117, 125, 0.1);
          color: #6c757d;
        }

        .accordion-button:not(.collapsed) {
          background: var(--gray-100);
        }
      `}</style>
    </>
  );
};

export default SafetySection;
