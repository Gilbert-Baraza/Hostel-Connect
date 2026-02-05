import React, { useState } from 'react';
import { Container, Row, Col, Button, Breadcrumb, Card, Badge, Alert } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import DashboardSidebar from '../components/DashboardSidebar';
import OverviewCards from '../components/OverviewCards';
import LandlordHostelList from '../components/LandlordHostelList';
import RoomManager from '../components/RoomManager';
import ProfileSection from '../components/ProfileSection';
import { useAuth } from '../auth/AuthContext';

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

  // Dummy data for demonstration
  const [hostels, setHostels] = useState([
    {
      id: '1',
      name: 'Sunrise Student Hostel',
      location: 'Near Egerton University',
      distance: 0.5,
      verificationStatus: 'approved',
      availability: 'Available',
      amenities: ['Water', 'WiFi', 'Security', 'Electricity'],
      image: null,
      rooms: [
        { id: 'r1', type: 'single', price: 3500, status: 'Available' },
        { id: 'r2', type: 'shared', price: 2500, status: 'Occupied' }
      ]
    },
    {
      id: '2',
      name: 'Green Valley Hostel',
      location: 'Nakuru Road',
      distance: 1.2,
      verificationStatus: 'pending',
      availability: 'Available',
      amenities: ['Water', 'WiFi', 'Security', 'Laundry'],
      image: null,
      rooms: [
        { id: 'r3', type: 'single', price: 4000, status: 'Available' },
        { id: 'r4', type: 'bedsit', price: 5000, status: 'Available' }
      ]
    }
  ]);

  // Calculate statistics
  const stats = {
    totalHostels: hostels.length,
    totalRooms: hostels.reduce((acc, h) => acc + (h.rooms?.length || 0), 0),
    availableRooms: hostels.reduce((acc, h) => acc + (h.rooms?.filter(r => r.status === 'Available').length || 0), 0),
    occupiedRooms: hostels.reduce((acc, h) => acc + (h.rooms?.filter(r => r.status === 'Occupied').length || 0), 0),
    pendingVerification: hostels.filter(h => h.verificationStatus === 'pending').length,
    verifiedHostels: hostels.filter(h => h.verificationStatus === 'approved').length
  };

  // Dummy requests data
  const requests = [
    { id: 'req1', studentName: 'John Doe', hostel: 'Sunrise Student Hostel', type: 'viewing', status: 'pending', date: '2024-02-15' },
    { id: 'req2', studentName: 'Jane Smith', hostel: 'Green Valley Hostel', type: 'booking', status: 'pending', date: '2024-02-16' }
  ];

  // Hostel management handlers
  const handleAddHostel = (hostel) => {
    setHostels(prev => [...prev, hostel]);
  };

  const handleEditHostel = (updatedHostel) => {
    setHostels(prev => prev.map(h => h.id === updatedHostel.id ? updatedHostel : h));
  };

  const handleDeleteHostel = (hostelId) => {
    setHostels(prev => prev.filter(h => h.id !== hostelId));
  };

  const handleToggleHostelAvailability = (hostelId) => {
    setHostels(prev => prev.map(h => {
      if (h.id === hostelId) {
        return {
          ...h,
          availability: h.availability === 'Available' ? 'Full' : 'Available'
        };
      }
      return h;
    }));
  };

  // Room management handlers
  const handleAddRoom = (hostelId, room) => {
    setHostels(prev => prev.map(h => {
      if (h.id === hostelId) {
        return { ...h, rooms: [...(h.rooms || []), room] };
      }
      return h;
    }));
  };

  const handleUpdateRoom = (hostelId, updatedRoom) => {
    setHostels(prev => prev.map(h => {
      if (h.id === hostelId) {
        return {
          ...h,
          rooms: h.rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r)
        };
      }
      return h;
    }));
  };

  const handleDeleteRoom = (hostelId, roomId) => {
    setHostels(prev => prev.map(h => {
      if (h.id === hostelId) {
        return { ...h, rooms: h.rooms.filter(r => r.id !== roomId) };
      }
      return h;
    }));
  };

  const handleToggleRoomAvailability = (hostelId, roomId) => {
    setHostels(prev => prev.map(h => {
      if (h.id === hostelId) {
        return {
          ...h,
          rooms: h.rooms.map(r => {
            if (r.id === roomId) {
              return { ...r, status: r.status === 'Available' ? 'Occupied' : 'Available' };
            }
            return r;
          })
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
            <LandlordHostelList
              hostels={hostels}
              onAddHostel={handleAddHostel}
              onEditHostel={handleEditHostel}
              onDeleteHostel={handleDeleteHostel}
              onToggleAvailability={handleToggleHostelAvailability}
            />
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
              <div key={hostel.id} className="mb-4">
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
                <p className="text-muted mb-0">View and manage student requests</p>
              </Col>
            </Row>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white">
                <h5 className="mb-0 fw-bold">
                  <i className="bi bi-inbox me-2"></i>
                  Booking & Viewing Requests
                </h5>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <table className="table mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Student</th>
                        <th>Hostel</th>
                        <th>Type</th>
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
                            <p className="mt-2 text-muted">No requests yet</p>
                          </td>
                        </tr>
                      ) : (
                        requests.map(req => (
                          <tr key={req.id}>
                            <td>{req.studentName}</td>
                            <td>{req.hostel}</td>
                            <td>
                              <Badge bg={req.type === 'viewing' ? 'info' : 'primary'}>
                                {req.type}
                              </Badge>
                            </td>
                            <td>{req.date}</td>
                            <td>
                              <Badge bg="warning">{req.status}</Badge>
                            </td>
                            <td>
                              <Button variant="success" size="sm" className="me-2">
                                <i className="bi bi-check"></i>
                              </Button>
                              <Button variant="danger" size="sm">
                                <i className="bi bi-x"></i>
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
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
        style={{ 
          top: '80px', 
          left: '10px', 
          zIndex: 1060,
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          padding: '0'
        }}
      >
        <i className={`bi ${sidebarOpen ? 'bi-x' : 'bi-list'} fs-4`}></i>
      </Button>

      <DashboardSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="dashboard-content">
        <Container fluid className="px-4 py-4">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-3">
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
              <i className="bi bi-house-fill me-1"></i> Home
            </Breadcrumb.Item>
            <Breadcrumb.Item active>
              <i className="bi bi-person-workspace me-1"></i>
              Landlord Dashboard
            </Breadcrumb.Item>
          </Breadcrumb>

          {renderSection()}
        </Container>
      </main>

      <style>{`
        .landlord-dashboard {
          min-height: 100vh;
          background: #f8f9fa;
        }

        .dashboard-content {
          margin-left: 0;
          transition: margin-left 0.3s ease;
        }

        @media (min-width: 992px) {
          .dashboard-content {
            margin-left: 260px;
          }
        }

        .activity-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bg-success-light { background: rgba(25, 135, 84, 0.1); }
        .bg-info-light { background: rgba(13, 202, 240, 0.1); }
        .bg-warning-light { background: rgba(255, 193, 7, 0.1); }

        .quick-action-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .quick-action-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default LandlordDashboard;
