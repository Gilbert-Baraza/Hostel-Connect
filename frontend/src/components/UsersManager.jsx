import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Button, Table, Badge, Modal, Form, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { getAdminUsers, updateUserStatus } from '../api/admin';
import { normalizeAdminUser } from '../utils/adminMappers';

/**
 * UsersManager Component
 * 
 * Admin panel for managing platform users.
 * Allows viewing, filtering, suspending, and reactivating users.
 * 
 * @param {Object} props
 * @param {Function} props.onUserUpdate - Callback when user status changes
 */
const UsersManager = ({ onUserUpdate }) => {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAdminUsers({ limit: 500 });
      const list = response?.data?.users || [];
      setUsersList(list.map(normalizeAdminUser));
    } catch (err) {
      setError(err?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const getFilteredUsers = () => {
    return usersList.filter(user => {
      if (roleFilter !== 'all' && user.role !== roleFilter) {
        return false;
      }
      if (statusFilter !== 'all' && user.status !== statusFilter) {
        return false;
      }
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          user.name.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search)
        );
      }
      return true;
    });
  };

  const openSuspendModal = (user) => {
    setSelectedUser(user);
    setSuspendReason('');
    setShowSuspendModal(true);
  };

  const handleSuspend = async () => {
    if (!selectedUser) return;

    try {
      await updateUserStatus(selectedUser.id, 'suspended');
      setUsersList(prev => 
        prev.map(u => 
          u.id === selectedUser.id 
            ? { ...u, status: 'suspended' }
            : u
        )
      );
      onUserUpdate && onUserUpdate(selectedUser.id, 'suspended');
      setShowSuspendModal(false);
      setSelectedUser(null);
      setSuspendReason('');
    } catch (err) {
      setError(err?.message || 'Failed to suspend user');
    }
  };

  const handleReactivate = async (userId) => {
    try {
      await updateUserStatus(userId, 'active');
      setUsersList(prev => 
        prev.map(u => 
          u.id === userId 
            ? { ...u, status: 'active' }
            : u
        )
      );
      onUserUpdate && onUserUpdate(userId, 'active');
    } catch (err) {
      setError(err?.message || 'Failed to reactivate user');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'suspended': return 'danger';
      case 'deactivated': return 'secondary';
      default: return 'secondary';
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'student': return 'primary';
      case 'landlord': return 'info';
      case 'admin': return 'dark';
      default: return 'secondary';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'student': return 'bi-graduation-cap';
      case 'landlord': return 'bi-house-door';
      case 'admin': return 'bi-shield-check';
      default: return 'bi-person';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredUsers = getFilteredUsers();
  const stats = {
    total: usersList.length,
    students: usersList.filter(u => u.role === 'student').length,
    landlords: usersList.filter(u => u.role === 'landlord').length,
    suspended: usersList.filter(u => u.status === 'suspended').length
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3 text-muted">Loading users...</p>
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
        <Button variant="outline-danger" onClick={fetchUsers}>
          <i className="bi bi-arrow-clockwise me-2"></i>
          Try Again
        </Button>
      </Alert>
    );
  }

  return (
    <div className="users-manager">
      <div className="page-header mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
          <div>
            <h1 className="page-title">
              <i className="bi bi-people me-2"></i>
              Users Management
            </h1>
            <p className="page-subtitle mb-0">
              Manage platform users (students and landlords)
            </p>
          </div>
          {stats.suspended > 0 && (
            <Badge bg="danger" className="suspended-badge">
              <i className="bi bi-exclamation-circle me-1"></i>
              {stats.suspended} Suspended
            </Badge>
          )}
        </div>
      </div>

      <Row className="mb-4">
        <Col xs={6} md={3}>
          <Card className="stat-card-mini">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-icon-mini bg-primary">
                <i className="bi bi-people"></i>
              </div>
              <div>
                <div className="stat-value-mini">{stats.total}</div>
                <div className="stat-label-mini">Total Users</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="stat-card-mini">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-icon-mini bg-success">
                <i className="bi bi-person-check"></i>
              </div>
              <div>
                <div className="stat-value-mini">{stats.students}</div>
                <div className="stat-label-mini">Students</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="stat-card-mini">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-icon-mini bg-info">
                <i className="bi bi-house-door"></i>
              </div>
              <div>
                <div className="stat-value-mini">{stats.landlords}</div>
                <div className="stat-label-mini">Landlords</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="stat-card-mini">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-icon-mini bg-danger">
                <i className="bi bi-person-x"></i>
              </div>
              <div>
                <div className="stat-value-mini">{stats.suspended}</div>
                <div className="stat-label-mini">Suspended</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mb-4 filter-card">
        <Card.Body>
          <Row className="g-3">
            <Col xs={12} md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col xs={6} md={3}>
              <Form.Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="landlord">Landlords</option>
                <option value="admin">Admins</option>
              </Form.Select>
            </Col>
            <Col xs={6} md={3}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="deactivated">Deactivated</option>
              </Form.Select>
            </Col>
            <Col xs={12} md={2}>
              <Button 
                variant="outline-secondary" 
                className="w-100"
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
                  setStatusFilter('all');
                }}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Reset
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <h5 className="mb-0">
            <i className="bi bi-table me-2"></i>
            Users ({filteredUsers.length})
          </h5>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="users-table mb-0">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5">
                      <i className="bi bi-inbox fs-1 text-muted d-block mb-2"></i>
                      <p className="text-muted mb-0">No users found</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-info">
                          <div className="user-avatar">
                            <i className={`bi ${getRoleIcon(user.role)}`}></i>
                          </div>
                          <div>
                            <div className="fw-bold">{user.name}</div>
                            <small className="text-muted">{user.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge bg={getRoleBadge(user.role)}>
                          <i className={`bi ${getRoleIcon(user.role)} me-1`}></i>
                          {user.role}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={getStatusBadge(user.status)}>
                          {user.status}
                        </Badge>
                      </td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>{formatDate(user.lastLogin)}</td>
                      <td>
                        <div className="d-flex gap-2">
                          {user.status === 'suspended' || user.status === 'deactivated' ? (
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleReactivate(user.id)}
                            >
                              <i className="bi bi-person-check me-1"></i>
                              Reactivate
                            </Button>
                          ) : (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => openSuspendModal(user)}
                            >
                              <i className="bi bi-person-x me-1"></i>
                              Suspend
                            </Button>
                          )}
                          <Button variant="outline-secondary" size="sm">
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

      <Modal show={showSuspendModal} onHide={() => setShowSuspendModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-person-x text-danger me-2"></i>
            Suspend User
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <>
              <Card className="mb-4 bg-light">
                <Card.Body>
                  <Row>
                    <Col xs={6}>
                      <strong>Name:</strong> {selectedUser.name}
                    </Col>
                    <Col xs={6}>
                      <strong>Email:</strong> {selectedUser.email}
                    </Col>
                    <Col xs={6}>
                      <strong>Role:</strong> <Badge bg={getRoleBadge(selectedUser.role)}>{selectedUser.role}</Badge>
                    </Col>
                    <Col xs={6}>
                      <strong>Status:</strong> <Badge bg={getStatusBadge(selectedUser.status)}>{selectedUser.status}</Badge>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Form.Group>
                <Form.Label>
                  <strong>Reason for Suspension</strong>
                  <span className="text-danger ms-1">*</span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Please provide a clear reason for suspending this user..."
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  isInvalid={showSuspendModal && !suspendReason.trim()}
                />
                <Form.Control.Feedback type="invalid">
                  Please provide a suspension reason.
                </Form.Control.Feedback>
              </Form.Group>

              <div className="alert alert-warning mt-3 mb-0">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Suspending this user will prevent them from accessing the platform.
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSuspendModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleSuspend}
            disabled={!suspendReason.trim()}
          >
            <i className="bi bi-person-x me-1"></i>
            Suspend User
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .users-manager {
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
        .suspended-badge {
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
        .users-table {
          min-width: 800px;
        }
        .users-table th {
          background: #f8fafc;
          font-weight: 600;
          color: #475569;
          border-bottom: 2px solid #e2e8f0;
          padding: 1rem;
        }
        .users-table td {
          padding: 1rem;
          vertical-align: middle;
          border-bottom: 1px solid #e2e8f0;
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e0e7ff;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6366f1;
        }
      `}</style>
    </div>
  );
};

export default UsersManager;
