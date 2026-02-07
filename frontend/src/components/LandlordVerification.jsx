import React, { useState } from 'react';
import { Row, Col, Card, Button, Table, Badge, Modal, Form, InputGroup } from 'react-bootstrap';
import { landlords, getLandlordById } from '../data/adminData';

/**
 * LandlordVerification Component
 * 
 * Admin panel for verifying and managing landlord accounts.
 * Primary fraud prevention layer for the platform.
 * 
 * Features:
 * - List of landlords pending verification
 * - Show landlord details: name, contact, hostels count, verification status
 * - Actions: Approve, Reject with notes
 * 
 * @param {Object} props
 * @param {Function} props.onVerificationUpdate - Callback when verification status changes
 */
const LandlordVerification = ({ onVerificationUpdate }) => {
  const [landlordsList, setLandlordsList] = useState(landlords);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedLandlord, setSelectedLandlord] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * Get filtered and searched landlords
   */
  const getFilteredLandlords = () => {
    return landlordsList.filter(landlord => {
      // Status filter
      if (filter !== 'all' && landlord.status !== filter) {
        return false;
      }
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          landlord.name.toLowerCase().includes(search) ||
          landlord.email.toLowerCase().includes(search) ||
          landlord.phone.includes(search)
        );
      }
      return true;
    });
  };

  /**
   * Handle landlord approval
   * @param {string} landlordId 
   */
  const handleApprove = (landlordId) => {
    setLandlordsList(prev => 
      prev.map(l => 
        l.id === landlordId 
          ? { ...l, status: 'verified', verifiedAt: new Date().toISOString() }
          : l
      )
    );
    onVerificationUpdate && onVerificationUpdate(landlordId, 'verified');
  };

  /**
   * Open reject modal
   * @param {Object} landlord 
   */
  const openRejectModal = (landlord) => {
    setSelectedLandlord(landlord);
    setRejectReason('');
    setShowRejectModal(true);
  };

  /**
   * Handle rejection with reason
   */
  const handleReject = () => {
    if (!selectedLandlord) return;
    
    setLandlordsList(prev => 
      prev.map(l => 
        l.id === selectedLandlord.id 
          ? { ...l, status: 'rejected', rejectionReason: rejectReason }
          : l
      )
    );
    onVerificationUpdate && onVerificationUpdate(selectedLandlord.id, 'rejected');
    setShowRejectModal(false);
    setSelectedLandlord(null);
    setRejectReason('');
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
      default: return 'secondary';
    }
  };

  /**
   * Format date
   * @param {string} dateString 
   * @returns {string}
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredLandlords = getFilteredLandlords();
  const pendingCount = landlordsList.filter(l => l.status === 'pending').length;

  return (
    <div className="landlord-verification">
      {/* Page Header */}
      <div className="page-header mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
          <div>
            <h1 className="page-title">
              <i className="bi bi-person-check me-2"></i>
              Landlord Verification
            </h1>
            <p className="page-subtitle mb-0">
              Review and verify landlord accounts to prevent fraud
            </p>
          </div>
          {pendingCount > 0 && (
            <Badge bg="warning" className="pending-badge">
              <i className="bi bi-clock me-1"></i>
              {pendingCount} Pending Verification{pendingCount > 1 ? 's' : ''}
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
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col xs={12} md={8}>
              <div className="d-flex flex-wrap gap-2">
                {['all', 'pending', 'verified', 'rejected'].map(status => (
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

      {/* Landlords Table */}
      <Card>
        <Card.Header className="d-flex flex-wrap justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="bi bi-list-ul me-2"></i>
            Landlords ({filteredLandlords.length})
          </h5>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="landlord-table mb-0">
              <thead>
                <tr>
                  <th>Landlord</th>
                  <th>Contact</th>
                  <th>Hostels</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLandlords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5">
                      <i className="bi bi-inbox fs-1 text-muted d-block mb-2"></i>
                      <p className="text-muted mb-0">No landlords found</p>
                    </td>
                  </tr>
                ) : (
                  filteredLandlords.map(landlord => (
                    <tr key={landlord.id}>
                      <td>
                        <div className="landlord-info">
                          <div className="landlord-avatar">
                            <i className="bi bi-person-fill"></i>
                          </div>
                          <div>
                            <div className="fw-bold">{landlord.name}</div>
                            <small className="text-muted">ID: {landlord.id}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>{landlord.email}</div>
                        <small className="text-muted">{landlord.phone}</small>
                      </td>
                      <td>
                        <Badge bg="secondary">
                          {landlord.hostelsCount} hostel{landlord.hostelsCount !== 1 ? 's' : ''}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={getStatusBadge(landlord.status)}>
                          {landlord.status}
                        </Badge>
                        {landlord.status === 'rejected' && landlord.rejectionReason && (
                          <div className="mt-1">
                            <small className="text-danger" title={landlord.rejectionReason}>
                              <i className="bi bi-info-circle me-1"></i>
                              Reason provided
                            </small>
                          </div>
                        )}
                      </td>
                      <td>{formatDate(landlord.createdAt)}</td>
                      <td>
                        <div className="d-flex gap-2">
                          {landlord.status === 'pending' ? (
                            <>
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleApprove(landlord.id)}
                                title="Approve Landlord"
                              >
                                <i className="bi bi-check-lg"></i>
                                Approve
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => openRejectModal(landlord)}
                                title="Reject Landlord"
                              >
                                <i className="bi bi-x-lg"></i>
                                Reject
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => openRejectModal(landlord)}
                              disabled={landlord.status === 'rejected'}
                            >
                              <i className="bi bi-eye me-1"></i>
                              View Details
                            </Button>
                          )}
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

      {/* Reject Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-x-circle text-danger me-2"></i>
            Reject Landlord Verification
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLandlord && (
            <>
              <Card className="mb-4 bg-light">
                <Card.Body>
                  <Row>
                    <Col xs={6}>
                      <strong>Name:</strong> {selectedLandlord.name}
                    </Col>
                    <Col xs={6}>
                      <strong>Email:</strong> {selectedLandlord.email}
                    </Col>
                    <Col xs={6}>
                      <strong>Phone:</strong> {selectedLandlord.phone}
                    </Col>
                    <Col xs={6}>
                      <strong>ID Number:</strong> {selectedLandlord.idNumber}
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
                  placeholder="Please provide a clear reason for rejection. This will be shown to the landlord."
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
                <strong>Warning:</strong> The landlord will be notified of this rejection and will need to resubmit their verification documents.
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
            Reject Verification
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Inline Styles */}
      <style>{`
        .landlord-verification {
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

        .landlord-table {
          min-width: 800px;
        }

        .landlord-table th {
          background: #f8fafc;
          font-weight: 600;
          color: #475569;
          border-bottom: 2px solid #e2e8f0;
          padding: 1rem;
          white-space: nowrap;
        }

        .landlord-table td {
          padding: 1rem;
          vertical-align: middle;
          border-bottom: 1px solid #e2e8f0;
        }

        .landlord-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .landlord-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e0e7ff;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4f46e5;
        }
      `}</style>
    </div>
  );
};

export default LandlordVerification;
