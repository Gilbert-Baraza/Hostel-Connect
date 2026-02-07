import React, { useState } from 'react';
import { Row, Col, Card, Button, Table, Badge, Modal, Form, InputGroup } from 'react-bootstrap';
import { reports, getHostelById } from '../data/adminData';

/**
 * ReportsManager Component
 * 
 * Admin panel for managing user-reported issues and fraud flags.
 * Essential for maintaining platform trust and safety.
 * 
 * Features:
 * - View reports submitted by students
 * - Show hostel, reason, date, and reporter
 * - Actions: Review, Mark resolved, Disable listing
 * 
 * @param {Object} props
 * @param {Function} props.onReportUpdate - Callback when report status changes
 */
const ReportsManager = ({ onReportUpdate }) => {
  const [reportsList, setReportsList] = useState(reports);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * Get filtered and searched reports
   */
  const getFilteredReports = () => {
    return reportsList.filter(report => {
      // Status filter
      if (filter !== 'all' && report.status !== filter) {
        return false;
      }
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          report.hostelName.toLowerCase().includes(search) ||
          report.reporterName.toLowerCase().includes(search) ||
          report.reason.toLowerCase().includes(search)
        );
      }
      return true;
    });
  };

  /**
   * Open review modal
   * @param {Object} report 
   */
  const openReviewModal = (report) => {
    setSelectedReport(report);
    setAdminNotes(report.adminNotes || '');
    setShowReviewModal(true);
  };

  /**
   * Mark report as reviewed
   */
  const handleReview = () => {
    if (!selectedReport) return;
    
    setReportsList(prev => 
      prev.map(r => 
        r.id === selectedReport.id 
          ? { ...r, status: 'reviewed', adminNotes }
          : r
      )
    );
    onReportUpdate && onReportUpdate(selectedReport.id, 'reviewed');
    setShowReviewModal(false);
    setSelectedReport(null);
    setAdminNotes('');
  };

  /**
   * Open disable modal
   * @param {Object} report 
   */
  const openDisableModal = (report) => {
    setSelectedReport(report);
    setShowDisableModal(true);
  };

  /**
   * Mark report as resolved and disable listing
   */
  const handleResolveAndDisable = () => {
    if (!selectedReport) return;
    
    setReportsList(prev => 
      prev.map(r => 
        r.id === selectedReport.id 
          ? { ...r, status: 'resolved', adminNotes: `Listing disabled. ${adminNotes}` }
          : r
      )
    );
    onReportUpdate && onReportUpdate(selectedReport.id, 'resolved');
    setShowDisableModal(false);
    setSelectedReport(null);
    setAdminNotes('');
  };

  /**
   * Mark report as resolved without disabling
   */
  const handleResolve = () => {
    if (!selectedReport) return;
    
    setReportsList(prev => 
      prev.map(r => 
        r.id === selectedReport.id 
          ? { ...r, status: 'resolved', adminNotes }
          : r
      )
    );
    onReportUpdate && onReportUpdate(selectedReport.id, 'resolved');
    setShowReviewModal(false);
    setSelectedReport(null);
    setAdminNotes('');
  };

  /**
   * Get status badge variant
   * @param {string} status 
   * @returns {string}
   */
  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved': return 'success';
      case 'reviewed': return 'info';
      case 'pending': return 'warning';
      default: return 'secondary';
    }
  };

  /**
   * Get reason label
   * @param {string} reason 
   * @returns {string}
   */
  const getReasonLabel = (reason) => {
    const labels = {
      'fake_listing': 'Fake or Misleading Listing',
      'pricing_issue': 'Pricing or Hidden Fees',
      'harassment': 'Harassment or Misconduct',
      'safety_concern': 'Safety Concern',
      'scam': 'Suspected Scam',
      'property_condition': 'Property Not as Described',
      'other': 'Other'
    };
    return labels[reason] || reason;
  };

  /**
   * Get reason badge variant
   * @param {string} reason 
   * @returns {string}
   */
  const getReasonBadge = (reason) => {
    switch (reason) {
      case 'fake_listing': return 'danger';
      case 'scam': return 'danger';
      case 'harassment': return 'danger';
      case 'safety_concern': return 'warning';
      case 'pricing_issue': return 'info';
      default: return 'secondary';
    }
  };

  /**
   * Format date
   * @param {string} dateString 
   * @returns {string}
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredReports = getFilteredReports();
  const stats = {
    total: reportsList.length,
    pending: reportsList.filter(r => r.status === 'pending').length,
    reviewed: reportsList.filter(r => r.status === 'reviewed').length,
    resolved: reportsList.filter(r => r.status === 'resolved').length
  };

  return (
    <div className="reports-manager">
      {/* Page Header */}
      <div className="page-header mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
          <div>
            <h1 className="page-title">
              <i className="bi bi-flag me-2"></i>
              Reports & Fraud Flags
            </h1>
            <p className="page-subtitle mb-0">
              Review and resolve user-reported issues to maintain platform trust
            </p>
          </div>
          {stats.pending > 0 && (
            <Badge bg="warning" className="pending-badge">
              <i className="bi bi-exclamation-circle me-1"></i>
              {stats.pending} Pending Report{stats.pending > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col xs={6} md={3}>
          <Card className="stat-card-mini">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-icon-mini bg-primary">
                <i className="bi bi-flag"></i>
              </div>
              <div>
                <div className="stat-value-mini">{stats.total}</div>
                <div className="stat-label-mini">Total Reports</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="stat-card-mini">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-icon-mini bg-warning">
                <i className="bi bi-clock"></i>
              </div>
              <div>
                <div className="stat-value-mini">{stats.pending}</div>
                <div className="stat-label-mini">Pending</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="stat-card-mini">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-icon-mini bg-info">
                <i className="bi bi-eye"></i>
              </div>
              <div>
                <div className="stat-value-mini">{stats.reviewed}</div>
                <div className="stat-label-mini">Reviewed</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="stat-card-mini">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-icon-mini bg-success">
                <i className="bi bi-check-circle"></i>
              </div>
              <div>
                <div className="stat-value-mini">{stats.resolved}</div>
                <div className="stat-label-mini">Resolved</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4 filter-card">
        <Card.Body>
          <Row className="g-3">
            <Col xs={12} md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search by hostel, reporter, or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col xs={12} md={6}>
              <div className="d-flex flex-wrap gap-2">
                {['all', 'pending', 'reviewed', 'resolved'].map(status => (
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

      {/* Reports Table */}
      <Card>
        <Card.Header className="d-flex flex-wrap justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="bi bi-list-ul me-2"></i>
            Reports ({filteredReports.length})
          </h5>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="reports-table mb-0">
              <thead>
                <tr>
                  <th>Reported Hostel</th>
                  <th>Reason</th>
                  <th>Reporter</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5">
                      <i className="bi bi-inbox fs-1 text-muted d-block mb-2"></i>
                      <p className="text-muted mb-0">No reports found</p>
                    </td>
                  </tr>
                ) : (
                  filteredReports.map(report => (
                    <tr key={report.id}>
                      <td>
                        <div className="fw-bold">{report.hostelName}</div>
                        <small className="text-muted">ID: {report.hostelId}</small>
                      </td>
                      <td>
                        <Badge bg={getReasonBadge(report.reason)}>
                          {getReasonLabel(report.reason)}
                        </Badge>
                      </td>
                      <td>
                        <div>{report.reporterName}</div>
                        <small className="text-muted">{report.reporterId}</small>
                      </td>
                      <td>{formatDate(report.createdAt)}</td>
                      <td>
                        <Badge bg={getStatusBadge(report.status)}>
                          {report.status}
                        </Badge>
                        {report.adminNotes && (
                          <div className="mt-1">
                            <small className="text-muted">
                              <i className="bi bi-sticky me-1"></i>
                              Notes
                            </small>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => openReviewModal(report)}
                            title="Review Report"
                          >
                            <i className="bi bi-eye me-1"></i>
                            Review
                          </Button>
                          {report.status !== 'resolved' && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => openDisableModal(report)}
                              title="Disable Listing & Resolve"
                            >
                              <i className="bi bi-building-x"></i>
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

      {/* Review Modal */}
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-eye text-primary me-2"></i>
            Review Report
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReport && (
            <>
              <Card className="mb-4 bg-light">
                <Card.Header>
                  <h6 className="mb-0">Report Details</h6>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col xs={6}>
                      <strong>Hostel:</strong> {selectedReport.hostelName}
                    </Col>
                    <Col xs={6}>
                      <strong>Report ID:</strong> {selectedReport.id}
                    </Col>
                    <Col xs={6}>
                      <strong>Reason:</strong> <Badge bg={getReasonBadge(selectedReport.reason)}>{getReasonLabel(selectedReport.reason)}</Badge>
                    </Col>
                    <Col xs={6}>
                      <strong>Status:</strong> <Badge bg={getStatusBadge(selectedReport.status)}>{selectedReport.status}</Badge>
                    </Col>
                    <Col xs={12}>
                      <strong>Description:</strong>
                      <p className="mt-1 mb-0">{selectedReport.description}</p>
                    </Col>
                    <Col xs={6}>
                      <strong>Reported By:</strong> {selectedReport.reporterName}
                    </Col>
                    <Col xs={6}>
                      <strong>Date:</strong> {formatDate(selectedReport.createdAt)}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Form.Group>
                <Form.Label>
                  <strong>Admin Notes</strong>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Add notes about your review..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </Form.Group>

              <div className="alert alert-info mt-3 mb-0">
                <i className="bi bi-info-circle me-2"></i>
                <strong>Actions:</strong> You can mark this report as reviewed or resolved. To disable the listing, use the "Disable Listing" button.
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
            Close
          </Button>
          <Button variant="outline-primary" onClick={handleReview}>
            <i className="bi bi-eye me-1"></i>
            Mark as Reviewed
          </Button>
          <Button variant="success" onClick={handleResolve}>
            <i className="bi bi-check-circle me-1"></i>
            Mark as Resolved
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Disable Modal */}
      <Modal show={showDisableModal} onHide={() => setShowDisableModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-building-x text-danger me-2"></i>
            Disable Listing & Resolve Report
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReport && (
            <>
              <Card className="mb-4 bg-danger bg-opacity-10">
                <Card.Body>
                  <h6 className="text-danger">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    You are about to disable this listing
                  </h6>
                  <p className="mb-0">
                    <strong>Hostel:</strong> {selectedReport.hostelName}<br />
                    <strong>Reason:</strong> {getReasonLabel(selectedReport.reason)}
                  </p>
                </Card.Body>
              </Card>

              <Form.Group>
                <Form.Label>
                  <strong>Admin Notes (Required)</strong>
                  <span className="text-danger ms-1">*</span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Document the reason for disabling this listing..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  isInvalid={showDisableModal && !adminNotes.trim()}
                />
                <Form.Control.Feedback type="invalid">
                  Please provide admin notes.
                </Form.Control.Feedback>
              </Form.Group>

              <div className="alert alert-warning mt-3 mb-0">
                <i className="bi bi-exclamation-triangle me-2"></i>
                <strong>Warning:</strong> This action will disable the listing and mark all related reports as resolved.
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDisableModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleResolveAndDisable}
            disabled={!adminNotes.trim()}
          >
            <i className="bi bi-building-x me-1"></i>
            Disable & Resolve
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Inline Styles */}
      <style>{`
        .reports-manager {
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

        .reports-table {
          min-width: 900px;
        }

        .reports-table th {
          background: #f8fafc;
          font-weight: 600;
          color: #475569;
          border-bottom: 2px solid #e2e8f0;
          padding: 1rem;
          white-space: nowrap;
        }

        .reports-table td {
          padding: 1rem;
          vertical-align: middle;
          border-bottom: 1px solid #e2e8f0;
        }
      `}</style>
    </div>
  );
};

export default ReportsManager;
