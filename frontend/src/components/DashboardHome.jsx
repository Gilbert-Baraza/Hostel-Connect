import React from 'react';
import { Row, Col, Card, Button, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

/**
 * DashboardHome Component
 * Welcome screen with quick actions and verification status for students
 * 
 * @param {Object} props
 * @param {Object} props.user - Current user object from AuthContext
 */
const DashboardHome = ({ user }) => {
  // Dummy verification status
  const verificationStatus = {
    emailVerified: true,
    phoneVerified: true,
    identityVerified: true,
    accountStatus: 'verified' // verified, pending, unverified
  };

  // Quick stats
  const stats = {
    savedHostels: 5,
    pendingRequests: 2,
    approvedRequests: 1
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <>
      {/* Welcome Section */}
      <Row className="mb-4">
        <Col>
          <h4 className="fw-bold mb-1">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Student'}!
          </h4>
          <p className="text-muted mb-0">Welcome to your student dashboard</p>
        </Col>
      </Row>

      {/* Verification Status Card */}
      <Row className="mb-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white d-flex align-items-center">
              <i className="bi bi-shield-check fs-5 text-success me-2"></i>
              <span className="fw-bold">Account Verification Status</span>
              {verificationStatus.accountStatus === 'verified' ? (
                <Badge bg="success" className="ms-auto">Verified</Badge>
              ) : (
                <Badge bg="warning" className="ms-auto">Pending</Badge>
              )}
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col xs={12} sm={4}>
                  <div className="d-flex align-items-center">
                    <i className={`bi ${verificationStatus.emailVerified ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'} fs-5 me-2`}></i>
                    <div>
                      <small className="text-muted d-block">Email</small>
                      <span className="fw-medium">Verified</span>
                    </div>
                  </div>
                </Col>
                <Col xs={12} sm={4}>
                  <div className="d-flex align-items-center">
                    <i className={`bi ${verificationStatus.phoneVerified ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'} fs-5 me-2`}></i>
                    <div>
                      <small className="text-muted d-block">Phone</small>
                      <span className="fw-medium">Verified</span>
                    </div>
                  </div>
                </Col>
                <Col xs={12} sm={4}>
                  <div className="d-flex align-items-center">
                    <i className={`bi ${verificationStatus.identityVerified ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'} fs-5 me-2`}></i>
                    <div>
                      <small className="text-muted d-block">Identity</small>
                      <span className="fw-medium">Verified</span>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Educational Banner */}
      <Row className="mb-4">
        <Col>
          <Alert variant="info" className="border-0 shadow-sm">
            <div className="d-flex align-items-start">
              <i className="bi bi-info-circle-fill fs-4 me-3 mt-1"></i>
              <div>
                <h6 className="fw-bold mb-1">Safety First!</h6>
                <p className="mb-0">
                  <strong>Never pay before physical verification.</strong> Always visit the hostel in person 
                  before making any payments. Report any agent requesting viewing fees immediately.
                </p>
              </div>
            </div>
          </Alert>
        </Col>
      </Row>

      {/* Quick Stats */}
      <Row className="mb-4 g-3">
        <Col xs={12} sm={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="icon-box icon-box-primary mx-auto mb-3">
                <i className="bi bi-heart-fill"></i>
              </div>
              <h3 className="fw-bold mb-1">{stats.savedHostels}</h3>
              <p className="text-muted mb-0">Saved Hostels</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="icon-box icon-box-warning mx-auto mb-3">
                <i className="bi bi-clock-history"></i>
              </div>
              <h3 className="fw-bold mb-1">{stats.pendingRequests}</h3>
              <p className="text-muted mb-0">Pending Requests</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="icon-box icon-box-success mx-auto mb-3">
                <i className="bi bi-check-circle"></i>
              </div>
              <h3 className="fw-bold mb-1">{stats.approvedRequests}</h3>
              <p className="text-muted mb-0">Approved Requests</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="g-3">
        <Col xs={12} md={4}>
          <Card className="border-0 shadow-sm quick-action-card h-100">
            <Card.Body className="text-center py-4">
              <i className="bi bi-search fs-1 text-primary mb-3"></i>
              <h6 className="fw-bold mb-3">Browse Hostels</h6>
              <p className="text-muted small mb-3">
                Search and discover verified hostels near your university
              </p>
              <Link to="/hostels" className="btn btn-outline-primary btn-sm">
                Browse Now
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={4}>
          <Card className="border-0 shadow-sm quick-action-card h-100">
            <Card.Body className="text-center py-4">
              <i className="bi bi-heart-fill fs-1 text-danger mb-3"></i>
              <h6 className="fw-bold mb-3">Saved Hostels</h6>
              <p className="text-muted small mb-3">
                View your shortlist of favorite hostels
              </p>
              <Link to="/student/dashboard/saved" className="btn btn-outline-danger btn-sm">
                View Saved
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={4}>
          <Card className="border-0 shadow-sm quick-action-card h-100">
            <Card.Body className="text-center py-4">
              <i className="bi bi-inbox fs-1 text-warning mb-3"></i>
              <h6 className="fw-bold mb-3">My Requests</h6>
              <p className="text-muted small mb-3">
                Track your viewing and booking requests
              </p>
              <Link to="/student/dashboard/requests" className="btn btn-outline-warning btn-sm">
                View Requests
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style>{`
        .quick-action-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .quick-action-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
        }

        .icon-box {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .icon-box-primary {
          background: rgba(26, 95, 122, 0.1);
          color: #1a5f7a;
        }

        .icon-box-warning {
          background: rgba(255, 193, 7, 0.1);
          color: #ffc107;
        }

        .icon-box-success {
          background: rgba(25, 135, 84, 0.1);
          color: #198754;
        }
      `}</style>
    </>
  );
};

export default DashboardHome;
