import React from 'react';
import { Row, Col, Badge } from 'react-bootstrap';

/**
 * AmenitiesList Component
 * Displays a list of amenities with icons
 * 
 * Props:
 * - amenities: Array of amenity strings
 * - columns: Number of columns for layout (default: 2)
 * 
 * Ready for dynamic amenity arrays from backend
 */
const AmenitiesList = ({ amenities = [], columns = 2 }) => {
  /**
   * Get icon for amenity
   * Maps amenity names to Bootstrap Icons
   */
  const getAmenityIcon = (amenity) => {
    const iconMap = {
      'Water Availability': 'bi-droplet-fill',
      'Water': 'bi-droplet-fill',
      'High-Speed WiFi': 'bi-wifi',
      'WiFi': 'bi-wifi',
      '24/7 Security': 'bi-shield-check',
      'Security': 'bi-shield-check',
      'Electricity': 'bi-lightning-charge-fill',
      'Laundry Facilities': 'biwasher',
      'Laundry': 'biwasher',
      'Study Room': 'bi-book-fill',
      'Gym': 'bi-heart-pulse-fill',
      'Cafeteria': 'bi-cup-hot-fill',
      'Garden': 'bi-tree-fill',
      'CCTV Surveillance': 'bi-camera-video-fill',
      'Parking Space': 'bi-p-square-fill',
      'Bike Storage': 'bi-bicycle',
      'Rooftop Lounge': 'bi-sunrise-fill',
      'Meditation Room': 'bi-spa',
      'BBQ Area': 'bi-fire',
      'Common Area': 'bi-people-fill',
      'Package Locker': 'bi-box-seam-fill',
      'Library Access': 'bi-bookshelf',
      'Sports Complex Access': 'bi-trophy-fill',
      'Medical Store Nearby': 'bi-hospital-fill'
    };
    
    return iconMap[amenity] || 'bi-check-circle-fill';
  };
  
  /**
   * Get color class for amenity type
   */
  const getAmenityColor = (amenity) => {
    const colorMap = {
      'Water Availability': 'amenity-water',
      'Water': 'amenity-water',
      'High-Speed WiFi': 'amenity-wifi',
      'WiFi': 'amenity-wifi',
      '24/7 Security': 'amenity-security',
      'Security': 'amenity-security',
      'Electricity': 'amenity-electricity',
      'Laundry Facilities': 'amenity-laundry',
      'Laundry': 'amenity-laundry',
      'Study Room': 'amenity-study',
      'Gym': 'amenity-gym',
      'Cafeteria': 'amenity-cafeteria',
      'Garden': 'amenity-garden',
      'CCTV Surveillance': 'amenity-security',
      'Parking Space': 'amenity-parking',
      'default': 'amenity-default'
    };
    
    return colorMap[amenity] || 'amenity-default';
  };
  
  // Split amenities into columns
  const chunkArray = (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };
  
  const amenityColumns = chunkArray(amenities, Math.ceil(amenities.length / columns));
  
  return (
    <div className="amenities-list">
      {amenities.length === 0 ? (
        <p className="text-muted text-center py-4">
          <i className="bi bi-info-circle me-2"></i>
          No amenities information available
        </p>
      ) : (
        <Row>
          {amenityColumns.map((column, colIndex) => (
            <Col key={colIndex} xs={12} md={true}>
              <div className="amenity-column">
                {column.map((amenity, index) => (
                  <div 
                    key={index} 
                    className={`amenity-item d-flex align-items-center py-2 px-3 mb-2 rounded-2 ${getAmenityColor(amenity)}`}
                  >
                    <i 
                      className={`bi ${getAmenityIcon(amenity)} me-3 fs-5 flex-shrink-0`}
                    ></i>
                    <span className="amenity-text">{amenity}</span>
                  </div>
                ))}
              </div>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default AmenitiesList;
