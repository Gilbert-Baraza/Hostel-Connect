import React, { useState } from 'react';
import { Card, Table, Button, Badge, Form, Modal } from 'react-bootstrap';

/**
 * RoomManager Component
 * Manages rooms for a specific hostel
 */
const RoomManager = ({ hostel, onAddRoom, onUpdateRoom, onDeleteRoom, onToggleRoomAvailability }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    roomNumber: '',
    roomType: 'single',
    capacity: 1,
    price: ''
  });

  const roomTypes = [
    { value: 'single', label: 'Single Room' },
    { value: 'double', label: 'Double Room' },
    { value: 'triple', label: 'Triple Room' },
    { value: 'quad', label: 'Quad Room' },
    { value: 'studio', label: 'Studio Apartment' },
    { value: 'bedspace', label: 'Bedspace' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    const hostelId = hostel?._id || hostel?.id;
    if (!hostelId) {
      setFormError('Missing hostel id.');
      setSubmitting(false);
      return;
    }

    const payload = {
      roomNumber: String(formData.roomNumber || '').trim(),
      roomType: formData.roomType,
      capacity: Number(formData.capacity),
      price: {
        amount: Number(formData.price),
        period: 'monthly'
      }
    };

    try {
      if (editingRoom) {
        const roomId = editingRoom?._id || editingRoom?.id;
        if (!roomId) {
          setFormError('Missing room id.');
          return;
        }
        await onUpdateRoom(hostelId, roomId, payload);
      } else {
        await onAddRoom(hostelId, payload);
      }

      handleCloseModal();
    } catch (error) {
      setFormError(error?.message || 'Failed to save room');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber || '',
      roomType: room.roomType || 'single',
      capacity: room.capacity || 1,
      price: room.price?.amount?.toString() || ''
    });
    setFormError(null);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingRoom(null);
    setFormError(null);
    setSubmitting(false);
    setFormData({ roomNumber: '', roomType: 'single', capacity: 1, price: '' });
  };

  const getStatusBadge = (status) => {
    const variants = {
      'Available': 'success',
      'Occupied': 'warning',
      'Inactive': 'secondary'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const rooms = hostel.rooms || [];
  const hostelLocation = hostel.address?.city
    ? `${hostel.address.city}${hostel.address?.county ? `, ${hostel.address.county}` : ''}`
    : hostel.location || 'N/A';

  return (
    <>
      <Card className="room-manager-card border-0 shadow-sm">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0 fw-bold">
              <i className="bi bi-door-open me-2"></i>
              Rooms - {hostel.name}
            </h5>
            <small className="text-muted">{hostelLocation}</small>
          </div>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <i className="bi bi-plus-lg me-2"></i>
            Add Room
          </Button>
        </Card.Header>
        <Card.Body className="p-0">
          {rooms.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-door-open fs-1 text-muted"></i>
              <p className="text-muted mt-3 mb-3">No rooms added yet</p>
              <Button variant="outline-primary" onClick={() => setShowAddModal(true)}>
                <i className="bi bi-plus-lg me-2"></i>
                Add First Room
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Room</th>
                    <th>Monthly Rent</th>
                    <th>Capacity</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room) => (
                    <tr key={room._id || room.id}>
                      <td>
                        <strong>
                          {room.roomNumber || 'Room'}
                        </strong>
                        <small className="d-block text-muted">
                          {roomTypes.find(t => t.value === room.roomType)?.label || room.roomType}
                        </small>
                      </td>
                      <td>
                        <span className="fw-bold text-success">
                          KES {(room.price?.amount || 0).toLocaleString()}
                        </span>
                        <small className="d-block text-muted">per month</small>
                      </td>
                      <td>
                        <Badge bg="info">{room.capacity || 0} capacity</Badge>
                      </td>
                      <td>
                        {getStatusBadge(
                          room.isActive === false
                            ? 'Inactive'
                            : (room.isAvailable ? 'Available' : 'Occupied')
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => handleEdit(room)}
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button 
                            variant="outline-info" 
                            size="sm"
                            onClick={() => onToggleRoomAvailability(
                              hostel._id || hostel.id,
                              room._id || room.id,
                              room.isAvailable
                            )}
                            disabled={room.isActive === false}
                          >
                            <i className="bi bi-power"></i>
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => onDeleteRoom(hostel._id || hostel.id, room._id || room.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Room Modal */}
      <Modal show={showAddModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingRoom ? 'Edit Room' : 'Add New Room'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formError && (
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {formError}
            </div>
          )}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="roomNumber">
              <Form.Label className="fw-medium">Room Number</Form.Label>
              <Form.Control
                type="text"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleChange}
                placeholder="e.g., A-12"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="roomType">
              <Form.Label className="fw-medium">Room Type</Form.Label>
              <Form.Select
                name="roomType"
                value={formData.roomType}
                onChange={handleChange}
              >
                {roomTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="capacity">
              <Form.Label className="fw-medium">Capacity</Form.Label>
              <Form.Control
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                max="10"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="price">
              <Form.Label className="fw-medium">Monthly Rent (KES)</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Enter rent amount"
                required
                min="0"
              />
            </Form.Group>

            <div className="d-flex gap-3">
              <Button variant="primary" type="submit" className="px-4" disabled={submitting}>
                <i className="bi bi-check-lg me-2"></i>
                {editingRoom ? 'Update Room' : 'Add Room'}
              </Button>
              <Button variant="outline-secondary" onClick={handleCloseModal} disabled={submitting}>
                Cancel
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default RoomManager;
