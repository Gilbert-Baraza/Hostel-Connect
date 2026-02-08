import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Button, Badge, Table, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getSavedHostels, removeSavedHostel } from '../api/student';
import { normalizeHostel } from '../utils/hostelMapper';

/**
 * SavedHostels Component
 * Displays student's bookmarked hostel listings
 * 
 * @param {Object} props
 * @param {Function} props.onRemove - Callback when a hostel is removed from saved list
 */
const SavedHostels = ({ onRemove }) => {
  const [savedHostels, setSavedHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSavedHostels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getSavedHostels();
      const list = response?.data?.savedHostels || response?.data || [];
      const normalized = list.map((entry) => {
        const rawHostel = entry.hostel || entry;
        const base = normalizeHostel(rawHostel);
        const minPrice = rawHostel?.pricing?.minPrice ?? base.price ?? 0;
        const maxPrice = rawHostel?.pricing?.maxPrice;
        const priceRange = maxPrice && maxPrice > 0
          ? `KSh ${Number(minPrice).toLocaleString()} - ${Number(maxPrice).toLocaleString()}`
          : `KSh ${Number(minPrice).toLocaleString()}`;
        return {
          ...base,
          priceRange,
          savedAt: entry.savedAt || entry.createdAt
        };
      });
      setSavedHostels(normalized);
    } catch (err) {
      setError(err?.message || 'Failed to load saved hostels');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedHostels();
  }, [fetchSavedHostels]);

  const handleRemove = async (hostelId) => {
    setError(null);
    try {
      await removeSavedHostel(hostelId);
      setSavedHostels(prev => prev.filter(h => h.id !== hostelId));
      if (onRemove) onRemove(hostelId);
    } catch (err) {
      setError(err?.message || 'Failed to remove saved hostel');
    }
  };

  const getAvailabilityVariant = (availability) => {
    switch (availability) {
      case 'Available': return 'success';
      case 'Limited': return 'warning';
      case 'Full': return 'danger';
      default: return 'secondary';
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<i key={i} className="bi bi-star-fill text-warning"></i>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<i key={i} className="bi bi-star-half text-warning"></i>);
      } else {
        stars.push(<i key={i} className="bi bi-star text-muted"></i>);
      }
    }
    return stars;
  };

  const formatSavedDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3 text-muted">Loading saved hostels...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="text-center py-4">
        <div className="mb-3">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
        <Button variant="outline-danger" onClick={fetchSavedHostels}>
          <i className="bi bi-arrow-clockwise me-2"></i>
          Try Again
        </Button>
      </Alert>
    );
  }

  return (
    <>
      <Row className="mb-4">
        <Col>
          <h4 className="fw-bold mb-1">
            <i className="bi bi-heart-fill text-danger me-2"></i>
            Saved Hostels
          </h4>
          <p className="text-muted mb-0">
            Your shortlist of bookmarked hostels ({savedHostels.length})
          </p>
        </Col>
      </Row>

      {/* Info Card */}
      <Row className="mb-4">
        <Col>
          <Alert variant="light" className="border shadow-sm">
            <div className="d-flex align-items-start">
              <i className="bi bi-lightbulb text-primary fs-5 me-3 mt-1"></i>
              <div>
                <h6 className="fw-bold mb-1">About Your Shortlist</h6>
                <p className="mb-0 small text-muted">
                  This is your personal collection of saved hostels. Unlike a shopping cart, 
                  this is a long-term list for tracking hostels you're interested in. 
                  Take your time to compare and make informed decisions.
                </p>
              </div>
            </div>
          </Alert>
        </Col>
      </Row>

      {/* Hostels Grid (Desktop) */}
      <Row className="d-none d-lg-block mb-4">
        {savedHostels.map((hostel) => (
          <Col key={hostel.id} className="mb-3">
            <Card className="border-0 shadow-sm saved-hostel-card">
              <Card.Body>
                <Row className="align-items-center">
                  <Col md={8}>
                    <div className="d-flex align-items-start">
                      <div className="hostel-image-placeholder me-3">
                        <i className="bi bi-building"></i>
                      </div>
                      <div>
                        <div className="d-flex align-items-center mb-1">
                          <h6 className="fw-bold mb-0 me-2">{hostel.name}</h6>
                          {hostel.verified ? (
                            <Badge bg="success">
                              <i className="bi bi-patch-check-fill me-1"></i>
                              Verified
                            </Badge>
                          ) : (
                            <Badge bg="secondary">
                              <i className="bi bi-exclamation-circle me-1"></i>
                              Unverified
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted small mb-2">
                          <i className="bi bi-geo-alt-fill me-1"></i>
                          {hostel.location}
                        </p>
                        <div className="d-flex gap-3 small">
                          <span className="text-muted">
                            <i className="bi bi-currency-dollar me-1"></i>
                            {hostel.priceRange}
                          </span>
                          <span className="text-muted">
                            <i className="bi bi-pin-map me-1"></i>
                            {hostel.distance}
                          </span>
                          <span className="text-muted">
                            {renderStars(hostel.rating)}
                            <span className="ms-1">{hostel.rating}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col md={4} className="text-md-end mt-3 mt-md-0">
                    <div className="d-flex align-items-center justify-content-md-end gap-2">
                      <Badge bg={getAvailabilityVariant(hostel.availability)}>
                        {hostel.availability}
                      </Badge>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        as={Link}
                        to={`/hostels/${hostel.id}`}
                      >
                        <i className="bi bi-eye me-1"></i>
                        View
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleRemove(hostel.id)}
                      >
                        <i className="bi bi-heart-fill"></i>
                      </Button>
                    </div>
                    {formatSavedDate(hostel.savedAt) && (
                      <small className="text-muted d-block mt-2">
                        Saved on {formatSavedDate(hostel.savedAt)}
                      </small>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Hostels Table (Tablet) */}
      <Row className="d-none d-md-block d-lg-none mb-4">
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Hostel</th>
                  <th>Location</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {savedHostels.map((hostel) => (
                  <tr key={hostel.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        {hostel.verified ? (
                          <i className="bi bi-patch-check-fill text-success me-2"></i>
                        ) : (
                          <i className="bi bi-exclamation-circle text-secondary me-2"></i>
                        )}
                        <div>
                          <strong>{hostel.name}</strong>
                          <br />
                          <small className="text-muted">{hostel.distance}</small>
                        </div>
                      </div>
                    </td>
                    <td><small>{hostel.location}</small></td>
                    <td><small>{hostel.priceRange}</small></td>
                    <td>
                      <Badge bg={getAvailabilityVariant(hostel.availability)} size="sm">
                        {hostel.availability}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-1"
                        as={Link}
                        to={`/hostels/${hostel.id}`}
                      >
                        <i className="bi bi-eye"></i>
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleRemove(hostel.id)}
                      >
                        <i className="bi bi-heart-fill"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Row>

      {/* Mobile Card View */}
      <Row className="d-md-none">
        {savedHostels.map((hostel) => (
          <Col key={hostel.id} xs={12} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h6 className="fw-bold mb-1">{hostel.name}</h6>
                    <small className="text-muted">
                      <i className="bi bi-geo-alt-fill me-1"></i>
                      {hostel.location}
                    </small>
                  </div>
                  {hostel.verified ? (
                    <Badge bg="success" className="ms-2">
                      <i className="bi bi-patch-check-fill me-1"></i>
                      Verified
                    </Badge>
                  ) : (
                    <Badge bg="secondary" className="ms-2">Unverified</Badge>
                  )}
                </div>
                
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <small className="text-muted">
                    <i className="bi bi-currency-dollar me-1"></i>
                    {hostel.priceRange}
                    <span className="mx-2">•</span>
                    <i className="bi bi-pin-map me-1"></i>
                    {hostel.distance}
                  </small>
                  <Badge bg={getAvailabilityVariant(hostel.availability)}>
                    {hostel.availability}
                  </Badge>
                </div>

                <div className="d-flex gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="flex-grow-1"
                    as={Link}
                    to={`/hostels/${hostel.id}`}
                  >
                    <i className="bi bi-eye me-1"></i>
                    View Details
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleRemove(hostel.id)}
                  >
                    <i className="bi bi-heart-fill"></i>
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Empty State */}
      {savedHostels.length === 0 && (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <i className="bi bi-heart text-muted fs-1"></i>
            <h5 className="mt-3 mb-2">No saved hostels yet</h5>
            <p className="text-muted mb-3">
              Start browsing hostels and save your favorites here
            </p>
            <Button variant="primary" as={Link} to="/hostels">
              <i className="bi bi-search me-1"></i>
              Browse Hostels
            </Button>
          </Card.Body>
        </Card>
      )}

      <style>{`
        .saved-hostel-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          border-left: 4px solid #667eea !important;
        }

        .saved-hostel-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25) !important;
        }

        .hostel-image-placeholder {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: white;
        }
      `}</style>
    </>
  );
};

export default SavedHostels;
