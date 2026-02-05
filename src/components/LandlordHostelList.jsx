import React, { useState } from 'react';
import { Card, Table, Button, Badge, Dropdown, Modal, Row, Col } from 'react-bootstrap';
import HostelForm from './HostelForm';

/**
 * LandlordHostelList Component
 * Displays and manages landlord's hostels
 */
const LandlordHostelList = ({ hostels, onAddHostel, onEditHostel, onDeleteHostel, onToggleAvailability }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHostel, setEditingHostel] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hostelToDelete, setHostelToDelete] = useState(null);

  const getVerificationBadge = (status) => {
    const variants = {
      'pending': 'warning',
      'approved': 'success',
      'rejected': 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getAvailabilityBadge = (status) => {
    const variants = {
      'Available': 'success',
      'Limited': 'warning',
      'Full': 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const handleEdit = (hostel) => {
    setEditingHostel(hostel);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingHostel(null);
  };

  const handleFormSubmit = (data) => {
    if (editingHostel) {
      onEditHostel({ ...editingHostel, ...data });
    } else {
      onAddHostel({
        id: Date.now().toString(),
        ...data,
        verificationStatus: 'pending',
        rooms: [],
        createdAt: new Date().toISOString()
      });
    }
    handleCloseModal();
  };

  const handleDeleteClick = (hostel) => {
    setHostelToDelete(hostel);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (hostelToDelete) {
      onDeleteHostel(hostelToDelete.id);
    }
    setShowDeleteModal(false);
    setHostelToDelete(null);
  };

  return (
    <>
      <Card className="hostel-list-card border-0 shadow-sm">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold">
            <i className="bi bi-building me-2"></i>
            My Hostels
          </h5>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <i className="bi bi-plus-lg me-2"></i>
            Add Hostel
          </Button>
        </Card.Header>
        <Card.Body className="p-0">
          {hostels.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-building fs-1 text-muted"></i>
              <p className="text-muted mt-3 mb-3">No hostels added yet</p>
              <Button variant="outline-primary" onClick={() => setShowAddModal(true)}>
                <i className="bi bi-plus-lg me-2"></i>
                Add Your First Hostel
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Hostel Name</th>
                    <th>Location</th>
                    <th>Rooms</th>
                    <th>Verification</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hostels.map((hostel) => (
                    <tr key={hostel.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img
                            src={hostel.image || 'https://via.placeholder.com/60'}
                            alt={hostel.name}
                            className="rounded me-3"
                            style={{ width: '60px', height: '45px', objectFit: 'cover' }}
                          />
                          <div>
                            <strong>{hostel.name}</strong>
                            <small className="d-block text-muted">
                              {hostel.distance}km from campus
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>{hostel.location}</td>
                      <td>
                        <Badge bg="info">{hostel.rooms?.length || 0} rooms</Badge>
                      </td>
                      <td>{getVerificationBadge(hostel.verificationStatus)}</td>
                      <td>{getAvailabilityBadge(hostel.availability || 'Available')}</td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle variant="outline-secondary" size="sm">
                            <i className="bi bi-three-dots"></i>
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleEdit(hostel)}>
                              <i className="bi bi-pencil me-2"></i>Edit
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => onToggleAvailability(hostel.id)}>
                              <i className="bi bi-power me-2"></i>
                              Toggle Availability
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item 
                              className="text-danger" 
                              onClick={() => handleDeleteClick(hostel)}
                            >
                              <i className="bi bi-trash me-2"></i>Delete
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Hostel Modal */}
      <Modal show={showAddModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingHostel ? 'Edit Hostel' : 'Add New Hostel'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <HostelForm
            initialData={editingHostel || {}}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseModal}
          />
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Delete Hostel
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete <strong>{hostelToDelete?.name}</strong>?</p>
          <p className="text-muted mb-0">
            This action cannot be undone. All rooms associated with this hostel will also be deleted.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            <i className="bi bi-trash me-2"></i>
            Delete Hostel
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default LandlordHostelList;
