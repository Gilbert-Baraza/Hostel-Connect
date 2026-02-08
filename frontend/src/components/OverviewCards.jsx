import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';

/**
 * OverviewCards Component
 * Displays summary statistics for landlord dashboard
 */
const OverviewCards = ({ stats }) => {
  const cards = [
    {
      title: 'Total Hostels',
      value: stats?.totalHostels || 0,
      icon: 'bi-building',
      color: 'primary',
      subtitle: 'Listed properties'
    },
    {
      title: 'Total Rooms',
      value: stats?.totalRooms || 0,
      icon: 'bi-door-open',
      color: 'success',
      subtitle: 'Across all hostels'
    },
    {
      title: 'Available Rooms',
      value: stats?.availableRooms || 0,
      icon: 'bi-check-circle',
      color: 'info',
      subtitle: 'Ready for booking'
    },
    {
      title: 'Occupied Rooms',
      value: stats?.occupiedRooms || 0,
      icon: 'bi-person-check',
      color: 'warning',
      subtitle: 'Currently rented'
    },
    {
      title: 'Pending Verification',
      value: stats?.pendingVerification || 0,
      icon: 'bi-clock',
      color: 'secondary',
      subtitle: 'Awaiting approval'
    },
    {
      title: 'Verified',
      value: stats?.verifiedHostels || 0,
      icon: 'bi-patch-check',
      color: 'success',
      subtitle: 'Approved listings'
    }
  ];

  return (
    <Row className="g-3 mb-4">
      {cards.map((card, index) => (
        <Col key={index} xs={6} md={4} lg={2}>
          <Card className="overview-card h-100 border-0 shadow-sm">
            <Card.Body className="d-flex flex-column">
              <div className={`icon-wrapper bg-${card.color}-light mb-2`}>
                <i className={`bi ${card.icon} text-${card.color}`}></i>
              </div>
              <h3 className="fw-bold mb-0">{card.value}</h3>
              <small className="text-muted">{card.title}</small>
              <small className="text-muted small mt-auto">
                <i className="bi bi-arrow-up text-success me-1"></i>
                {card.subtitle}
              </small>
            </Card.Body>
          </Card>
        </Col>
      ))}

      <style>{`
        .overview-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .overview-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25) !important;
        }

        .icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }

        .bg-primary-light { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white !important;
        }
        .bg-primary-light.text-primary {
          color: white !important;
        }
        
        .bg-success-light { 
          background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
          color: white !important;
        }
        .bg-success-light.text-success {
          color: white !important;
        }
        
        .bg-info-light { 
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white !important;
        }
        .bg-info-light.text-info {
          color: white !important;
        }
        
        .bg-warning-light { 
          background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
          color: white !important;
        }
        .bg-warning-light.text-warning {
          color: white !important;
        }
        
        .bg-secondary-light { 
          background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
          color: #667eea !important;
        }
        .bg-secondary-light.text-secondary {
          color: #667eea !important;
        }
      `}</style>
    </Row>
  );
};

export default OverviewCards;
