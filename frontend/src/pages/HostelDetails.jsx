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
  ToastContainer,
  Alert,
  Form
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
import { getRoomsByHostel } from '../api/rooms';
import { createBooking } from '../api/bookings';
import { getReviewsByHostel, createReview, updateReview, deleteReview } from '../api/reviews';
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
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);
  const [reviewStats, setReviewStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [reviewForm, setReviewForm] = useState({ rating: '', comment: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitError, setReviewSubmitError] = useState(null);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editForm, setEditForm] = useState({ rating: '', comment: '' });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomsError, setRoomsError] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    roomId: '',
    startDate: '',
    endDate: ''
  });
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  
  const canSave = isAuthenticated && user?.role === 'student';
  const showSave = !isAuthenticated || user?.role === 'student';
  const canBook = isAuthenticated && user?.role === 'student';

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

    const fetchReviews = async () => {
      setReviewsLoading(true);
      setReviewsError(null);
      try {
        const response = await getReviewsByHostel(id, { limit: 20 });
        const data = response?.data;
        if (isMounted) {
          setReviews(data?.reviews || []);
          setReviewStats({
            averageRating: data?.stats?.averageRating ?? 0,
            totalReviews: data?.stats?.totalReviews ?? 0
          });
        }
      } catch (error) {
        if (isMounted) {
          setReviewsError(error?.message || 'Failed to load reviews');
        }
      } finally {
        if (isMounted) {
          setReviewsLoading(false);
        }
      }
    };

    if (id) {
      fetchReviews();
    }

    return () => {
      isMounted = false;
    };
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

  useEffect(() => {
    let isMounted = true;

    const fetchRooms = async () => {
      setRoomsLoading(true);
      setRoomsError(null);
      try {
        const response = await getRoomsByHostel(id, { limit: 50 });
        const rawRooms =
          response?.data?.rooms ||
          response?.data?.data?.rooms ||
          response?.rooms ||
          response?.data ||
          [];
        const list = Array.isArray(rawRooms) ? rawRooms : [];

        if (isMounted) {
          setRooms(list);
          setBookingForm((prev) => {
            const availableIds = new Set(
              list.map((room) => String(room?._id || room?.id)).filter(Boolean)
            );
            const nextRoomId = availableIds.has(String(prev.roomId))
              ? prev.roomId
              : (list[0]?._id || list[0]?.id || '');
            return { ...prev, roomId: nextRoomId };
          });
        }
      } catch (error) {
        if (isMounted) {
          setRoomsError(error?.message || 'Failed to load rooms');
        }
      } finally {
        if (isMounted) {
          setRoomsLoading(false);
        }
      }
    };

    if (id && canBook) {
      fetchRooms();
    } else if (isMounted) {
      setRooms([]);
      setRoomsError(null);
      setRoomsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [id, canBook]);

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

  const toDateInputValue = (date) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const addDays = (date, days) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  };

  const parseDateInputToLocal = (value) => {
    if (!value) return null;
    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  };

  const parseDateInputToUtc = (value) => {
    if (!value) return null;
    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) return null;
    return new Date(Date.UTC(year, month - 1, day));
  };

  const calculateBookingTotal = (room, startValue, endValue) => {
    if (!room || !startValue || !endValue) return null;
    const start = parseDateInputToUtc(startValue);
    const end = parseDateInputToUtc(endValue);
    if (!start || !end || end <= start) return null;
    const diffTime = end - start;
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const chargeableDays = Math.max(1, days);
    const dailyRate = (room.price?.amount || 0) / 30;
    return {
      days: chargeableDays,
      total: dailyRate * chargeableDays
    };
  };

  const getRoomTypeLabel = (value) => {
    const labels = {
      single: 'Single',
      double: 'Double',
      triple: 'Triple',
      quad: 'Quad',
      studio: 'Studio',
      bedspace: 'Bedspace'
    };
    return labels[value] || (value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : 'Room');
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

  const formatReviewDate = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating) => {
    const rounded = Math.round(Number(rating));
    return Array.from({ length: 5 }).map((_, index) => (
      <i
        key={index}
        className={`bi ${index < rounded ? 'bi-star-fill text-warning' : 'bi-star text-muted'}`}
      ></i>
    ));
  };

  const canReview = isAuthenticated && user?.role === 'student';
  const currentUserId = user?._id || user?.id;
  const currentUserReview = canReview ? reviews.find((review) =>
    String(review?.studentId?._id || review?.studentId?.id) === String(currentUserId)
  ) : null;
  const hasReviewed = !!currentUserReview;
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!canReview || hasReviewed) return;

    const ratingValue = Number(reviewForm.rating);
    if (!Number.isFinite(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      setReviewSubmitError('Select a rating between 1 and 5.');
      return;
    }

    setReviewSubmitError(null);
    setReviewSubmitting(true);
    try {
      await createReview(id, {
        rating: ratingValue,
        comment: reviewForm.comment?.trim() || undefined
      });

      const response = await getReviewsByHostel(id, { limit: 20 });
      const data = response?.data;
      setReviews(data?.reviews || []);
      setReviewStats({
        averageRating: data?.stats?.averageRating ?? 0,
        totalReviews: data?.stats?.totalReviews ?? 0
      });
      setReviewForm({ rating: '', comment: '' });
      setToast({
        show: true,
        message: 'Review submitted successfully',
        variant: 'success'
      });
    } catch (error) {
      setReviewSubmitError(error?.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleEditClick = (review) => {
    setEditingReviewId(review._id);
    setEditForm({ rating: String(review.rating), comment: review.comment || '' });
    setEditError(null);
  };

  const handleEditCancel = () => {
    setEditingReviewId(null);
    setEditForm({ rating: '', comment: '' });
    setEditError(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingReviewId) return;

    const ratingValue = Number(editForm.rating);
    if (!Number.isFinite(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      setEditError('Select a rating between 1 and 5.');
      return;
    }

    setEditSubmitting(true);
    setEditError(null);
    try {
      await updateReview(editingReviewId, {
        rating: ratingValue,
        comment: editForm.comment?.trim() || undefined
      });

      const response = await getReviewsByHostel(id, { limit: 20 });
      const data = response?.data;
      setReviews(data?.reviews || []);
      setReviewStats({
        averageRating: data?.stats?.averageRating ?? 0,
        totalReviews: data?.stats?.totalReviews ?? 0
      });
      setEditingReviewId(null);
      setToast({
        show: true,
        message: 'Review updated successfully',
        variant: 'success'
      });
    } catch (error) {
      setEditError(error?.message || 'Failed to update review');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete your review? This action cannot be undone.')) {
      return;
    }

    setDeleteSubmitting(reviewId);
    try {
      await deleteReview(reviewId);

      const response = await getReviewsByHostel(id, { limit: 20 });
      const data = response?.data;
      setReviews(data?.reviews || []);
      setReviewStats({
        averageRating: data?.stats?.averageRating ?? 0,
        totalReviews: data?.stats?.totalReviews ?? 0
      });
      setToast({
        show: true,
        message: 'Review deleted successfully',
        variant: 'success'
      });
    } catch (error) {
      setToast({
        show: true,
        message: error?.message || 'Failed to delete review',
        variant: 'danger'
      });
    } finally {
      setDeleteSubmitting(null);
    }
  };

  const handleBookingSubmit = async (event) => {
    event.preventDefault();
    if (!canBook || bookingSubmitting) return;

    if (!bookingForm.roomId) {
      setBookingError('Please select a room.');
      return;
    }

    if (!bookingForm.startDate || !bookingForm.endDate) {
      setBookingError('Please select start and end dates.');
      return;
    }

    const startDate = parseDateInputToUtc(bookingForm.startDate);
    const endDate = parseDateInputToUtc(bookingForm.endDate);

    if (!startDate || !endDate || endDate <= startDate) {
      setBookingError('End date must be after start date.');
      return;
    }

    setBookingError(null);
    setBookingSubmitting(true);

    try {
      const response = await createBooking(bookingForm.roomId, {
        startDate: bookingForm.startDate,
        endDate: bookingForm.endDate
      });

      setToast({
        show: true,
        message: response?.message || 'Booking request submitted successfully.',
        variant: 'success'
      });

      setBookingForm((prev) => ({
        ...prev,
        startDate: '',
        endDate: ''
      }));
    } catch (error) {
      const detailedErrors = Array.isArray(error?.data?.errors)
        ? error.data.errors.join(' ')
        : null;
      const message = detailedErrors || error?.message || 'Failed to submit booking request';
      setBookingError(message);
      setToast({
        show: true,
        message,
        variant: 'danger'
      });
    } finally {
      setBookingSubmitting(false);
    }
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

  const ratingValue =
    typeof reviewStats.averageRating === 'number' && reviewStats.averageRating > 0
      ? reviewStats.averageRating
      : typeof hostel.rating === 'number'
        ? hostel.rating
        : 0;

  const ratingLabel =
    ratingValue > 0
      ? `${ratingValue} / 5`
      : 'New';

  const hasCoordinates =
    hostel.coordinates &&
    hostel.coordinates.latitude !== undefined &&
    hostel.coordinates.longitude !== undefined &&
    hostel.coordinates.latitude !== '' &&
    hostel.coordinates.longitude !== '' &&
    Number.isFinite(Number(hostel.coordinates.latitude)) &&
    Number.isFinite(Number(hostel.coordinates.longitude));
  const latitudeValue = hasCoordinates ? Number(hostel.coordinates.latitude) : null;
  const longitudeValue = hasCoordinates ? Number(hostel.coordinates.longitude) : null;
  const selectedRoom = rooms.find(
    (room) => String(room?._id || room?.id) === String(bookingForm.roomId)
  );
  const bookingEstimate = calculateBookingTotal(
    selectedRoom,
    bookingForm.startDate,
    bookingForm.endDate
  );
  const now = new Date();
  const minStartDate = toDateInputValue(addDays(now, 1));
  const minEndDate = toDateInputValue(
    addDays(parseDateInputToLocal(bookingForm.startDate) || addDays(now, 1), 1)
  );

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
                        Reviews ({reviewStats.totalReviews || 0})
                      </span>
                    }
                  >
                    <div className="tab-content p-3">
                      <h5 className="fw-bold mb-3">Student Reviews</h5>
                      <div className="mb-4">
                        <div className="d-flex align-items-center gap-3">
                          <div className="d-flex align-items-center gap-1">
                            {renderStars(ratingValue)}
                          </div>
                          <span className="fw-bold">{ratingLabel}</span>
                          <span className="text-muted">
                            ({reviewStats.totalReviews || 0} review{reviewStats.totalReviews === 1 ? '' : 's'})
                          </span>
                        </div>
                      </div>

                      {reviewsLoading ? (
                        <div className="text-center py-4 text-muted">
                          <div className="spinner-border text-primary" role="status"></div>
                          <p className="mt-2 mb-0">Loading reviews...</p>
                        </div>
                      ) : reviewsError ? (
                        <Alert variant="danger">
                          <i className="bi bi-exclamation-triangle me-2"></i>
                          {reviewsError}
                        </Alert>
                      ) : reviews.length === 0 ? (
                        <div className="reviews-placeholder text-center py-4">
                          <i className="bi bi-chat-dots fs-1 text-muted mb-3 d-block"></i>
                          <p className="text-muted mb-0">
                            No reviews yet. Be the first to share your experience.
                          </p>
                        </div>
                      ) : (
                        <div className="reviews-list">
                          {reviews.map((review) => (
                            <Card key={review._id} className="border-0 shadow-sm mb-3">
                              <Card.Body>
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <div>
                                    <h6 className="fw-bold mb-1">
                                      {review.studentId?.name || 'Student'}
                                    </h6>
                                    <small className="text-muted">
                                      {formatReviewDate(review.createdAt)}
                                    </small>
                                  </div>
                                  <div className="d-flex align-items-center gap-1">
                                    {renderStars(review.rating)}
                                  </div>
                                </div>
                                {review.comment && (
                                  <p className="mb-0 text-muted">{review.comment}</p>
                                )}
                              </Card.Body>
                            </Card>
                          ))}
                        </div>
                      )}

                      {canReview && !hasReviewed && (
                        <Card className="border-0 shadow-sm mt-4">
                          <Card.Body>
                            <h6 className="fw-bold mb-3">Write a Review</h6>
                            {reviewSubmitError && (
                              <Alert variant="danger">
                                <i className="bi bi-exclamation-triangle me-2"></i>
                                {reviewSubmitError}
                              </Alert>
                            )}
                            <Form onSubmit={handleReviewSubmit}>
                              <Form.Group className="mb-3" controlId="reviewRating">
                                <Form.Label className="fw-medium">Rating</Form.Label>
                                <Form.Select
                                  value={reviewForm.rating}
                                  onChange={(e) => setReviewForm(prev => ({ ...prev, rating: e.target.value }))}
                                >
                                  <option value="">Select rating</option>
                                  {[1, 2, 3, 4, 5].map((value) => (
                                    <option key={value} value={value}>{value}</option>
                                  ))}
                                </Form.Select>
                              </Form.Group>
                              <Form.Group className="mb-3" controlId="reviewComment">
                                <Form.Label className="fw-medium">Comment (Optional)</Form.Label>
                                <Form.Control
                                  as="textarea"
                                  rows={3}
                                  value={reviewForm.comment}
                                  onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                                  placeholder="Share your experience"
                                />
                              </Form.Group>
                              <Button
                                variant="outline-primary"
                                type="submit"
                                disabled={reviewSubmitting}
                              >
                                <i className="bi bi-pencil-square me-2"></i>
                                {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                              </Button>
                            </Form>
                          </Card.Body>
                        </Card>
                      )}

                      {canReview && hasReviewed && (
                        <Alert variant="info" className="mt-4">
                          <i className="bi bi-info-circle me-2"></i>
                          You have already reviewed this hostel.
                        </Alert>
                      )}
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

              {/* Booking Card */}
              <Card className="border-0 shadow-sm mt-4">
                <Card.Header className="bg-white">
                  <h6 className="mb-0 fw-bold">
                    <i className="bi bi-calendar2-check me-2 text-success"></i>
                    Book a Room
                  </h6>
                </Card.Header>
                <Card.Body>
                  {!canBook ? (
                    <Alert variant="info" className="mb-0">
                      <i className="bi bi-info-circle me-2"></i>
                      Only students can request bookings for hostels.
                    </Alert>
                  ) : roomsLoading ? (
                    <div className="text-center py-3 text-muted">
                      <div className="spinner-border text-success" role="status"></div>
                      <p className="mt-2 mb-0">Loading available rooms...</p>
                    </div>
                  ) : roomsError ? (
                    <Alert variant="danger" className="mb-0">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      {roomsError}
                    </Alert>
                  ) : rooms.length === 0 ? (
                    <Alert variant="warning" className="mb-0">
                      <i className="bi bi-exclamation-circle me-2"></i>
                      No available rooms are listed right now.
                    </Alert>
                  ) : (
                    <Form onSubmit={handleBookingSubmit}>
                      {bookingError && (
                        <Alert variant="danger">
                          <i className="bi bi-exclamation-triangle me-2"></i>
                          {bookingError}
                        </Alert>
                      )}
                      <Form.Group className="mb-3" controlId="bookingRoom">
                        <Form.Label className="fw-medium">Select Room</Form.Label>
                        <Form.Select
                          value={bookingForm.roomId}
                          onChange={(event) => {
                            setBookingForm((prev) => ({ ...prev, roomId: event.target.value }));
                            if (bookingError) setBookingError(null);
                          }}
                        >
                          {rooms.map((room) => {
                            const roomId = room?._id || room?.id;
                            const priceLabel =
                              typeof room?.price?.amount === 'number'
                                ? `${formatPrice(room.price.amount)}/mo`
                                : 'Price N/A';
                            return (
                              <option key={roomId} value={roomId}>
                                {room.roomNumber || 'Room'} - {getRoomTypeLabel(room.roomType)} - {priceLabel}
                              </option>
                            );
                          })}
                        </Form.Select>
                      </Form.Group>
                      <Row className="g-2">
                        <Col xs={12} md={6}>
                          <Form.Group controlId="bookingStart">
                            <Form.Label className="fw-medium">Start Date</Form.Label>
                            <Form.Control
                              type="date"
                              value={bookingForm.startDate}
                              min={minStartDate}
                              onChange={(event) => {
                                setBookingForm((prev) => ({
                                  ...prev,
                                  startDate: event.target.value
                                }));
                                if (bookingError) setBookingError(null);
                              }}
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col xs={12} md={6}>
                          <Form.Group controlId="bookingEnd">
                            <Form.Label className="fw-medium">End Date</Form.Label>
                            <Form.Control
                              type="date"
                              value={bookingForm.endDate}
                              min={minEndDate}
                              onChange={(event) => {
                                setBookingForm((prev) => ({
                                  ...prev,
                                  endDate: event.target.value
                                }));
                                if (bookingError) setBookingError(null);
                              }}
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      {bookingEstimate && (
                        <div className="small text-muted mt-3">
                          Estimated total: <strong>{formatPrice(bookingEstimate.total)}</strong>
                          <span className="ms-1">
                            for {bookingEstimate.days} day{bookingEstimate.days === 1 ? '' : 's'}
                          </span>
                        </div>
                      )}

                      <Button
                        variant="success"
                        type="submit"
                        className="w-100 mt-3"
                        disabled={
                          bookingSubmitting ||
                          !bookingForm.roomId ||
                          !bookingForm.startDate ||
                          !bookingForm.endDate
                        }
                      >
                        <i className="bi bi-send-check me-2"></i>
                        {bookingSubmitting ? 'Submitting...' : 'Request Booking'}
                      </Button>

                      <div className="small text-muted mt-2">
                        Booking requests are sent to the landlord for approval.
                      </div>
                    </Form>
                  )}
                </Card.Body>
              </Card>
              
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
                  {hasCoordinates ? (
                    <div className="map-embed">
                      <iframe
                        title="hostel-location"
                        style={{ width: '100%', height: '200px', border: 0 }}
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${longitudeValue - 0.01}%2C${latitudeValue - 0.01}%2C${longitudeValue + 0.01}%2C${latitudeValue + 0.01}&layer=mapnik&marker=${latitudeValue}%2C${longitudeValue}`}
                      />
                      <div className="map-actions p-3">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          href={`https://www.google.com/maps?q=${latitudeValue},${longitudeValue}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <i className="bi bi-map me-2"></i>
                          Open in Google Maps
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="map-placeholder d-flex align-items-center justify-content-center bg-light"
                      style={{ height: '200px' }}
                    >
                      <div className="text-center">
                        <i className="bi bi-map fs-1 text-muted mb-2 d-block"></i>
                        <small className="text-muted">Location not provided</small>
                      </div>
                    </div>
                  )}
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
