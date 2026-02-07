import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Row, Col, Spinner, Alert, Badge, Button, Toast, ToastContainer } from 'react-bootstrap';
import HostelCard from './HostelCard';
import SearchBar from './SearchBar';
import FilterSidebar from './FilterSidebar';
import { getHostels, getPublicHostels } from '../api/hostels';
import { getSavedHostels } from '../api/student';
import { normalizeHostel } from '../utils/hostelMapper';
import { useAuth } from '../auth/AuthContext';

/**
 * HostelList Component
 * Manages filtering, searching, and displaying hostel cards
 */
const HostelList = ({ isMobile }) => {
  const { isAuthenticated, user } = useAuth();
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedHostelIds, setSavedHostelIds] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [budget, setBudget] = useState('');
  const [filters, setFilters] = useState({
    priceRange: '',
    distance: '',
    amenities: [],
    verifiedOnly: false
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const canSeePrivateHostels = isAuthenticated && (user?.role === 'landlord' || user?.role === 'admin');
  const canSave = isAuthenticated && user?.role === 'student';

  const showToast = (message, variant = 'success') => {
    setToast({ show: true, message, variant });
  };

  const fetchHostels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = canSeePrivateHostels
        ? await getHostels()
        : await getPublicHostels();
      const results = response?.data?.hostels || response?.data || [];
      setHostels(results.map(normalizeHostel));
    } catch (err) {
      setError(err?.message || 'Failed to load hostels');
    } finally {
      setLoading(false);
    }
  }, [canSeePrivateHostels]);

  useEffect(() => {
    fetchHostels();
  }, [fetchHostels]);

  const fetchSavedHostels = useCallback(async () => {
    if (!canSave) {
      setSavedHostelIds([]);
      return;
    }

    try {
      const response = await getSavedHostels();
      const list = response?.data?.savedHostels || response?.data || [];
      const ids = list
        .map((entry) => entry?.hostel?._id || entry?.hostel || entry?._id || entry?.id)
        .filter(Boolean)
        .map((value) => String(value));
      setSavedHostelIds(ids);
    } catch (err) {
      console.error('Failed to load saved hostels:', err);
    }
  }, [canSave]);

  useEffect(() => {
    fetchSavedHostels();
  }, [fetchSavedHostels]);

  const savedIdSet = useMemo(() => new Set(savedHostelIds), [savedHostelIds]);

  // Filter hostels based on search term and filters
  const filteredHostels = useMemo(() => {
    return hostels.filter(hostel => {
      // Search term filter
      const matchesSearch = searchTerm === '' || 
        hostel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hostel.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Budget filter
      let matchesBudget = true;
      if (budget) {
        const [min, max] = budget.split('-').map(Number);
        matchesBudget = hostel.price >= min && hostel.price <= max;
      }

      // Price range filter
      let matchesPriceRange = true;
      if (filters.priceRange) {
        const [min, max] = filters.priceRange.split('-').map(Number);
        matchesPriceRange = hostel.price >= min && hostel.price <= max;
      }

      // Distance filter
      let matchesDistance = true;
      if (filters.distance) {
        const [min, max] = filters.distance.split('-').map(Number);
        const distanceNum = parseFloat(hostel.distance);
        matchesDistance = distanceNum >= min && distanceNum <= max;
      }

      // Amenities filter
      let matchesAmenities = true;
      if (filters.amenities.length > 0) {
        matchesAmenities = filters.amenities.every(amenity => 
          hostel.amenities.some(a => a.toLowerCase().includes(amenity))
        );
      }

      // Verified filter
      let matchesVerified = true;
      if (filters.verifiedOnly) {
        matchesVerified = hostel.verified;
      }

      return matchesSearch && matchesBudget && matchesPriceRange && 
             matchesDistance && matchesAmenities && matchesVerified;
    });
  }, [searchTerm, budget, filters, hostels]);

  // Handle search
  const handleSearch = () => {
    // Filters are applied in real-time via useMemo
    // This function is here for the search button click event
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('');
    setBudget('');
    setFilters({
      priceRange: '',
      distance: '',
      amenities: [],
      verifiedOnly: false
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="loading-container text-center py-5">
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3 text-muted">Loading hostels...</p>
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
        <Button variant="outline-danger" onClick={fetchHostels}>
          <i className="bi bi-arrow-clockwise me-2"></i>
          Try Again
        </Button>
      </Alert>
    );
  }

  // Empty state
  if (filteredHostels.length === 0) {
    return (
      <div className="empty-state-container">
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          budget={budget}
          setBudget={setBudget}
          onSearch={handleSearch}
        />
        
        <Alert variant="info" className="empty-state-alert">
          <div className="text-center py-4">
            <i className="bi bi-search display-1 text-muted"></i>
            <h4 className="mt-3">No Hostels Found</h4>
            <p className="text-muted mb-3">
              We couldn't find any hostels matching your search criteria.
            </p>
            <Badge bg="primary" className="mb-3">
              Showing 0 of {hostels.length} hostels
            </Badge>
            <br />
            <button 
              className="btn btn-outline-primary"
              onClick={clearAllFilters}
            >
              <i className="bi bi-arrow-counterclockwise me-2"></i>
              Clear All Filters
            </button>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="hostel-list-container">
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

      {/* Search Bar */}
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        budget={budget}
        setBudget={setBudget}
        onSearch={handleSearch}
      />

      <Row className="g-4">
        {/* Filter Sidebar */}
        <Col lg={3} className="mb-4 mb-lg-0">
          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            isMobile={isMobile}
            showMobileFilters={showMobileFilters}
            setShowMobileFilters={setShowMobileFilters}
          />
        </Col>

        {/* Hostel Grid */}
        <Col lg={9}>
          {/* Results Count */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Badge bg="secondary" className="results-count">
              <i className="bi bi-building me-1"></i>
              {filteredHostels.length} Hostel{filteredHostels.length !== 1 ? 's' : ''} Found
            </Badge>
            <span className="text-muted small">
              Showing {filteredHostels.length} of {hostels.length} results
            </span>
          </div>

          {/* Hostel Cards Grid */}
          <Row className="g-4">
            {filteredHostels.map((hostel) => (
              <Col key={hostel.id} xs={12} sm={6} xl={4}>
                <HostelCard
                  hostel={hostel}
                  isSaved={savedIdSet.has(String(hostel.id))}
                  onSaved={(id) => {
                    const normalizedId = String(id);
                    setSavedHostelIds((prev) =>
                      prev.includes(normalizedId) ? prev : [...prev, normalizedId]
                    );
                  }}
                  onNotify={showToast}
                />
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default HostelList;
