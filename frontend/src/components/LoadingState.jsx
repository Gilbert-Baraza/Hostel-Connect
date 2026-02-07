import React from 'react';
import { Spinner, Container } from 'react-bootstrap';

/**
 * LoadingState Component
 * Displays a loading spinner for API data fetching
 * 
 * Props:
 * - message: Optional loading message
 * - fullPage: Whether to show as full-page loader (default: false)
 */
const LoadingState = ({ message = 'Loading hostel details...', fullPage = false }) => {
  const content = (
    <div className={`loading-state ${fullPage ? 'full-page' : ''}`}>
      <div className="text-center">
        <Spinner 
          animation="border" 
          role="status"
          variant="primary"
          className="mb-3"
          style={{ width: '3rem', height: '3rem' }}
        >
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <h5 className="text-muted">{message}</h5>
        <small className="text-muted">Please wait while we fetch the data</small>
      </div>
    </div>
  );
  
  if (fullPage) {
    return (
      <Container 
        fluid 
        className="d-flex align-items-center justify-content-center min-vh-100 bg-light"
      >
        {content}
      </Container>
    );
  }
  
  return (
    <div className="py-5">
      {content}
    </div>
  );
};

/**
 * SkeletonCard Component
 * Displays skeleton loading UI for cards
 * 
 * Props:
 * - variant: 'card' | 'image' | 'text'
 */
const SkeletonCard = ({ variant = 'card' }) => {
  if (variant === 'image') {
    return (
      <div className="skeleton skeleton-image rounded-3"></div>
    );
  }
  
  if (variant === 'text') {
    return (
      <div className="skeleton-wrapper">
        <div className="skeleton skeleton-title mb-2"></div>
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-text short"></div>
      </div>
    );
  }
  
  // Default card variant
  return (
    <div className="skeleton-card p-4 rounded-3 border-0 shadow-sm bg-white">
      <div className="skeleton skeleton-image-main rounded-2 mb-3"></div>
      <div className="skeleton skeleton-title mb-2"></div>
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-text short"></div>
      <div className="skeleton skeleton-button mt-3"></div>
    </div>
  );
};

/**
 * SkeletonLoader Component
 * Displays a skeleton-based loading UI
 * 
 * Props:
 * - type: 'details' | 'gallery' | 'custom'
 */
const SkeletonLoader = ({ type = 'details' }) => {
  if (type === 'gallery') {
    return (
      <div className="skeleton-gallery">
        <SkeletonCard variant="image" />
        <div className="d-flex gap-2 mt-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton skeleton-thumbnail rounded-2"></div>
          ))}
        </div>
      </div>
    );
  }
  
  if (type === 'custom') {
    return (
      <div className="py-5">
        <SkeletonCard variant="card" />
      </div>
    );
  }
  
  // Default details layout
  return (
    <div className="skeleton-details">
      <div className="row g-4">
        <div className="col-lg-7">
          <SkeletonCard variant="image" />
        </div>
        <div className="col-lg-5">
          <SkeletonCard variant="card" />
        </div>
      </div>
    </div>
  );
};

export { LoadingState, SkeletonCard, SkeletonLoader };
export default LoadingState;
