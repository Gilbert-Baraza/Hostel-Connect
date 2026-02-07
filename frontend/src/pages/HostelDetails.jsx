import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Button, 
  Badge, 
  Card, 
  Breadcrumb,
  Tab,
  Tabs,
  Toast,
  ToastContainer
} from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';

// Components
import ImageGallery from '../components/ImageGallery';
import AmenitiesList from '../components/AmenitiesList';
import ContactPanel from '../components/ContactPanel';
import TrustSection from '../components/TrustSection';
import { LoadingState, SkeletonLoader } from '../components/LoadingState';

import { getHostelById } from '../api/hostels';
import { normalizeHostel } from '../utils/hostelMapper';
import { getSavedHostels, saveHostel } from '../api/student';
import { useAuth } from '../auth/AuthContext';

/**
 * HostelDetails Page Component
 * Displays comprehensive information about a specific hostel
 * 
 * Route: /hostels/:id
 * Uses useParams() to extract hostel ID for data fetching
 * 
 * Ready for backend API integration
 */
const HostelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  // State management for API-ready data fetching
  const [hostel, setHostel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
  
  useEffect(() => {
    const fetchHostelData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getHostelById(id);
        const data = response?.data?.hostel || response?.data;

        if (!data) {
          throw new Error('Hostel not found');
        }

        setHostel(normalizeHostel(data));
      } catch (err) {
        setError(err?.message || 'Hostel not found');
      } finally {
        setLoading(false);
      }
    };

    fetchHostelData();
  }, [id]);

  useEffect(() => {
    let isMounted = true;

    const fetchSavedState = async () => {
      if (!(isAuthenticated && user?.role === 'student')) {
        if (isMounted) setSaved(false);
        return;
      }
      try {
        const response = await getSavedHostels();
        const list = response?.data?.savedHostels || response?.data || [];
        const ids = list
          .map((entry) => entry?.hostel?._id || entry?.hostel || entry?._id || entry?.id)
          .filter(Boolean)
          .map((value) => String(value));
        if (isMounted) {
          setSaved(ids.includes(String(id)));
        }
      } catch (error) {
        console.error('Failed to load saved hostels:', error);
      }
    };

    fetchSavedState();

    return () => {
      isMounted = false;
    };
  }, [id, isAuthenticated, user?.role]);

  const canSave = isAuthenticated && user?.role === 'student';
  const showSave = !isAuthenticated || user?.role === 'student';

  const handleSave = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!canSave || saving || saved) return;
    setSaveError(null);
    try {
      setSaving(true);
      const response = await saveHostel(id);
      setSaved(true);
      setToast({
        show: true,
        message: response?.message || 'Hostel saved',
        variant: 'success'
      });
    } catch (err) {
      setSaveError(err?.message || 'Failed to save hostel');
      setToast({
        show: true,
        message: err?.message || 'Failed to save hostel',
        variant: 'danger'
      });
    } finally {
      setSaving(false);
    }
  };
  
  /**
   * Format price to Kenya Shilling
   */
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0
    }).format(price);
  };
  
  /**
   * Get availability badge variant
   */
  const getAvailabilityVariant = (availability) => {
    const variants = {
      'Available': 'success',
      'Limited': 'warning',
      'Full': 'danger'
    };
    return variants[availability] || 'secondary';
  };
  
  // =========================================================================
  // LOADING STATE
  // =========================================================================
  if (loading) {
    return (
      <div className="hostel-details-page bg-light">
        {/* Breadcrumb */}
        <Container className="mt-3">
          <Breadcrumb>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
              <i className="bi bi-house-fill me-1"></i>
              Home
            </Breadcrumb.Item>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/hostels' }}>
              Hostels
            </Breadcrumb.Item>
            <Breadcrumb.Item active>Loading...</Breadcrumb.Item>
          </Breadcrumb>
        </Container>
        
        {/* Loading Skeleton */}
        <Container className="py-4">
          <SkeletonLoader type="details" />
        </Container>
      </div>
    );
  }
  
  // =========================================================================
  // ERROR STATE
  // =========================================================================
  if (error || !hostel) {
    return (
      <Container className="py-5">
        <div className="text-center py-5">
          <div className="error-icon mb-4">
            <i className="bi bi-exclamation-circle display-1 text-muted"></i>
          </div>
          <h2 className="fw-bold mb-3">Hostel Not Found</h2>
          <p className="text-muted mb-4">
            {error || "The hostel you're looking for doesn't exist or has been removed."}
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Button 
              variant="primary" 
              onClick={() => navigate('/hostels')}
              className="px-4"
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Hostels
            </Button>
            <Button 
              variant="outline-secondary" 
              onClick={() => navigate('/')}
              className="px-4"
            >
              <i className="bi bi-house me-2"></i>
              Go Home
            </Button>
          </div>
        </div>
      </Container>
    );
  }
  
  // =========================================================================
  // SUCCESS STATE - RENDER HOSTEL DETAILS
  // =========================================================================
  const roomsAvailableLabel =
    typeof hostel.roomsAvailable === 'number'
      ? `${hostel.roomsAvailable} left`
      : 'N/A';

  const ratingLabel =
    typeof hostel.rating === 'number' && hostel.rating > 0
      ? `${hostel.rating} / 5`
      : 'New';

  return (
    <div className="hostel-details-page">
      <ToastContainer position="bottom-end" className="p-3">
        <Toast
          bg={toast.variant}
          show={toast.show}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
          delay={3000}
          autohide
        >
          <Toast.Body className="text-white">
            {toast.message}
          </Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Breadcrumb */}
      <Container className="mt-3">
        <Breadcrumb>
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
            <i className="bi bi-house-fill me-1"></i>
            Home
          </Breadcrumb.Item>
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/hostels' }}>
            Hostels
          </Breadcrumb.Item>
          <Breadcrumb.Item active>{hostel.name}</Breadcrumb.Item>
        </Breadcrumb>
      </Container>
      
      {/* Main Content */}
      <Container className="py-4">
        <Row>
          {/* Left Column - Image Gallery & Details */}
          <Col lg={8}>
            {/* Image Gallery */}
            <section className="mb-4">
              <ImageGallery 
                images={hostel.images} 
                alt={hostel.name}
              />
            </section>
            
            {/* Hostel Overview Card */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                {/* Title & Badges */}
                <div className="d-flex flex-wrap justify-content-between align-items-start mb-3 gap-2">
                  <div>
                    <h1 className="fw-bold mb-2">{hostel.name}</h1>
                    <p className="text-muted mb-0">
                      <i className="bi bi-geo-alt-fill me-2 text-primary"></i>
                      {hostel.location}
                    </p>
                  </div>
                  <div className="d-flex gap-2 flex-wrap">
                    {hostel.verified && (
                      <Badge bg="success" className="verified-badge">
                        <i className="bi bi-patch-check-fill me-1"></i>
                        Verified
                      </Badge>
                    )}
                    <Badge bg={getAvailabilityVariant(hostel.availability)}>
                      <i className="bi bi-circle-fill me-1" style={{ fontSize: '0.6rem' }}></i>
                      {hostel.availability}
                    </Badge>
                    <Badge bg="info" className="text-dark">
                      <i className="bi bi-people-fill me-1"></i>
                      {hostel.type}
                    </Badge>
                  </div>
                </div>
                
                {/* Quick Info */}
                <Row className="mb-4">
                  <Col xs={6} sm={3}>
                    <div className="quick-info-item text-center p-3 bg-light rounded-2">
                      <i className="bi bi-signpost-2 fs-4 text-primary d-block mb-1"></i>
                      <small className="text-muted d-block">Distance</small>
                      <strong>{hostel.distance}</strong>
                    </div>
                  </Col>
                  <Col xs={6} sm={3}>
                    <div className="quick-info-item text-center p-3 bg-light rounded-2">
                      <i className="bi bi-currency-dollar fs-4 text-success d-block mb-1"></i>
                      <small className="text-muted d-block">Monthly Rent</small>
                      <strong>{formatPrice(hostel.price)}</strong>
                    </div>
                  </Col>
                  <Col xs={6} sm={3}>
                    <div className="quick-info-item text-center p-3 bg-light rounded-2">
                      <i className="bi bi-star-fill fs-4 text-warning d-block mb-1"></i>
                      <small className="text-muted d-block">Rating</small>
                      <strong>{ratingLabel}</strong>
                    </div>
                  </Col>
                  <Col xs={6} sm={3}>
                    <div className="quick-info-item text-center p-3 bg-light rounded-2">
                      <i className="bi bi-door-open fs-4 text-info d-block mb-1"></i>
                      <small className="text-muted d-block">Rooms</small>
                      <strong>{roomsAvailableLabel}</strong>
                    </div>
                  </Col>
                </Row>
                
                {/* Tabs for Details */}
                <Tabs 
                  defaultActiveKey="description" 
                  id="hostel-details-tabs"
                  className="mb-3"
                >
                  {/* Description Tab */}
                  <Tab 
                    eventKey="description" 
                    title={
                      <span>
                        <i className="bi bi-file-text me-2"></i>
                        Description
                      </span>
                    }
                  >
                    <div className="tab-content p-3">
                      <h5 className="fw-bold mb-3">About {hostel.name}</h5>
                      <p className="text-muted" style={{ lineHeight: '1.8' }}>
                        {hostel.description}
                      </p>
                    </div>
                  </Tab>
                  
                  {/* Amenities Tab */}
                  <Tab 
                    eventKey="amenities" 
                    title={
                      <span>
                        <i className="bi bi-star-fill me-2"></i>
                        Amenities
                      </span>
                    }
                  >
                    <div className="tab-content p-3">
                      <h5 className="fw-bold mb-3">Hostel Amenities</h5>
                      <AmenitiesList 
                        amenities={hostel.amenities} 
                        columns={2}
                      />
                    </div>
                  </Tab>
                  
                  {/* Rules Tab */}
                  <Tab 
                    eventKey="rules" 
                    title={
                      <span>
                        <i className="bi bi-list-check me-2"></i>
                        Rules
                      </span>
                    }
                  >
                    <div className="tab-content p-3">
                      <h5 className="fw-bold mb-3">Hostel Rules & Conditions</h5>
                      <ul className="rules-list list-unstyled">
                        {hostel.rules && hostel.rules.length > 0 ? (
                          hostel.rules.map((rule, index) => (
                            <li key={index} className="d-flex align-items-start mb-3">
                              <i className="bi bi-check-circle-fill text-success me-3 mt-1 flex-shrink-0"></i>
                              <span>{rule}</span>
                            </li>
                          ))
                        ) : (
                          <p className="text-muted">No specific rules listed.</p>
                        )}
                      </ul>
                    </div>
                  </Tab>
                  
                  {/* Reviews Tab */}
                  <Tab 
                    eventKey="reviews" 
                    title={
                      <span>
                        <i className="bi bi-chat-quote me-2"></i>
                        Reviews ({hostel.reviewsCount || 0})
                      </span>
                    }
                  >
                    <div className="tab-content p-3">
                      <h5 className="fw-bold mb-3">Student Reviews</h5>
                      <div className="reviews-placeholder text-center py-4">
                        <i className="bi bi-chat-dots fs-1 text-muted mb-3 d-block"></i>
                        <p className="text-muted mb-3">
                          Reviews from current and past tenants will be displayed here.
                        </p>
                        <Button variant="outline-primary" size="sm">
                          <i className="bi bi-pencil-square me-2"></i>
                          Write a Review
                        </Button>
                      </div>
                    </div>
                  </Tab>
                </Tabs>
                
                {/* Navigation Button */}
                <div className="mt-4 pt-3 border-top">
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => navigate('/hostels')}
                    className="px-4"
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Back to Listings
                  </Button>
                </div>
              </Card.Body>
            </Card>
            
            {/* Trust Section */}
            <TrustSection 
              verified={hostel.verified}
              hostelName={hostel.name}
            />
          </Col>
          
          {/* Right Column - Contact Panel */}
          <Col lg={4}>
            <div className="sticky-sidebar">
              {/* Contact Panel */}
              <ContactPanel 
                landlord={hostel.landlord}
                hostelName={hostel.name}
              />
              
              {/* Quick Actions Card */}
              <Card className="border-0 shadow-sm mt-4">
                <Card.Header className="bg-white">
                  <h6 className="mb-0 fw-bold">
                    <i className="bi bi-lightning-charge me-2 text-warning"></i>
                    Quick Actions
                  </h6>
                </Card.Header>
                <Card.Body>
                  <div className="d-grid gap-2">
                    {showSave && (
                      <Button
                        variant={saved ? 'success' : 'outline-primary'}
                        className="text-start"
                        onClick={handleSave}
                        disabled={saving || saved}
                      >
                        <i className={`bi ${saved ? 'bi-check-circle-fill' : 'bi-heart'} me-2`}></i>
                        {saved ? 'Saved' : saving ? 'Saving...' : 'Save to Favorites'}
                      </Button>
                    )}
                    <Button variant="outline-primary" className="text-start">
                      <i className="bi bi-share me-2"></i>
                      Share Listing
                    </Button>
                    <Button variant="outline-primary" className="text-start">
                      <i className="bi bi-printer me-2"></i>
                      Print Details
                    </Button>
                  </div>
                  {saveError && (
                    <div className="text-danger small mt-2">
                      <i className="bi bi-exclamation-triangle-fill me-1"></i>
                      {saveError}
                    </div>
                  )}
                </Card.Body>
              </Card>
              
              {/* Map Placeholder */}
              <Card className="border-0 shadow-sm mt-4">
                <Card.Header className="bg-white">
                  <h6 className="mb-0 fw-bold">
                    <i className="bi bi-geo-alt me-2 text-danger"></i>
                    Location
                  </h6>
                </Card.Header>
                <Card.Body className="p-0">
                  <div 
                    className="map-placeholder d-flex align-items-center justify-content-center bg-light"
                    style={{ height: '200px' }}
                  >
                    <div className="text-center">
                      <i className="bi bi-map fs-1 text-muted mb-2 d-block"></i>
                      <small className="text-muted">Map view coming soon</small>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HostelDetails;
