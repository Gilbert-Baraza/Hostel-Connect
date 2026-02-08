import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Container, Row, Col, Button, Breadcrumb, Card, Badge, Alert, Spinner, Toast } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import DashboardSidebar from '../components/DashboardSidebar';
import OverviewCards from '../components/OverviewCards';
import LandlordHostelList from '../components/LandlordHostelList';
import RoomManager from '../components/RoomManager';
import ProfileSection from '../components/ProfileSection';
import { useAuth } from '../auth/AuthContext';
import { getHostels, createHostel, updateHostel, deleteHostel } from '../api/hostels';
import { getRoomsByHostel, createRoom, updateRoom, deleteRoom, toggleRoomAvailability } from '../api/rooms';
import { getHostelBookings, decideBooking } from '../api/bookings';

/**
 * LandlordDashboard Main Page
 * Comprehensive dashboard for landlords to manage their properties
 */
const LandlordDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Determine current section from URL
  const getCurrentSection = () => {
    const path = location.pathname;
    if (path === '/landlord/dashboard' || path === '/landlord/dashboard/') {
      return 'overview';
    }
    if (path.includes('/hostels')) return 'hostels';
    if (path.includes('/rooms')) return 'rooms';
    if (path.includes('/requests')) return 'requests';
    if (path.includes('/profile')) return 'profile';
    return 'overview';
  };

  const currentSection = getCurrentSection();

  const [hostels, setHostels] = useState([]);
  const [loadingHostels, setLoadingHostels] = useState(true);
  const [hostelError, setHostelError] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [requestsError, setRequestsError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
  const roomsLoadedRef = useRef(new Set());

  useEffect(() => {
    const fetchHostels = async () => {
      setLoadingHostels(true);
      setHostelError(null);
      try {
        const response = await getHostels();
        const results = response?.data?.hostels || [];
        setHostels(results);
      } catch (error) {
        setHostelError(error.message || 'Failed to load hostels');
      } finally {
        setLoadingHostels(false);
      }
    };

    fetchHostels();
  }, []);

  useEffect(() => {
    if (currentSection !== 'rooms') return;
    if (!hostels.length) return;

    const hostelsToFetch = hostels.filter((hostel) => {
      const hostelId = hostel?._id || hostel?.id;
      return hostelId && !roomsLoadedRef.current.has(hostelId);
    });

    if (hostelsToFetch.length === 0) return;

    let cancelled = false;

    const fetchRooms = async () => {
      try {
        const responses = await Promise.all(
          hostelsToFetch.map((hostel) => getRoomsByHostel(hostel._id || hostel.id))
        );

        if (cancelled) return;

        const roomsByHostelId = new Map();
        responses.forEach((response, index) => {
          const hostelId = hostelsToFetch[index]?._id || hostelsToFetch[index]?.id;
          const rooms = response?.data?.rooms || response?.data?.data?.rooms || [];
          if (hostelId) {
            roomsByHostelId.set(hostelId, rooms);
            roomsLoadedRef.current.add(hostelId);
          }
        });

        setHostels((prev) => prev.map((hostel) => {
          const hostelId = hostel?._id || hostel?.id;
          if (!roomsByHostelId.has(hostelId)) return hostel;
          return { ...hostel, rooms: roomsByHostelId.get(hostelId) };
        }));
      } catch (error) {
        console.error('Failed to load rooms:', error);
      }
    };

    fetchRooms();

    return () => {
      cancelled = true;
    };
  }, [currentSection, hostels]);

  // Calculate statistics
  const stats = useMemo(() => ({
    totalHostels: hostels.length,
    totalRooms: hostels.reduce((acc, h) => acc + (h.rooms?.length || 0), 0),
    availableRooms: hostels.reduce(
      (acc, h) => acc + (h.rooms?.filter(r => r.isActive !== false && r.isAvailable === true).length || 0),
      0
    ),
    occupiedRooms: hostels.reduce(
      (acc, h) => acc + (h.rooms?.filter(r => r.isActive !== false && r.isAvailable === false).length || 0),
      0
    ),
    pendingVerification: hostels.filter(h => h.verificationStatus === 'pending').length,
    verifiedHostels: hostels.filter(h => h.verificationStatus === 'approved').length
  }), [hostels]);

  // Fetch bookings for all hostels
  useEffect(() => {
    if (currentSection !== 'requests') return;
    if (!hostels.length) return;

    let cancelled = false;
    setLoadingRequests(true);
    setRequestsError(null);

    const fetchAllBookings = async () => {
      try {
        const allBookings = [];
        for (const hostel of hostels) {
          const hostelId = hostel._id || hostel.id;
          if (!hostelId) continue;
          try {
            const response = await getHostelBookings(hostelId);
            const bookings = response?.data?.bookings || [];
            allBookings.push(...bookings.map(booking => ({
              ...booking,
              hostelName: hostel.name
            })));
          } catch (err) {
            console.error(`Failed to fetch bookings for hostel ${hostelId}:`, err);
          }
        }

        if (cancelled) return;
        setRequests(allBookings);
      } catch (error) {
        if (!cancelled) {
          setRequestsError(error.message || 'Failed to load requests');
        }
      } finally {
        if (!cancelled) {
          setLoadingRequests(false);
        }
      }
    };

    fetchAllBookings();

    return () => {
      cancelled = true;
    };
  }, [currentSection, hostels]);

  // Handle booking decision (approve/reject)
  const handleDecision = async (bookingId, action, reason = '') => {
    try {
      await decideBooking(bookingId, { action, reason });
      // Update the requests list
      setRequests(prev => prev.map(req => 
        req._id === bookingId ? { ...req, status: action === 'approve' ? 'approved' : 'rejected' } : req
      ));
      // Show success toast
      setToast({
        show: true,
        message: `Booking ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
        variant: 'success'
      });
    } catch (error) {
      console.error('Failed to process decision:', error);
      // Show error toast
      setToast({
        show: true,
        message: error.message || 'Failed to process decision',
        variant: 'danger'
      });
      throw error;
    }
  };

  // Hostel management handlers
  const handleAddHostel = async (payload) => {
    const response = await createHostel(payload);
    const newHostel = response?.data?.hostel;
    if (newHostel) {
      setHostels(prev => [newHostel, ...prev]);
    }
  };

  const handleEditHostel = async (hostel, payload) => {
    const hostelId = hostel?._id || hostel?.id;
    if (!hostelId) return;
    const response = await updateHostel(hostelId, payload);
    const updated = response?.data?.hostel;
    if (updated) {
      setHostels(prev => prev.map(h => (h._id || h.id) === hostelId ? updated : h));
    }
  };

  const handleDeleteHostel = async (hostelId) => {
    await deleteHostel(hostelId);
    setHostels(prev => prev.filter(h => (h._id || h.id) !== hostelId));
  };

  const handleToggleHostelStatus = async (hostelId, hostel) => {
    const current = hostel || hostels.find(h => (h._id || h.id) === hostelId);
    if (!current) return;
    const response = await updateHostel(hostelId, { isActive: !current.isActive });
    const updated = response?.data?.hostel;
    if (updated) {
      setHostels(prev => prev.map(h => (h._id || h.id) === hostelId ? updated : h));
    }
  };

  // Room management handlers
  const handleAddRoom = async (hostelId, payload) => {
    const response = await createRoom(hostelId, payload);
    const newRoom = response?.data?.room;
    if (!newRoom) return;

    setHostels(prev => prev.map(h => {
      if ((h._id || h.id) === hostelId) {
        return { ...h, rooms: [...(h.rooms || []), newRoom] };
      }
      return h;
    }));
  };

  const handleUpdateRoom = async (hostelId, roomId, payload) => {
    const response = await updateRoom(roomId, payload);
    const updatedRoom = response?.data?.room;
    if (!updatedRoom) return;

    setHostels(prev => prev.map(h => {
      if ((h._id || h.id) === hostelId) {
        return {
          ...h,
          rooms: (h.rooms || []).map(r => (r._id || r.id) === roomId ? updatedRoom : r)
        };
      }
      return h;
    }));
  };

  const handleDeleteRoom = async (hostelId, roomId) => {
    await deleteRoom(roomId);
    setHostels(prev => prev.map(h => {
      if ((h._id || h.id) === hostelId) {
        return { ...h, rooms: (h.rooms || []).filter(r => (r._id || r.id) !== roomId) };
      }
      return h;
    }));
  };

  const handleToggleRoomAvailability = async (hostelId, roomId, isAvailable) => {
    const response = await toggleRoomAvailability(roomId, !isAvailable);
    const updatedRoom = response?.data?.room;
    if (!updatedRoom) return;

    setHostels(prev => prev.map(h => {
      if ((h._id || h.id) === hostelId) {
        return {
          ...h,
          rooms: (h.rooms || []).map(r => (r._id || r.id) === roomId ? updatedRoom : r)
        };
      }
      return h;
    }));
  };

  const renderSection = () => {
    switch (currentSection) {
      case 'overview':
        return (
          <>
            <Row className="mb-4">
              <Col>
                <h4 className="fw-bold mb-1">Dashboard Overview</h4>
                <p className="text-muted mb-0">Welcome back, {user?.name || user?.email}!</p>
              </Col>
            </Row>

            <OverviewCards stats={stats} />

            {/* Recent Activity Placeholder */}
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white">
                <h5 className="mb-0 fw-bold">
                  <i className="bi bi-clock-history me-2"></i>
                  Recent Activity
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="activity-item d-flex align-items-center mb-3">
                  <div className="activity-icon bg-success-light me-3">
                    <i className="bi bi-plus-circle text-success"></i>
                  </div>
                  <div>
                    <strong>New hostel added</strong>
                    <p className="mb-0 text-muted small">Green Valley Hostel was added successfully</p>
                  </div>
                  <small className="text-muted ms-auto">2 hours ago</small>
                </div>
                <div className="activity-item d-flex align-items-center mb-3">
                  <div className="activity-icon bg-info-light me-3">
                    <i className="bi bi-door-open text-info"></i>
                  </div>
                  <div>
                    <strong>New room added</strong>
                    <p className="mb-0 text-muted small">Single room added to Sunrise Student Hostel</p>
                  </div>
                  <small className="text-muted ms-auto">5 hours ago</small>
                </div>
                <div className="activity-item d-flex align-items-center">
                  <div className="activity-icon bg-warning-light me-3">
                    <i className="bi bi-clock text-warning"></i>
                  </div>
                  <div>
                    <strong>Verification pending</strong>
                    <p className="mb-0 text-muted small">Green Valley Hostel is awaiting verification</p>
                  </div>
                  <small className="text-muted ms-auto">1 day ago</small>
                </div>
              </Card.Body>
            </Card>

            {/* Quick Actions */}
            <Row className="mt-4 g-3">
              <Col md={4}>
                <Card className="border-0 shadow-sm quick-action-card">
                  <Card.Body className="text-center py-4">
                    <i className="bi bi-building-add fs-1 text-primary mb-3"></i>
                    <h6 className="fw-bold">Add New Hostel</h6>
                    <Link to="/landlord/dashboard/hostels" className="btn btn-outline-primary btn-sm">
                      Go to Hostels
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="border-0 shadow-sm quick-action-card">
                  <Card.Body className="text-center py-4">
                    <i className="bi bi-inbox fs-1 text-warning mb-3"></i>
                    <h6 className="fw-bold">View Requests</h6>
                    <Link to="/landlord/dashboard/requests" className="btn btn-outline-warning btn-sm">
                      View All
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="border-0 shadow-sm quick-action-card">
                  <Card.Body className="text-center py-4">
                    <i className="bi bi-graph-up fs-1 text-success mb-3"></i>
                    <h6 className="fw-bold">Analytics</h6>
                    <Button variant="outline-success" size="sm" disabled>
                      Coming Soon
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        );

      case 'hostels':
        return (
          <>
            <Row className="mb-4">
              <Col>
                <h4 className="fw-bold mb-1">Hostel Management</h4>
                <p className="text-muted mb-0">Manage your hostels and listings</p>
              </Col>
            </Row>
            {hostelError && (
              <Alert variant="danger" className="mb-3">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {hostelError}
              </Alert>
            )}
            {loadingHostels ? (
              <Card className="border-0 shadow-sm">
                <Card.Body className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="text-muted mt-3 mb-0">Loading hostels...</p>
                </Card.Body>
              </Card>
            ) : (
              <LandlordHostelList
                hostels={hostels}
                onAddHostel={handleAddHostel}
                onEditHostel={handleEditHostel}
                onDeleteHostel={handleDeleteHostel}
                onToggleStatus={handleToggleHostelStatus}
              />
            )}
          </>
        );

      case 'rooms':
        return (
          <>
            <Row className="mb-4">
              <Col>
                <h4 className="fw-bold mb-1">Room Management</h4>
                <p className="text-muted mb-0">Manage rooms for each hostel</p>
              </Col>
            </Row>
            {hostels.map(hostel => (
              <div key={hostel._id || hostel.id} className="mb-4">
                <RoomManager
                  hostel={hostel}
                  onAddRoom={handleAddRoom}
                  onUpdateRoom={handleUpdateRoom}
                  onDeleteRoom={handleDeleteRoom}
                  onToggleRoomAvailability={handleToggleRoomAvailability}
                />
              </div>
            ))}
          </>
        );

      case 'requests':
        return (
          <>
            <Row className="mb-4">
              <Col>
                <h4 className="fw-bold mb-1">Requests</h4>
                <p className="text-muted mb-0">View and manage student booking requests</p>
              </Col>
            </Row>
            {requestsError && (
              <Alert variant="danger" className="mb-3">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {requestsError}
              </Alert>
            )}
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white">
                <h5 className="mb-0 fw-bold">
                  <i className="bi bi-inbox me-2"></i>
                  Booking Requests
                </h5>
              </Card.Header>
              <Card.Body className="p-0">
                {loadingRequests ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="text-muted mt-3 mb-0">Loading requests...</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Student</th>
                          <th>Hostel</th>
                          <th>Room</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="text-center py-4">
                              <i className="bi bi-inbox fs-1 text-muted"></i>
                              <p className="mt-2 text-muted">No booking requests yet</p>
                            </td>
                          </tr>
                        ) : (
                          requests.map(req => {
                            const student = req.studentId || {};
                            const studentName = student.name || 'Unknown Student';
                            const hostelName = req.hostelName || req.hostelId?.name || 'Unknown Hostel';
                            const room = req.roomId || {};
                            const roomNumber = room.roomNumber || 'N/A';
                            const startDate = req.bookingPeriod?.startDate 
                              ? new Date(req.bookingPeriod.startDate).toLocaleDateString() 
                              : 'N/A';
                            const status = req.status || 'pending';
                            
                            return (
                              <tr key={req._id}>
                                <td>{studentName}</td>
                                <td>{hostelName}</td>
                                <td>{roomNumber}</td>
                                <td>{startDate}</td>
                                <td>
                                  <Badge 
                                    bg={
                                      status === 'approved' ? 'success' : 
                                      status === 'rejected' ? 'danger' : 
                                      status === 'cancelled' ? 'secondary' : 
                                      'warning'
                                    }
                                  >
                                    {status}
                                  </Badge>
                                </td>
                                <td>
                                  {status === 'pending' && (
                                    <>
                                      <Button 
                                        variant="success" 
                                        size="sm" 
                                        className="me-2"
                                        onClick={() => handleDecision(req._id, 'approve')}
                                      >
                                        <i className="bi bi-check"></i>
                                      </Button>
                                      <Button 
                                        variant="danger" 
                                        size="sm"
                                        onClick={() => handleDecision(req._id, 'reject')}
                                      >
                                        <i className="bi bi-x"></i>
                                      </Button>
                                    </>
                                  )}
                                  {status !== 'pending' && (
                                    <span className="text-muted small">No actions available</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </>
        );

      case 'profile':
        return (
          <>
            <Row className="mb-4">
              <Col>
                <h4 className="fw-bold mb-1">Profile Settings</h4>
                <p className="text-muted mb-0">Manage your account information</p>
              </Col>
            </Row>
            <ProfileSection />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="landlord-dashboard">
      {/* Mobile Toggle Button */}
      <Button 
        variant="primary" 
        className="mobile-sidebar-toggle d-lg-none position-fixed"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        <i className={`bi ${sidebarOpen ? 'bi-x' : 'bi-list'} fs-4`}></i>
      </Button>

      <DashboardSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="dashboard-content">
        <Container fluid className="px-4 py-4">
          {/* Breadcrumb */}
          

          {renderSection()}
        </Container>
      </main>

      {/* Toast notification */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
        <Toast
          bg={toast.variant}
          show={toast.show}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
          autohide
          delay={3000}
        >
          <Toast.Body className="text-white">
            {toast.message}
          </Toast.Body>
        </Toast>
      </div>
    </div>
  );
};

export default LandlordDashboard;
