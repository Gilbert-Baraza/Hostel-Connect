import React, { useState } from 'react';
import { Card, Table, Button, Badge, Form, Modal, Row, Col } from 'react-bootstrap';

/**
 * RoomManager Component
 * Manages rooms for a specific hostel
 */
const RoomManager = ({ hostel, onAddRoom, onUpdateRoom, onDeleteRoom, onToggleRoomAvailability }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    type: 'single',
    price: '',
    status: 'Available'
  });

  const roomTypes = [
    { value: 'single', label: 'Single Room' },
    { value: 'shared', label: 'Shared Room' },
    { value: 'bedsit', label: 'Bedsitter' },
    { value: 'self', label: 'Self-contained' },
    { value: 'studio', label: 'Studio Apartment' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const roomData = {
      id: editingRoom?.id || Date.now().toString(),
      ...formData,
      price: parseFloat(formData.price) || 0
    };

    if (editingRoom) {
      onUpdateRoom(hostel.id, roomData);
    } else {
      onAddRoom(hostel.id, roomData);
    }

    handleCloseModal();
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      type: room.type,
      price: room.price.toString(),
      status: room.status
    });
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingRoom(null);
    setFormData({ type: 'single', price: '', status: 'Available' });
  };

  const getStatusBadge = (status) => {
    const variants = {
      'Available': 'success',
      'Occupied': 'warning',
      'Maintenance': 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const rooms = hostel.rooms || [];

  return (
    <>
      <Card className="room-manager-card border-0 shadow-sm">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0 fw-bold">
              <i className="bi bi-door-open me-2"></i>
              Rooms - {hostel.name}
            </h5>
            <small className="text-muted">{hostel.location}</small>
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
                    <th>Room Type</th>
                    <th>Monthly Rent</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room) => (
                    <tr key={room.id}>
                      <td>
                        <strong>
                          {roomTypes.find(t => t.value === room.type)?.label || room.type}
                        </strong>
                      </td>
                      <td>
                        <span className="fw-bold text-success">
                          KES {room.price.toLocaleString()}
                        </span>
                        <small className="d-block text-muted">per month</small>
                      </td>
                      <td>{getStatusBadge(room.status)}</td>
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
                            onClick={() => onToggleRoomAvailability(hostel.id, room.id)}
                          >
                            <i className="bi bi-power"></i>
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => onDeleteRoom(hostel.id, room.id)}
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
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="roomType">
              <Form.Label className="fw-medium">Room Type</Form.Label>
              <Form.Select
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                {roomTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Form.Select>
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

            <Form.Group className="mb-3" controlId="status">
              <Form.Label className="fw-medium">Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Maintenance">Maintenance</option>
              </Form.Select>
            </Form.Group>

            <div className="d-flex gap-3">
              <Button variant="primary" type="submit" className="px-4">
                <i className="bi bi-check-lg me-2"></i>
                {editingRoom ? 'Update Room' : 'Add Room'}
              </Button>
              <Button variant="outline-secondary" onClick={handleCloseModal}>
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
