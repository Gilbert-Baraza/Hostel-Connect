import React, { useState } from 'react';
import { Row, Col, Card, Button, Table, Badge, Modal, Form, InputGroup } from 'react-bootstrap';
import { hostels, getLandlordById } from '../data/adminData';

/**
 * ListingsManager Component
 * 
 * Admin panel for managing all hostel listings on the platform.
 * Allows viewing, filtering, disabling, and re-enabling listings.
 * 
 * Features:
 * - View all hostels (verified & unverified)
 * - Filter by status, location, landlord
 * - Disable/Re-enable listings
 * 
 * @param {Object} props
 * @param {Function} props.onListingUpdate - Callback when listing status changes
 */
const ListingsManager = ({ onListingUpdate }) => {
  const [listings, setListings] = useState(hostels);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [disableReason, setDisableReason] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * Get filtered and searched listings
   */
  const getFilteredListings = () => {
    return listings.filter(listing => {
      // Status filter
      if (statusFilter !== 'all' && listing.status !== statusFilter) {
        return false;
      }
      // Type filter
      if (typeFilter !== 'all' && listing.type !== typeFilter) {
        return false;
      }
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          listing.name.toLowerCase().includes(search) ||
          listing.location.toLowerCase().includes(search)
        );
      }
      return true;
    });
  };

  /**
   * Open disable modal
   * @param {Object} listing 
   */
  const openDisableModal = (listing) => {
    setSelectedListing(listing);
    setDisableReason('');
    setShowDisableModal(true);
  };

  /**
   * Disable listing
   */
  const handleDisable = () => {
    if (!selectedListing) return;
    
    setListings(prev => 
      prev.map(l => 
        l.id === selectedListing.id 
          ? { ...l, status: 'disabled', rejectionReason: disableReason }
          : l
      )
    );
    onListingUpdate && onListingUpdate(selectedListing.id, 'disabled');
    setShowDisableModal(false);
    setSelectedListing(null);
    setDisableReason('');
  };

  /**
   * Re-enable listing
   * @param {string} listingId 
   */
  const handleEnable = (listingId) => {
    setListings(prev => 
      prev.map(l => 
        l.id === listingId 
          ? { ...l, status: 'verified', rejectionReason: null }
          : l
      )
    );
    onListingUpdate && onListingUpdate(listingId, 'verified');
  };

  /**
   * Get status badge variant
   * @param {string} status 
   * @returns {string}
   */
  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'danger';
      case 'disabled': return 'secondary';
      default: return 'secondary';
    }
  };

  /**
   * Get type badge variant
   * @param {string} type 
   * @returns {string}
   */
  const getTypeBadge = (type) => {
    switch (type) {
      case 'male': return 'primary';
      case 'female': return 'danger';
      case 'mixed': return 'info';
      default: return 'secondary';
    }
  };

  /**
   * Get landlord name
   * @param {string} landlordId 
   * @returns {string}
   */
  const getLandlordName = (landlordId) => {
    const landlord = getLandlordById(landlordId);
    return landlord ? landlord.name : 'Unknown';
  };

  const filteredListings = getFilteredListings();
  const stats = {
    total: listings.length,
    verified: listings.filter(l => l.status === 'verified').length,
    pending: listings.filter(l => l.status === 'pending').length,
    disabled: listings.filter(l => l.status === 'disabled').length
  };

  return (
    <div className="listings-manager">
      {/* Page Header */}
      <div className="page-header mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
          <div>
            <h1 className="page-title">
              <i className="bi bi-list-ul me-2"></i>
              Listings Management
            </h1>
            <p className="page-subtitle mb-0">
              Manage all hostel listings on the platform
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        {[
          { label: 'Total Listings', value: stats.total, icon: 'bi-building', color: 'primary' },
          { label: 'Active', value: stats.verified, icon: 'bi-check-circle', color: 'success' },
          { label: 'Pending Review', value: stats.pending, icon: 'bi-clock', color: 'warning' },
          { label: 'Disabled', value: stats.disabled, icon: 'bi-x-circle', color: 'secondary' }
        ].map((stat, idx) => (
          <Col key={idx} xs={6} md={3}>
            <Card className="stat-card-mini">
              <Card.Body className="d-flex align-items-center">
                <div className={`stat-icon-mini bg-${stat.color}`}>
                  <i className={`bi ${stat.icon}`}></i>
                </div>
                <div>
                  <div className="stat-value-mini">{stat.value}</div>
                  <div className="stat-label-mini">{stat.label}</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filters */}
      <Card className="mb-4 filter-card">
        <Card.Body>
          <Row className="g-3">
            <Col xs={12} md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search by name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col xs={6} md={3}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="disabled">Disabled</option>
              </Form.Select>
            </Col>
            <Col xs={6} md={3}>
              <Form.Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="mixed">Mixed</option>
              </Form.Select>
            </Col>
            <Col xs={12} md={2}>
              <Button 
                variant="outline-secondary" 
                className="w-100"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                }}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Reset
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Listings Table */}
      <Card>
        <Card.Header className="d-flex flex-wrap justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="bi bi-table me-2"></i>
            All Listings ({filteredListings.length})
          </h5>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="listings-table mb-0">
              <thead>
                <tr>
                  <th>Hostel</th>
                  <th>Type</th>
                  <th>Landlord</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredListings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5">
                      <i className="bi bi-inbox fs-1 text-muted d-block mb-2"></i>
                      <p className="text-muted mb-0">No listings found</p>
                    </td>
                  </tr>
                ) : (
                  filteredListings.map(listing => (
                    <tr key={listing.id}>
                      <td>
                        <div className="listing-info">
                          <div className="listing-image-placeholder">
                            <i className="bi bi-building"></i>
                          </div>
                          <div>
                            <div className="fw-bold">{listing.name}</div>
                            <small className="text-muted">
                              <i className="bi bi-geo-alt me-1"></i>
                              {listing.location}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge bg={getTypeBadge(listing.type)}>
                          {listing.type}
                        </Badge>
                      </td>
                      <td>{getLandlordName(listing.landlordId)}</td>
                      <td>
                        <strong>KSh {listing.price.toLocaleString()}</strong>
                        <small className="text-muted">/mo</small>
                      </td>
                      <td>
                        <Badge bg={getStatusBadge(listing.status)}>
                          {listing.status}
                        </Badge>
                        {listing.status === 'disabled' && listing.rejectionReason && (
                          <div className="mt-1">
                            <small className="text-muted" title={listing.rejectionReason}>
                              Reason on file
                            </small>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          {listing.status === 'disabled' ? (
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleEnable(listing.id)}
                              title="Re-enable Listing"
                            >
                              <i className="bi bi-check-lg me-1"></i>
                              Enable
                            </Button>
                          ) : (
                            <Button
                              variant="outline-warning"
                              size="sm"
                              onClick={() => openDisableModal(listing)}
                              title="Disable Listing"
                              disabled={listing.status === 'pending'}
                            >
                              <i className="bi bi-pause-lg me-1"></i>
                              Disable
                            </Button>
                          )}
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            title="View Details"
                          >
                            <i className="bi bi-eye"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Disable Modal */}
      <Modal show={showDisableModal} onHide={() => setShowDisableModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-pause-circle text-warning me-2"></i>
            Disable Listing
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedListing && (
            <>
              <Card className="mb-4 bg-light">
                <Card.Body>
                  <Row>
                    <Col xs={12}>
                      <strong>Listing:</strong> {selectedListing.name}
                    </Col>
                    <Col xs={6}>
                      <strong>Location:</strong> {selectedListing.location}
                    </Col>
                    <Col xs={6}>
                      <strong>Landlord:</strong> {getLandlordName(selectedListing.landlordId)}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Form.Group>
                <Form.Label>
                  <strong>Reason for Disabling</strong>
                  <span className="text-danger ms-1">*</span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Please provide a reason for disabling this listing..."
                  value={disableReason}
                  onChange={(e) => setDisableReason(e.target.value)}
                  isInvalid={showDisableModal && !disableReason.trim()}
                />
                <Form.Control.Feedback type="invalid">
                  Please provide a reason for disabling.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mt-3">
                <Form.Label>Select Reason Category</Form.Label>
                <div className="d-flex flex-wrap gap-2">
                  {[
                    'Fake listing',
                    'Policy violation',
                    'Safety concern',
                    'Maintenance',
                    'Landlord request',
                    'Other'
                  ].map(reason => (
                    <Form.Check
                      key={reason}
                      type="radio"
                      name="disableReason"
                      label={reason}
                      checked={disableReason === reason}
                      onChange={() => setDisableReason(reason)}
                    />
                  ))}
                </div>
              </Form.Group>

              <div className="alert alert-warning mt-3 mb-0">
                <i className="bi bi-exclamation-triangle me-2"></i>
                <strong>Note:</strong> The listing will be hidden from students. The landlord can request reactivation.
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDisableModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="warning" 
            onClick={handleDisable}
            disabled={!disableReason.trim()}
          >
            <i className="bi bi-pause-lg me-1"></i>
            Disable Listing
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Inline Styles */}
      <style>{`
        .listings-manager {
          min-height: 100%;
        }

        .page-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.25rem;
        }

        .page-subtitle {
          color: #64748b;
        }

        .stat-card-mini {
          border: none;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .stat-icon-mini {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          margin-right: 0.75rem;
        }

        .stat-value-mini {
          font-size: 1.5rem;
          font-weight: 700;
          line-height: 1;
        }

        .stat-label-mini {
          font-size: 0.75rem;
          color: #64748b;
        }

        .filter-card {
          border: none;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .listings-table {
          min-width: 800px;
        }

        .listings-table th {
          background: #f8fafc;
          font-weight: 600;
          color: #475569;
          border-bottom: 2px solid #e2e8f0;
          padding: 1rem;
          white-space: nowrap;
        }

        .listings-table td {
          padding: 1rem;
          vertical-align: middle;
          border-bottom: 1px solid #e2e8f0;
        }

        .listing-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .listing-image-placeholder {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          background: #e0e7ff;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6366f1;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
};

export default ListingsManager;
