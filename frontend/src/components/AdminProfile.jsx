import React, { useState } from 'react';
import { Row, Col, Card, Button, Form, InputGroup, Table } from 'react-bootstrap';
import { adminUser, adminActivity } from '../data/adminData';
import { useAuth } from '../auth/AuthContext';

/**
 * AdminProfile Component
 * 
 * Admin profile and account management section.
 * Includes account info, password change (UI placeholder), and activity log.
 * 
 * @param {Object} props
 * @param {Function} props.onPasswordChange - Placeholder for password change
 */
const AdminProfile = ({ onPasswordChange }) => {
  const { user } = useAuth();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [passwordError, setPasswordError] = useState('');

  /**
   * Handle password change
   */
  const handlePasswordChange = () => {
    if (passwords.new !== passwords.confirm) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (passwords.new.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    // Placeholder - would call API
    setShowPasswordForm(false);
    setPasswords({ current: '', new: '', confirm: '' });
    setPasswordError('');
    alert('Password change functionality would be implemented here');
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

  /**
   * Get activity icon
   * @param {string} action 
   * @returns {string}
   */
  const getActivityIcon = (action) => {
    if (action.includes('VERIFY')) return 'bi-check-circle text-success';
    if (action.includes('APPROVE')) return 'bi-check-lg text-success';
    if (action.includes('REJECT')) return 'bi-x-circle text-danger';
    if (action.includes('DISABLE')) return 'bi-pause-circle text-warning';
    if (action.includes('SUSPEND')) return 'bi-person-x text-danger';
    if (action.includes('RESOLVE')) return 'bi-check-circle text-info';
    return 'bi-activity text-primary';
  };

  return (
    <div className="admin-profile">
      {/* Page Header */}
      <div className="page-header mb-4">
        <h1 className="page-title">
          <i className="bi bi-gear me-2"></i>
          Admin Profile
        </h1>
        <p className="page-subtitle mb-0">
          Manage your account settings and view activity history
        </p>
      </div>

      <Row>
        {/* Account Information */}
        <Col xs={12} lg={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-person me-2"></i>
                Account Information
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label>Admin ID</Form.Label>
                    <Form.Control value={adminUser.id} disabled />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label>Role</Form.Label>
                    <Form.Control 
                      value={adminUser.role === 'super_admin' ? 'Super Admin' : 'Admin'} 
                      disabled 
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label>Name</Form.Label>
                    <Form.Control value={user?.name || adminUser.name} disabled />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label>Email</Form.Label>
                    <Form.Control value={user?.email || adminUser.email} disabled />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-0">
                <Form.Label>Member Since</Form.Label>
                <Form.Control value={formatDate(adminUser.createdAt)} disabled />
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>

        {/* Security Settings */}
        <Col xs={12} lg={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-shield-lock me-2"></i>
                Security Settings
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="security-item mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <strong>Password</strong>
                    <p className="text-muted mb-0 small">Last changed: Never</p>
                  </div>
                  <Button
                    variant={showPasswordForm ? 'outline-secondary' : 'outline-primary'}
                    size="sm"
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                  >
                    <i className="bi bi-key me-1"></i>
                    {showPasswordForm ? 'Cancel' : 'Change Password'}
                  </Button>
                </div>

                {showPasswordForm && (
                  <div className="password-form bg-light p-3 rounded">
                    <Form.Group className="mb-3">
                      <Form.Label>Current Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Enter current password"
                        value={passwords.current}
                        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Enter new password"
                        value={passwords.new}
                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                      />
                      <Form.Text className="text-muted">
                        Must be at least 8 characters
                      </Form.Text>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Confirm New Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Confirm new password"
                        value={passwords.confirm}
                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                        isInvalid={!!passwordError}
                      />
                      <Form.Control.Feedback type="invalid">
                        {passwordError}
                      </Form.Control.Feedback>
                    </Form.Group>
                    <Button variant="primary" onClick={handlePasswordChange}>
                      <i className="bi bi-check-lg me-1"></i>
                      Update Password
                    </Button>
                  </div>
                )}
              </div>

              <hr />

              <div className="security-item">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Two-Factor Authentication</strong>
                    <p className="text-muted mb-0 small">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline-secondary" size="sm" disabled>
                    <i className="bi bi-shield-check me-1"></i>
                    Enable (Coming Soon)
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Activity Log */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">
            <i className="bi bi-clock-history me-2"></i>
            Recent Activity Log
          </h5>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="activity-table mb-0">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Target</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {adminActivity.map(activity => (
                  <tr key={activity.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <i className={`bi ${getActivityIcon(activity.action)} me-2`}></i>
                        <span>{activity.action.replace(/_/g, ' ')}</span>
                      </div>
                    </td>
                    <td>{activity.target}</td>
                    <td>{formatDate(activity.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Inline Styles */}
      <style>{`
        .admin-profile {
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

        .card {
          border: none;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .card-header {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          font-weight: 600;
        }

        .security-item {
          padding: 0.5rem 0;
        }

        .password-form {
          border: 1px solid #e2e8f0;
        }

        .activity-table {
          min-width: 500px;
        }

        .activity-table th {
          background: #f8fafc;
          font-weight: 600;
          color: #475569;
          border-bottom: 2px solid #e2e8f0;
          padding: 1rem;
        }

        .activity-table td {
          padding: 1rem;
          vertical-align: middle;
          border-bottom: 1px solid #e2e8f0;
        }
      `}</style>
    </div>
  );
};

export default AdminProfile;
