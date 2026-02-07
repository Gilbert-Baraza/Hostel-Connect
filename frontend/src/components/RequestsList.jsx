import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Button, Badge, Table, Alert, Accordion, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getMyBookings, cancelBooking } from '../api/bookings';

/**
 * RequestsList Component
 * Displays student's viewing and booking requests with status tracking
 * 
 * @param {Object} props
 * @param {Function} props.onCancel - Callback to cancel a request
 */
const RequestsList = ({ onCancel }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalizeStatus = (status) => {
    if (status === 'approved' || status === 'pending' || status === 'rejected') {
      return status;
    }
    if (status === 'completed') return 'approved';
    return 'rejected';
  };

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMyBookings({ limit: 500 });
      const list = response?.data?.bookings || response?.data || [];
      const normalized = list.map((booking) => {
        const hostelId = booking.hostelId?._id || booking.hostelId;
        const hostelName = booking.hostelId?.name || 'Hostel';
        const status = normalizeStatus(booking.status);
        const isApproved = status === 'approved';
        const landlord = booking.hostelId?.landlordId || {};
        return {
          id: booking._id || booking.id,
          hostelId,
          hostelName,
          type: 'booking',
          status,
          date: booking.createdAt || booking.bookingPeriod?.startDate,
          notes: booking.roomId?.roomNumber
            ? `Room ${booking.roomId.roomNumber}`
            : 'Booking request',
          landlordContact: isApproved && landlord?.name ? {
            name: landlord.name,
            phone: landlord.phone,
            email: landlord.email
          } : null,
          rejectionReason: booking.decision?.reason || booking.cancellation?.reason || null
        };
      });
      setRequests(normalized);
    } catch (err) {
      setError(err?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleCancel = async (requestId) => {
    setError(null);
    try {
      await cancelBooking(requestId, { reason: 'Cancelled by student' });
      setRequests(prev => prev.filter(r => r.id !== requestId));
      if (onCancel) onCancel(requestId);
    } catch (err) {
      setError(err?.message || 'Failed to cancel request');
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      default: return 'secondary';
    }
  };

  const getTypeVariant = (type) => {
    return type === 'viewing' ? 'info' : 'primary';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Group requests by status
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const rejectedRequests = requests.filter(r => r.status === 'rejected');

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3 text-muted">Loading requests...</p>
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
        <Button variant="outline-danger" onClick={fetchRequests}>
          <i className="bi bi-arrow-clockwise me-2"></i>
          Try Again
        </Button>
      </Alert>
    );
  }

  return (
    <>
      <Row className="mb-4">
        <Col>
          <h4 className="fw-bold mb-1">
            <i className="bi bi-inbox me-2"></i>
            My Requests
          </h4>
          <p className="text-muted mb-0">
            Track your viewing and booking requests
          </p>
        </Col>
      </Row>

      {/* Summary Cards */}
      <Row className="mb-4 g-3">
        <Col xs={12} sm={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-3">
              <h3 className="fw-bold text-warning mb-0">{pendingRequests.length}</h3>
              <small className="text-muted">Pending</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-3">
              <h3 className="fw-bold text-success mb-0">{approvedRequests.length}</h3>
              <small className="text-muted">Approved</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-3">
              <h3 className="fw-bold text-danger mb-0">{rejectedRequests.length}</h3>
              <small className="text-muted">Rejected</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Privacy Alert */}
      <Row className="mb-4">
        <Col>
          <Alert variant="info" className="border-0 shadow-sm">
            <div className="d-flex align-items-start">
              <i className="bi bi-shield-lock fs-5 me-3 mt-1"></i>
              <div>
                <h6 className="fw-bold mb-1">Contact Privacy</h6>
                <p className="mb-0 small">
                  Landlord contact information is <strong>only revealed after request approval</strong>. 
                  This protects both students and landlords from potential fraud.
                </p>
              </div>
            </div>
          </Alert>
        </Col>
      </Row>

      {/* Requests Accordion */}
      {requests.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <i className="bi bi-inbox text-muted fs-1"></i>
            <h5 className="mt-3 mb-2">No requests yet</h5>
            <p className="text-muted mb-3">
              Browse hostels and submit viewing or booking requests
            </p>
            <Button variant="primary" as={Link} to="/hostels">
              <i className="bi bi-search me-1"></i>
              Browse Hostels
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Accordion defaultActiveKey={['0', '1', '2']} alwaysOpen>
          {/* Pending Requests */}
          <Accordion.Item eventKey="0" className="border-0 shadow-sm mb-3">
            <Accordion.Header>
              <div className="d-flex align-items-center w-100">
                <i className="bi bi-clock-history text-warning me-2"></i>
                <span className="fw-bold">Pending Requests</span>
                <Badge bg="warning" className="ms-auto">{pendingRequests.length}</Badge>
              </div>
            </Accordion.Header>
            <Accordion.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Hostel</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-muted">
                        No pending requests
                      </td>
                    </tr>
                  ) : (
                    pendingRequests.map((req) => (
                      <tr key={req.id}>
                        <td>
                          <Link
                            to={req.hostelId ? `/hostels/${req.hostelId}` : '/hostels'}
                            className="fw-medium text-decoration-none"
                          >
                            {req.hostelName}
                          </Link>
                        </td>
                        <td>
                          <Badge bg={getTypeVariant(req.type)}>
                            {req.type}
                          </Badge>
                        </td>
                        <td>{formatDate(req.date)}</td>
                        <td>
                          <small className="text-muted text-truncate d-block" style={{ maxWidth: '150px' }}>
                            {req.notes}
                          </small>
                        </td>
                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleCancel(req.id)}
                          >
                            Cancel
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Accordion.Body>
          </Accordion.Item>

          {/* Approved Requests */}
          <Accordion.Item eventKey="1" className="border-0 shadow-sm mb-3">
            <Accordion.Header>
              <div className="d-flex align-items-center w-100">
                <i className="bi bi-check-circle text-success me-2"></i>
                <span className="fw-bold">Approved Requests</span>
                <Badge bg="success" className="ms-auto">{approvedRequests.length}</Badge>
              </div>
            </Accordion.Header>
            <Accordion.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Hostel</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Contact</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedRequests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-muted">
                        No approved requests
                      </td>
                    </tr>
                  ) : (
                    approvedRequests.map((req) => (
                      <tr key={req.id}>
                        <td>
                          <Link
                            to={req.hostelId ? `/hostels/${req.hostelId}` : '/hostels'}
                            className="fw-medium text-decoration-none"
                          >
                            {req.hostelName}
                          </Link>
                        </td>
                        <td>
                          <Badge bg={getTypeVariant(req.type)}>
                            {req.type}
                          </Badge>
                        </td>
                        <td>{formatDate(req.date)}</td>
                        <td>
                          {req.landlordContact ? (
                            <div className="small">
                              <div><i className="bi bi-person me-1"></i>{req.landlordContact.name}</div>
                              <div><i className="bi bi-phone me-1"></i>{req.landlordContact.phone}</div>
                            </div>
                          ) : (
                            <Badge bg="secondary">Contact Hidden</Badge>
                          )}
                        </td>
                        <td>
                          <Button
                            variant="outline-success"
                            size="sm"
                            href={`tel:${req.landlordContact?.phone}`}
                            disabled={!req.landlordContact}
                          >
                            <i className="bi bi-telephone me-1"></i>
                            Contact
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Accordion.Body>
          </Accordion.Item>

          {/* Rejected Requests */}
          <Accordion.Item eventKey="2" className="border-0 shadow-sm">
            <Accordion.Header>
              <div className="d-flex align-items-center w-100">
                <i className="bi bi-x-circle text-danger me-2"></i>
                <span className="fw-bold">Rejected Requests</span>
                <Badge bg="danger" className="ms-auto">{rejectedRequests.length}</Badge>
              </div>
            </Accordion.Header>
            <Accordion.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Hostel</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Reason</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rejectedRequests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-muted">
                        No rejected requests
                      </td>
                    </tr>
                  ) : (
                    rejectedRequests.map((req) => (
                      <tr key={req.id}>
                        <td>
                          <Link
                            to={req.hostelId ? `/hostels/${req.hostelId}` : '/hostels'}
                            className="fw-medium text-decoration-none"
                          >
                            {req.hostelName}
                          </Link>
                        </td>
                        <td>
                          <Badge bg={getTypeVariant(req.type)}>
                            {req.type}
                          </Badge>
                        </td>
                        <td>{formatDate(req.date)}</td>
                        <td>
                          <small className="text-danger">{req.rejectionReason}</small>
                        </td>
                        <td>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            as={Link}
                            to="/hostels"
                          >
                            Browse Other
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      )}

      <style>{`
        .accordion-button:not(.collapsed) {
          background: var(--gray-100);
          color: var(--dark);
        }
      `}</style>
    </>
  );
};

export default RequestsList;
