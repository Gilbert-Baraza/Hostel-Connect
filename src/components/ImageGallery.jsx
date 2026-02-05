import React, { useState } from 'react';
import { Container, Row, Col, Image, Button } from 'react-bootstrap';

/**
 * ImageGallery Component
 * Displays main hostel image with thumbnail gallery
 * 
 * Props:
 * - images: Array of image URLs
 * - alt: Alt text for images (usually hostel name)
 * 
 * Ready for dynamic image arrays from backend
 */
const ImageGallery = ({ images = [], alt = 'Hostel Image' }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Default placeholder images if no images provided
  const defaultImages = [
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"%3E%3Crect fill="%23f8f9fa" width="800" height="600"/%3E%3Ctext x="400" y="300" text-anchor="middle" font-family="Arial" font-size="24" fill="%236c757d"%3ENo Image Available%3C/text%3E'
  ];
  
  const galleryImages = images.length > 0 ? images : defaultImages;
  
  const handleImageError = (e) => {
    e.target.src = defaultImages[0];
  };
  
  const handlePrevious = () => {
    setSelectedImage(prev => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };
  
  const handleNext = () => {
    setSelectedImage(prev => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };
  
  return (
    <div className="image-gallery">
      {/* Main Image */}
      <div className="main-image-container position-relative rounded-3 overflow-hidden shadow-sm">
        <Image
          src={galleryImages[selectedImage]}
          alt={`${alt} - Image ${selectedImage + 1}`}
          className="main-image w-100"
          style={{ maxHeight: '450px', objectFit: 'cover' }}
          onError={handleImageError}
        />
        
        {/* Navigation Arrows (show only if multiple images) */}
        {galleryImages.length > 1 && (
          <>
            <Button
              variant="dark"
              className="position-absolute top-50 start-0 translate-middle-y ms-2 rounded-circle p-2"
              onClick={handlePrevious}
              aria-label="Previous image"
              style={{ opacity: 0.8 }}
            >
              <i className="bi bi-chevron-left"></i>
            </Button>
            <Button
              variant="dark"
              className="position-absolute top-50 end-0 translate-middle-y me-2 rounded-circle p-2"
              onClick={handleNext}
              aria-label="Next image"
              style={{ opacity: 0.8 }}
            >
              <i className="bi bi-chevron-right"></i>
            </Button>
          </>
        )}
        
        {/* Image Counter */}
        {galleryImages.length > 1 && (
          <div className="image-counter position-absolute bottom-0 end-0 m-3 bg-dark text-white px-3 py-1 rounded-pill small">
            {selectedImage + 1} / {galleryImages.length}
          </div>
        )}
      </div>
      
      {/* Thumbnails */}
      {galleryImages.length > 1 && (
        <div className="thumbnail-gallery mt-3 d-flex gap-2 overflow-auto pb-2">
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className={`thumbnail-wrapper flex-shrink-0 rounded-2 overflow-hidden cursor-pointer border-2 ${
                index === selectedImage ? 'border-primary' : 'border-transparent'
              }`}
              style={{ 
                width: '80px', 
                height: '60px',
                cursor: 'pointer',
                transition: 'border-color 0.2s ease'
              }}
              onClick={() => setSelectedImage(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedImage(index);
                }
              }}
              aria-label={`View image ${index + 1}`}
              aria-pressed={index === selectedImage}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="thumbnail w-100 h-100"
                style={{ objectFit: 'cover' }}
                onError={handleImageError}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
