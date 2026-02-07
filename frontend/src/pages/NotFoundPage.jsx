import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

/**
 * NotFoundPage Component
 * 404 error page for undefined routes
 */
const NotFoundPage = () => {
  const navigate = useNavigate();

  // Set document title
  useEffect(() => {
    document.title = 'Page Not Found - Hostel Connect';
  }, []);

  return (
    <div className="not-found-page">
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6}>
            <Card className="border-0 shadow-lg text-center">
              <Card.Body className="p-5">
                {/* 404 Icon */}
                <div className="mb-4">
                  <i className="bi bi-exclamation-circle display-1 text-primary"></i>
                </div>

                {/* Title */}
                <h1 className="fw-bold mb-3">Page Not Found</h1>
                
                {/* Description */}
                <p className="text-muted mb-4">
                  Oops! The page you're looking for doesn't exist, has been moved, 
                  or is temporarily unavailable.
                </p>

                {/* Error Code */}
                <div className="error-code mb-4">
                  <span className="badge bg-light text-dark fs-6">Error 404</span>
                </div>

                {/* Actions */}
                <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
                  <Button
                    variant="primary"
                    onClick={() => navigate(-1)}
                    className="px-4"
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Go Back
                  </Button>
                  <Button
                    variant="outline-primary"
                    as={Link}
                    to="/"
                    className="px-4"
                  >
                    <i className="bi bi-house me-2"></i>
                    Home Page
                  </Button>
                </div>

                {/* Help Text */}
                <div className="mt-5 pt-4 border-top">
                  <small className="text-muted">
                    Need help? <a href="mailto:support@hostelconnect.com" className="text-primary">Contact Support</a>
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <style>{`
        .not-found-page {
          min-height: calc(100vh - 200px);
          display: flex;
          align-items: center;
          background: var(--light-bg, #f8f9fa);
        }
      `}</style>
    </div>
  );
};

export default NotFoundPage;
