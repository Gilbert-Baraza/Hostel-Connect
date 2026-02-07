import React, { Component } from 'react';
import { Button, Container, Row, Col, Card } from 'react-bootstrap';

/**
 * ErrorBoundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * Displays a fallback UI instead of crashing the entire app
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    
    // You could also send error to a logging service here
    // logErrorToService(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container className="py-5">
          <Row className="justify-content-center">
            <Col xs={12} sm={10} md={8} lg={6}>
              <Card className="border-0 shadow-lg text-center">
                <Card.Body className="p-5">
                  {/* Error Icon */}
                  <div className="mb-4">
                    <i className="bi bi-exclamation-triangle display-1 text-warning"></i>
                  </div>

                  {/* Title */}
                  <h1 className="fw-bold mb-3">Something went wrong</h1>
                  
                  {/* Description */}
                  <p className="text-muted mb-4">
                    We're sorry, but an unexpected error occurred. 
                    Our team has been notified.
                  </p>

                  {/* Error Message (only in development) */}
                  {process.env.NODE_ENV === 'development' && this.state.error && (
                    <div className="text-start bg-light p-3 rounded mb-4">
                      <strong>Error:</strong>
                      <pre className="mb-0 small text-danger">
                        {this.state.error.toString()}
                      </pre>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
                    <Button
                      variant="primary"
                      onClick={this.handleReload}
                      className="px-4"
                    >
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Reload Page
                    </Button>
                    <Button
                      variant="outline-primary"
                      onClick={this.handleGoHome}
                      className="px-4"
                    >
                      <i className="bi bi-house me-2"></i>
                      Go Home
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
