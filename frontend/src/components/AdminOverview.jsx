import React from 'react';
import { Row, Col, Card, ProgressBar } from 'react-bootstrap';
import { platformStats } from '../data/adminData';

/**
 * DashboardOverview Component
 * 
 * Admin dashboard overview showing key metrics and platform health.
 * Displays stat cards and simple visualizations for quick insights.
 * 
 * @param {Object} props
 * @param {Function} props.onNavigate - Function to navigate to different sections
 */
const DashboardOverview = ({ onNavigate }) => {
  
  /**
   * Stat Card Component
   * @param {Object} props
   * @param {string} props.title - Card title
   * @param {number|string} props.value - Display value
   * @param {string} props.icon - Bootstrap icon class
   * @param {string} props.color - Color theme
   * @param {string} props.subtitle - Optional subtitle
   * @param {Function} props.onClick - Optional click handler
   */
  const StatCard = ({ title, value, icon, color, subtitle, onClick }) => (
    <Card 
      className={`stat-card ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <Card.Body>
        <div className="d-flex align-items-start justify-content-between">
          <div>
            <p className="stat-title">{title}</p>
            <h2 className="stat-value">{value}</h2>
            {subtitle && <p className="stat-subtitle">{subtitle}</p>}
          </div>
          <div className={`stat-icon bg-${color}`}>
            <i className={`bi ${icon}`}></i>
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  /**
   * Calculate verification rate
   */
  const verificationRate = Math.round(
    (platformStats.activeListings / platformStats.totalHostels) * 100
  );

  /**
   * Calculate pending percentage
   */
  const pendingPercentage = Math.round(
    ((platformStats.pendingLandlordVerifications + platformStats.pendingHostelVerifications) / 
    (platformStats.totalLandlords + platformStats.totalHostels)) * 100
  );

  return (
    <div className="dashboard-overview">
      {/* Page Header */}
      <div className="page-header mb-4">
        <h1 className="page-title">
          <i className="bi bi-grid-1x2 me-2"></i>
          Dashboard Overview
        </h1>
        <p className="page-subtitle">
          Platform metrics, verification status, and quick actions
        </p>
      </div>

      {/* Quick Actions */}
      <Row className="mb-4">
        <Col xs={12}>
          <Card className="quick-actions-card">
            <Card.Body>
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <span className="text-muted me-2">
                  <i className="bi bi-lightning me-1"></i>
                  Quick Actions:
                </span>
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => onNavigate && onNavigate('landlord-verification')}
                >
                  <i className="bi bi-person-check me-1"></i>
                  Review Landlords ({platformStats.pendingLandlordVerifications})
                </button>
                <button 
                  className="btn btn-sm btn-outline-success"
                  onClick={() => onNavigate && onNavigate('hostel-verification')}
                >
                  <i className="bi bi-building-check me-1"></i>
                  Review Hostels ({platformStats.pendingHostelVerifications})
                </button>
                <button 
                  className="btn btn-sm btn-outline-warning"
                  onClick={() => onNavigate && onNavigate('reports')}
                >
                  <i className="bi bi-flag me-1"></i>
                  View Reports ({platformStats.reportedListings})
                </button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Stats Cards */}
      <Row className="mb-4">
        <Col xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Students"
            value={platformStats.totalStudents.toLocaleString()}
            icon="bi-people-fill"
            color="primary"
            subtitle="Registered student accounts"
          />
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Landlords"
            value={platformStats.totalLandlords}
            icon="bi-person-vcard-fill"
            color="info"
            subtitle={`${platformStats.pendingLandlordVerifications} pending verification`}
          />
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Hostels"
            value={platformStats.totalHostels}
            icon="bi-building-fill"
            color="success"
            subtitle={`${platformStats.pendingHostelVerifications} pending approval`}
          />
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <StatCard
            title="Reported Listings"
            value={platformStats.reportedListings}
            icon="bi-exclamation-triangle-fill"
            color="warning"
            subtitle="Requires attention"
          />
        </Col>
      </Row>

      {/* Secondary Stats */}
      <Row className="mb-4">
        <Col xs={12} md={8}>
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-pie-chart me-2"></i>
                Platform Overview
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col xs={6} md={4} className="mb-3 mb-md-0">
                  <div className="text-center">
                    <div className="stat-circle mb-2">
                      <span className="stat-circle-value">{verificationRate}%</span>
                    </div>
                    <p className="mb-0 text-muted">Verification Rate</p>
                    <small className="text-muted">
                      {platformStats.activeListings} of {platformStats.totalHostels} listings
                    </small>
                  </div>
                </Col>
                <Col xs={6} md={4} className="mb-3 mb-md-0">
                  <div className="text-center">
                    <div className="stat-circle stat-circle-warning mb-2">
                      <span className="stat-circle-value">{platformStats.suspendedUsers}</span>
                    </div>
                    <p className="mb-0 text-muted">Suspended Users</p>
                    <small className="text-muted">
                      For policy violations
                    </small>
                  </div>
                </Col>
                <Col xs={12} md={4}>
                  <div className="text-center">
                    <div className="stat-circle stat-circle-info mb-2">
                      <span className="stat-circle-value">
                        {platformStats.totalStudents > 0 
                          ? Math.round(platformStats.totalHostels / platformStats.totalStudents * 100)
                          : 0}
                      </span>
                    </div>
                    <p className="mb-0 text-muted">Listings per 100 Students</p>
                    <small className="text-muted">
                      Platform inventory density
                    </small>
                  </div>
                </Col>
              </Row>

              <hr className="my-4" />

              {/* Verification Progress */}
              <div className="verification-progress">
                <div className="d-flex justify-content-between mb-2">
                  <span>
                    <i className="bi bi-check-circle text-success me-1"></i>
                    Active Listings
                  </span>
                  <span>{platformStats.activeListings}</span>
                </div>
                <ProgressBar 
                  variant="success" 
                  now={platformStats.activeListings} 
                  max={platformStats.totalHostels}
                  className="mb-3"
                />

                <div className="d-flex justify-content-between mb-2">
                  <span>
                    <i className="bi bi-clock text-warning me-1"></i>
                    Pending Verification
                  </span>
                  <span>{platformStats.pendingLandlordVerifications + platformStats.pendingHostelVerifications}</span>
                </div>
                <ProgressBar 
                  variant="warning" 
                  now={platformStats.pendingLandlordVerifications + platformStats.pendingHostelVerifications}
                  max={platformStats.totalHostels + platformStats.totalLandlords}
                  className="mb-3"
                />

                <div className="d-flex justify-content-between mb-2">
                  <span>
                    <i className="bi bi-flag text-danger me-1"></i>
                    Reported Listings
                  </span>
                  <span>{platformStats.reportedListings}</span>
                </div>
                <ProgressBar 
                  variant="danger" 
                  now={platformStats.reportedListings}
                  max={platformStats.totalHostels}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={4}>
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-bar-chart me-2"></i>
                Trust Metrics
              </h5>
            </Card.Header>
            <Card.Body>
              {/* Trust Score */}
              <div className="trust-score text-center mb-4">
                <div className="trust-score-circle mx-auto mb-3">
                  <span className="trust-score-value">92%</span>
                </div>
                <p className="mb-0 text-muted">Platform Trust Score</p>
                <small className="text-muted">Based on user reports and verifications</small>
              </div>

              {/* Trust Factors */}
              <ul className="trust-factors list-unstyled mb-0">
                <li className="d-flex align-items-center mb-2">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  <span>Verified Landlords</span>
                  <span className="ms-auto fw-bold">{platformStats.totalLandlords - platformStats.pendingLandlordVerifications}</span>
                </li>
                <li className="d-flex align-items-center mb-2">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  <span>Verified Hostels</span>
                  <span className="ms-auto fw-bold">{platformStats.activeListings}</span>
                </li>
                <li className="d-flex align-items-center mb-2">
                  <i className="bi bi-exclamation-circle text-warning me-2"></i>
                  <span>Pending Reviews</span>
                  <span className="ms-auto fw-bold">{platformStats.pendingHostelVerifications}</span>
                </li>
                <li className="d-flex align-items-center">
                  <i className="bi bi-flag text-danger me-2"></i>
                  <span>Open Reports</span>
                  <span className="ms-auto fw-bold">{platformStats.reportedListings}</span>
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Activity Summary */}
      <Row>
        <Col xs={12}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-activity me-2"></i>
                Activity Summary
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col xs={6} md={3} className="text-center mb-3 mb-md-0">
                  <div className="activity-stat">
                    <i className="bi bi-person-plus text-primary fs-2"></i>
                    <h4 className="mt-2 mb-0">{Math.round(platformStats.totalStudents / 10)}</h4>
                    <small className="text-muted">New Students (This Week)</small>
                  </div>
                </Col>
                <Col xs={6} md={3} className="text-center mb-3 mb-md-0">
                  <div className="activity-stat">
                    <i className="bi bi-building-add text-success fs-2"></i>
                    <h4 className="mt-2 mb-0">{Math.round(platformStats.totalHostels / 20)}</h4>
                    <small className="text-muted">New Listings (This Week)</small>
                  </div>
                </Col>
                <Col xs={6} md={3} className="text-center">
                  <div className="activity-stat">
                    <i className="bi bi-check-all text-info fs-2"></i>
                    <h4 className="mt-2 mb-0">{platformStats.pendingLandlordVerifications + platformStats.pendingHostelVerifications}</h4>
                    <small className="text-muted">Pending Verifications</small>
                  </div>
                </Col>
                <Col xs={6} md={3} className="text-center">
                  <div className="activity-stat">
                    <i className="bi bi-shield-check text-warning fs-2"></i>
                    <h4 className="mt-2 mb-0">{verificationRate}%</h4>
                    <small className="text-muted">Verification Success Rate</small>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Inline Styles */}
      <style>{`
        .dashboard-overview {
          min-height: 100%;
        }

        .page-header {
          margin-top: 1rem;
        }

        .page-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.25rem;
        }

        .page-subtitle {
          color: #64748b;
          margin-bottom: 0;
        }

        .quick-actions-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }

        /* Stat Cards */
        .stat-card {
          border: none;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          height: calc(100% - 1rem);
          margin-bottom: 1rem;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .stat-card.clickable:hover {
          cursor: pointer;
        }

        .stat-title {
          font-size: 0.875rem;
          color: #64748b;
          margin-bottom: 0.25rem;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #1e293b;
          line-height: 1.2;
        }

        .stat-subtitle {
          font-size: 0.75rem;
          color: #94a3b8;
          margin-bottom: 0;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          color: #fff;
        }

        .stat-icon.bg-primary {
          background: #3b82f6;
        }

        .stat-icon.bg-info {
          background: #0ea5e9;
        }

        .stat-icon.bg-success {
          background: #22c55e;
        }

        .stat-icon.bg-warning {
          background: #f59e0b;
        }

        /* Stat Circles */
        .stat-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #f0fdf4;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid #22c55e;
        }

        .stat-circle-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #22c55e;
        }

        .stat-circle-warning {
          background: #fffbeb;
          border-color: #f59e0b;
        }

        .stat-circle-warning .stat-circle-value {
          color: #f59e0b;
        }

        .stat-circle-info {
          background: #eff6ff;
          border-color: #3b82f6;
        }

        .stat-circle-info .stat-circle-value {
          color: #3b82f6;
        }

        /* Trust Score */
        .trust-score-circle {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);
        }

        .trust-score-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: #fff;
        }

        .trust-factors li {
          padding: 0.5rem 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .trust-factors li:last-child {
          border-bottom: none;
        }

        /* Activity Stats */
        .activity-stat {
          padding: 1rem;
          border-radius: 8px;
          background: #f8fafc;
        }

        /* Progress Bar Styling */
        .progress {
          height: 8px;
          border-radius: 4px;
          background: #e2e8f0;
        }

        .progress-bar {
          transition: width 0.5s ease;
        }
      `}</style>
    </div>
  );
};

export default DashboardOverview;
