import React, { useState } from 'react';
import { Row, Col, Card, Button, Table, Badge, Modal, Form, InputGroup, Image } from 'react-bootstrap';
import { hostels, getLandlordById } from '../data/adminData';

/**
 * HostelVerification Component
 * 
 * Admin panel for verifying and managing hostel listings.
 * Ensures all listings meet platform standards before going live.
 * 
 * Features:
 * - List of hostels pending approval
 * - Show hostel details: name, location, landlord, amenities, images
 * - Actions: Approve, Reject with notes
 * - Verification badge updates
 * 
 * @param {Object} props
 * @param {Function} props.onVerificationUpdate - Callback when verification status changes
 */
const HostelVerification = ({ onVerificationUpdate }) => {
  const [hostelsList, setHostelsList] = useState(hostels);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * Get filtered and searched hostels
   */
  const getFilteredHostels = () => {
    return hostelsList.filter(hostel => {
      // Status filter
      if (filter !== 'all' && hostel.status !== filter) {
        return false;
      }
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          hostel.name.toLowerCase().includes(search) ||
          hostel.location.toLowerCase().includes(search)
        );
      }
      return true;
    });
  };

  /**
   * Handle hostel approval
   * @param {string} hostelId 
   */
  const handleApprove = (hostelId) => {
    setHostelsList(prev => 
      prev.map(h => 
        h.id === hostelId 
          ? { ...h, status: 'verified' }
          : h
      )
    );
    onVerificationUpdate && onVerificationUpdate(hostelId, 'verified');
  };

  /**
   * Open reject modal
   * @param {Object} hostel 
   */
  const openRejectModal = (hostel) => {
    setSelectedHostel(hostel);
    setRejectReason('');
    setShowRejectModal(true);
  };

  /**
   * Handle rejection with reason
   */
  const handleReject = () => {
    if (!selectedHostel) return;
    
    setHostelsList(prev => 
      prev.map(h => 
        h.id === selectedHostel.id 
          ? { ...h, status: 'rejected', rejectionReason: rejectReason }
          : h
      )
    );
    onVerificationUpdate && onVerificationUpdate(selectedHostel.id, 'rejected');
    setShowRejectModal(false);
    setSelectedHostel(null);
    setRejectReason('');
  };

  /**
   * View hostel details
   * @param {Object} hostel 
   */
  const viewHostelDetails = (hostel) => {
    setSelectedHostel(hostel);
    setShowViewModal(true);
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
   * Get landlord name by hostel
   * @param {string} landlordId 
   * @returns {string}
   */
  const getLandlordName = (landlordId) => {
    const landlord = getLandlordById(landlordId);
    return landlord ? landlord.name : 'Unknown';
  };

  const filteredHostels = getFilteredHostels();
  const pendingCount = hostelsList.filter(h => h.status === 'pending').length;

  return (
    <div className="hostel-verification">
      {/* Page Header */}
      <div className="page-header mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
          <div>
            <h1 className="page-title">
              <i className="bi bi-building-check me-2"></i>
              Hostel Verification
            </h1>
            <p className="page-subtitle mb-0">
              Review and approve hostel listings before they go live
            </p>
          </div>
          {pendingCount > 0 && (
            <Badge bg="warning" className="pending-badge">
              <i className="bi bi-clock me-1"></i>
              {pendingCount} Pending Review{pendingCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>

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
            <Col xs={12} md={8}>
              <div className="d-flex flex-wrap gap-2">
                {['all', 'pending', 'verified', 'rejected', 'disabled'].map(status => (
                  <Button
                    key={status}
                    variant={filter === status ? 'primary' : 'outline-secondary'}
                    size="sm"
                    onClick={() => setFilter(status)}
                  >
                    {status === 'all' ? 'All' :
                      status === 'pending' ? 'Pending' :
                      status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Hostels Grid */}
      <Row>
        {filteredHostels.length === 0 ? (
          <Col xs={12}>
            <Card className="text-center py-5">
              <Card.Body>
                <i className="bi bi-inbox fs-1 text-muted d-block mb-3"></i>
                <h5 className="text-muted">No hostels found</h5>
                <p className="text-muted">Try adjusting your filters or search term</p>
              </Card.Body>
            </Card>
          </Col>
        ) : (
          filteredHostels.map(hostel => (
            <Col key={hostel.id} xs={12} lg={6} xl={4} className="mb-4">
              <Card className="hostel-card h-100">
                {/* Hostel Image Placeholder */}
                <div className="hostel-image">
                  <div className="image-placeholder">
                    <i className="bi bi-building"></i>
                  </div>
                  <Badge 
                    bg={getStatusBadge(hostel.status)}
                    className="position-absolute top-0 end-0 m-2"
                  >
                    {hostel.status}
                  </Badge>
                  <Badge 
                    bg={getTypeBadge(hostel.type)}
                    className="position-absolute top-0 start-0 m-2"
                  >
                    {hostel.type}
                  </Badge>
                </div>

                <Card.Body>
                  <h5 className="card-title">{hostel.name}</h5>
                  <p className="card-text text-muted mb-2">
                    <i className="bi bi-geo-alt me-1"></i>
                    {hostel.location}
                  </p>
                  <p className="card-text small">
                    <i className="bi bi-person me-1"></i>
                    <strong>Landlord:</strong> {getLandlordName(hostel.landlordId)}
                  </p>

                  {/* Amenities Preview */}
                  <div className="amenities-preview mb-3">
                    {hostel.amenities.slice(0, 4).map((amenity, idx) => (
                      <Badge key={idx} bg="light" text="dark" className="me-1 mb-1">
                        {amenity}
                      </Badge>
                    ))}
                    {hostel.amenities.length > 4 && (
                      <Badge bg="light" text="dark" className="mb-1">
                        +{hostel.amenities.length - 4} more
                      </Badge>
                    )}
                  </div>

                  {/* Price and Capacity */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <strong className="text-primary">KSh {hostel.price.toLocaleString()}</strong>
                      <small className="text-muted">/month</small>
                    </div>
                    <div>
                      <small className="text-muted">
                        {hostel.availableRooms} / {hostel.capacity} rooms
                      </small>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="flex-grow-1"
                      onClick={() => viewHostelDetails(hostel)}
                    >
                      <i className="bi bi-eye me-1"></i>
                      View
                    </Button>
                    {hostel.status === 'pending' && (
                      <>
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => handleApprove(hostel.id)}
                        >
                          <i className="bi bi-check-lg"></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => openRejectModal(hostel)}
                        >
                          <i className="bi bi-x-lg"></i>
                        </Button>
                      </>
                    )}
                  </div>
                </Card.Body>

                {hostel.status === 'rejected' && hostel.rejectionReason && (
                  <Card.Footer className="bg-danger text-white">
                    <small>
                      <i className="bi bi-info-circle me-1"></i>
                      Rejected: {hostel.rejectionReason}
                    </small>
                  </Card.Footer>
                )}
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* View Details Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-building me-2"></i>
            Hostel Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedHostel && (
            <Row>
              <Col md={5}>
                {/* Image Gallery Placeholder */}
                <div className="detail-image-placeholder mb-3">
                  <i className="bi bi-image"></i>
                  <span>{selectedHostel.images?.length || 0} images</span>
                </div>
                
                {/* Landlord Info */}
                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Landlord Information</h6>
                  </Card.Header>
                  <Card.Body>
                    <p className="mb-1"><strong>Name:</strong> {getLandlordName(selectedHostel.landlordId)}</p>
                    <p className="mb-0">
                      <a href="#landlord-profile" className="btn btn-sm btn-outline-primary">
                        View Landlord Profile
                      </a>
                    </p>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={7}>
                <h4>{selectedHostel.name}</h4>
                <p className="text-muted">
                  <i className="bi bi-geo-alt me-1"></i>
                  {selectedHostel.location}
                </p>

                <div className="mb-3">
                  <Badge bg={getStatusBadge(selectedHostel.status)} className="me-2">
                    {selectedHostel.status}
                  </Badge>
                  <Badge bg={getTypeBadge(selectedHostel.type)}>
                    {selectedHostel.type} hostel
                  </Badge>
                </div>

                <h5 className="text-primary">KSh {selectedHostel.price.toLocaleString()}/month</h5>

                <hr />

                <h6>Description</h6>
                <p>{selectedHostel.description || 'No description provided.'}</p>

                <h6>Amenities</h6>
                <div className="d-flex flex-wrap gap-1 mb-3">
                  {selectedHostel.amenities.map((amenity, idx) => (
                    <Badge key={idx} bg="primary" variant="light">
                      <i className="bi bi-check-circle me-1"></i>
                      {amenity}
                    </Badge>
                  ))}
                </div>

                <Row>
                  <Col xs={6}>
                    <p className="mb-1"><strong>Capacity:</strong> {selectedHostel.capacity} beds</p>
                  </Col>
                  <Col xs={6}>
                    <p className="mb-1"><strong>Available:</strong> {selectedHostel.availableRooms} rooms</p>
                  </Col>
                </Row>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
          {selectedHostel?.status === 'pending' && (
            <>
              <Button 
                variant="danger" 
                onClick={() => {
                  setShowViewModal(false);
                  openRejectModal(selectedHostel);
                }}
              >
                <i className="bi bi-x-lg me-1"></i>
                Reject
              </Button>
              <Button variant="success" onClick={() => {
                handleApprove(selectedHostel.id);
                setShowViewModal(false);
              }}>
                <i className="bi bi-check-lg me-1"></i>
                Approve
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      {/* Reject Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-x-circle text-danger me-2"></i>
            Reject Hostel Listing
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedHostel && (
            <>
              <Card className="mb-4 bg-light">
                <Card.Body>
                  <Row>
                    <Col xs={12}>
                      <strong>Hostel:</strong> {selectedHostel.name}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Form.Group>
                <Form.Label>
                  <strong>Reason for Rejection</strong>
                  <span className="text-danger ms-1">*</span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Please provide a clear reason for rejection. Common reasons include:
- Photos don't match the property
- Inaccurate pricing information
- Missing required amenities
- Policy violations"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  isInvalid={showRejectModal && !rejectReason.trim()}
                />
                <Form.Control.Feedback type="invalid">
                  Please provide a rejection reason.
                </Form.Control.Feedback>
              </Form.Group>

              <div className="alert alert-warning mt-3 mb-0">
                <i className="bi bi-exclamation-triangle me-2"></i>
                <strong>Note:</strong> The landlord will be notified and can resubmit the listing with corrections.
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleReject}
            disabled={!rejectReason.trim()}
          >
            <i className="bi bi-x-circle me-1"></i>
            Reject Listing
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Inline Styles */}
      <style>{`
        .hostel-verification {
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

        .pending-badge {
          font-size: 0.875rem;
          padding: 0.5rem 1rem;
        }

        .filter-card {
          border: none;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .hostel-card {
          border: none;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .hostel-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        }

        .hostel-image {
          position: relative;
          height: 160px;
          overflow: hidden;
          border-radius: 12px 12px 0 0;
        }

        .image-placeholder {
          height: 100%;
          background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #6366f1;
        }

        .image-placeholder i {
          font-size: 3rem;
          margin-bottom: 0.5rem;
        }

        .amenities-preview {
          min-height: 32px;
        }

        .detail-image-placeholder {
          height: 250px;
          background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #6366f1;
        }

        .detail-image-placeholder i {
          font-size: 3rem;
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default HostelVerification;
