import React from 'react';
import { Card, Button, Badge, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

/**
 * HostelCard Component
 * Displays individual hostel information in a card format
 */
const HostelCard = ({ hostel }) => {
  // Format price with Nigerian Naira
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Get amenity icon
  const getAmenityIcon = (amenity) => {
    const icons = {
      'Water': 'bi-droplet-fill text-primary',
      'WiFi': 'bi-wifi text-success',
      'Security': 'bi-shield-check text-success',
      'Electricity': 'bi-lightning-charge-fill text-warning',
      'Laundry': 'biwasher text-info',
      'Study Room': 'bi-book-fill text-secondary',
      'Gym': 'bi-heart-pulse-fill text-danger',
      'Cafeteria': 'bi-cup-hot-fill text-warning',
      'Garden': 'bi-tree-fill text-success'
    };
    return icons[amenity] || 'bi-check-circle-fill text-muted';
  };

  // Display amenities (max 4)
  const displayedAmenities = hostel.amenities.slice(0, 4);
  const remainingAmenities = hostel.amenities.length - 4;

  return (
    <Card className="hostel-card h-100 shadow-sm">
      {/* Card Image */}
      <div className="card-image-wrapper position-relative">
        <Card.Img
          variant="top"
          src={hostel.image}
          alt={hostel.name}
          className="card-image"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f8f9fa" width="400" height="300"/%3E%3Ctext x="200" y="150" text-anchor="middle" font-family="Arial" font-size="16" fill="%236c757d"%3ENo Image%3C/text%3E%3C/svg%3E';
          }}
        />
        
        {/* Verified Badge */}
        {hostel.verified && (
          <Badge
            bg="success"
            className="verified-badge position-absolute top-0 start-0 m-2"
          >
            <i className="bi bi-patch-check-fill me-1"></i>
            Verified
          </Badge>
        )}
        
        {/* Price Badge */}
        <Badge
          bg="primary"
          className="price-badge position-absolute bottom-0 end-0 m-2"
        >
          {formatPrice(hostel.price)}/mo
        </Badge>
      </div>

      {/* Card Body */}
      <Card.Body className="d-flex flex-column">
        {/* Hostel Name & Rating */}
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Card.Title className="h5 fw-bold mb-0 text-truncate">
            {hostel.name}
          </Card.Title>
          <div className="rating-badge d-flex align-items-center">
            <i className="bi bi-star-fill text-warning me-1"></i>
            <span className="fw-bold">{hostel.rating}</span>
          </div>
        </div>

        {/* Location */}
        <Card.Text className="text-muted small mb-2">
          <i className="bi bi-geo-alt-fill me-1 text-primary"></i>
          {hostel.location}
        </Card.Text>

        {/* Distance & Rooms */}
        <div className="d-flex gap-3 mb-3">
          <span className="text-muted small">
            <i className="bi bi-signpost-2-fill me-1"></i>
            {hostel.distance} from campus
          </span>
          <span className="text-muted small">
            <i className="bi bi-door-open-fill me-1"></i>
            {hostel.roomsAvailable} rooms left
          </span>
        </div>

        {/* Amenities */}
        <div className="amenities-container mb-3 flex-grow-1">
          <Row className="g-1">
            {displayedAmenities.map((amenity, index) => (
              <Col xs="auto" key={index}>
                <Badge
                  bg="light"
                  text="dark"
                  className="amenity-badge me-1 mb-1"
                >
                  <i className={`bi ${getAmenityIcon(amenity)} me-1`}></i>
                  {amenity}
                </Badge>
              </Col>
            ))}
            {remainingAmenities > 0 && (
              <Col xs="auto">
                <Badge
                  bg="light"
                  text="dark"
                  className="amenity-badge mb-1"
                >
                  +{remainingAmenities} more
                </Badge>
              </Col>
            )}
          </Row>
        </div>

        {/* View Details Button */}
        <Link to={`/hostels/${hostel.id}`} className="text-decoration-none">
          <Button
            variant="primary"
            className="w-100 view-details-btn"
          >
            <i className="bi bi-eye-fill me-2"></i>
            View Details
          </Button>
        </Link>
      </Card.Body>
    </Card>
  );
};

export default HostelCard;
