import React from 'react';
import { Form, Button, Collapse, Badge } from 'react-bootstrap';
import { filterOptions } from '../data/hostels';

/**
 * FilterSidebar Component
 * Collapsible sidebar for filtering hostels by price, distance, and amenities
 */
const FilterSidebar = ({ 
  filters, 
  setFilters, 
  isMobile, 
  showMobileFilters, 
  setShowMobileFilters 
}) => {
  
  // Handle checkbox change for amenities
  const handleAmenityChange = (amenityId) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  // Handle verified toggle change
  const handleVerifiedChange = (e) => {
    setFilters(prev => ({
      ...prev,
      verifiedOnly: e.target.checked
    }));
  };

  // Handle price range change
  const handlePriceChange = (e) => {
    setFilters(prev => ({
      ...prev,
      priceRange: e.target.value
    }));
  };

  // Handle distance change
  const handleDistanceChange = (e) => {
    setFilters(prev => ({
      ...prev,
      distance: e.target.value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      priceRange: '',
      distance: '',
      amenities: [],
      verifiedOnly: false
    });
  };

  // Count active filters
  const activeFilterCount = [
    filters.priceRange,
    filters.distance,
    filters.amenities.length > 0,
    filters.verifiedOnly
  ].filter(Boolean).length;

  const sidebarContent = (
    <div className="filter-sidebar p-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold mb-0">
          <i className="bi bi-funnel-fill me-2"></i>
          Filters
        </h5>
        {activeFilterCount > 0 && (
          <Badge bg="primary" className="ms-2">{activeFilterCount}</Badge>
        )}
      </div>

      {/* Clear Filters Button */}
      {activeFilterCount > 0 && (
        <Button
          variant="outline-secondary"
          size="sm"
          className="w-100 mb-3"
          onClick={clearFilters}
        >
          <i className="bi bi-x-circle me-2"></i>
          Clear All Filters
        </Button>
      )}

      {/* Price Range Filter */}
      <div className="filter-section mb-4">
        <h6 className="fw-bold mb-3">
          <i className="bi bi-currency-dollar me-2"></i>
          Price Range
        </h6>
        <Form.Select
          value={filters.priceRange}
          onChange={handlePriceChange}
          className="form-select-sm"
        >
          <option value="">All Prices</option>
          {filterOptions.priceRanges.map((range, index) => (
            <option key={index} value={`${range.min}-${range.max}`}>
              {range.label}
            </option>
          ))}
        </Form.Select>
      </div>

      {/* Distance Filter */}
      <div className="filter-section mb-4">
        <h6 className="fw-bold mb-3">
          <i className="bi bi-geo-alt me-2"></i>
          Distance from Campus
        </h6>
        <Form.Select
          value={filters.distance}
          onChange={handleDistanceChange}
          className="form-select-sm"
        >
          <option value="">Any Distance</option>
          {filterOptions.distanceRanges.map((range, index) => (
            <option key={index} value={`${range.min || 0}-${range.max || 999}`}>
              {range.label}
            </option>
          ))}
        </Form.Select>
      </div>

      {/* Amenities Filter */}
      <div className="filter-section mb-4">
        <h6 className="fw-bold mb-3">
          <i className="bi bi-star-fill me-2"></i>
          Amenities
        </h6>
        <div className="amenities-list">
          {filterOptions.amenities.map((amenity) => (
            <Form.Check
              key={amenity.id}
              type="checkbox"
              id={`amenity-${amenity.id}`}
              label={
                <span className="d-flex align-items-center">
                  <i className={`bi ${amenity.icon} me-2 text-primary`}></i>
                  {amenity.label}
                </span>
              }
              checked={filters.amenities.includes(amenity.id)}
              onChange={() => handleAmenityChange(amenity.id)}
              className="amenity-check"
            />
          ))}
        </div>
      </div>

      {/* Verified Only Toggle */}
      <div className="filter-section mb-3">
        <h6 className="fw-bold mb-3">
          <i className="bi bi-patch-check-fill me-2 text-success"></i>
          Verification
        </h6>
        <Form.Check
          type="switch"
          id="verified-switch"
          label="Verified hostels only"
          checked={filters.verifiedOnly}
          onChange={handleVerifiedChange}
          className="verified-switch"
        />
      </div>
    </div>
  );

  // Mobile: Show as collapsible section
  if (isMobile) {
    return (
      <div className="mobile-filter-wrapper mb-3">
        <Button
          variant="outline-primary"
          className="w-100 filter-toggle-btn"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          aria-expanded={showMobileFilters}
        >
          <i className="bi bi-funnel me-2"></i>
          Filters
          {activeFilterCount > 0 && (
            <Badge bg="primary" className="ms-2">{activeFilterCount}</Badge>
          )}
          <i className={`bi ${showMobileFilters ? 'bi-chevron-up' : 'bi-chevron-down'} ms-auto`}></i>
        </Button>
        <Collapse in={showMobileFilters}>
          <div className="mt-2">
            {sidebarContent}
          </div>
        </Collapse>
      </div>
    );
  }

  // Desktop: Show as sidebar
  return sidebarContent;
};

export default FilterSidebar;
