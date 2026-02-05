import React, { useState } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';

/**
 * HostelForm Component
 * Form for adding or editing hostel information
 */
const HostelForm = ({ initialData = {}, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    location: initialData.location || '',
    distance: initialData.distance || '',
    description: initialData.description || '',
    amenities: initialData.amenities || [],
    image: initialData.image || ''
  });

  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState({});

  const amenityOptions = [
    'Water', 'WiFi', 'Security', 'Electricity', 
    'Laundry', 'Study Room', 'Gym', 'Cafeteria', 
    'Garden', 'Parking', 'CCTV', 'Generator'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => {
      const currentAmenities = prev.amenities || [];
      if (currentAmenities.includes(amenity)) {
        return { ...prev, amenities: currentAmenities.filter(a => a !== amenity) };
      }
      return { ...prev, amenities: [...currentAmenities, amenity] };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Hostel name is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.distance.trim()) {
      newErrors.distance = 'Distance to university is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (formData.amenities.length === 0) {
      newErrors.amenities = 'Select at least one amenity';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setValidated(true);
      return;
    }

    // Prepare data for API
    const submitData = {
      ...formData,
      distance: parseFloat(formData.distance) || 0
    };

    if (onSubmit) {
      onSubmit(submitData);
    }
  };

  return (
    <Card className="hostel-form-card border-0 shadow-sm">
      <Card.Header className="bg-white">
        <h5 className="mb-0 fw-bold">
          <i className="bi bi-building me-2"></i>
          {initialData.id ? 'Edit Hostel' : 'Add New Hostel'}
        </h5>
      </Card.Header>
      <Card.Body className="p-4">
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          {/* Hostel Name */}
          <Form.Group className="mb-3" controlId="name">
            <Form.Label className="fw-medium">Hostel Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter hostel name"
              required
              isInvalid={!!errors.name}
            />
            <Form.Control.Feedback type="invalid">
              {errors.name}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Location */}
          <Form.Group className="mb-3" controlId="location">
            <Form.Label className="fw-medium">Location</Form.Label>
            <Form.Control
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter location (e.g., Near Egerton University)"
              required
              isInvalid={!!errors.location}
            />
            <Form.Control.Feedback type="invalid">
              {errors.location}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Distance */}
          <Form.Group className="mb-3" controlId="distance">
            <Form.Label className="fw-medium">Distance to University (km)</Form.Label>
            <Form.Control
              type="text"
              name="distance"
              value={formData.distance}
              onChange={handleChange}
              placeholder="Enter distance"
              required
              isInvalid={!!errors.distance}
            />
            <Form.Control.Feedback type="invalid">
              {errors.distance}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Description */}
          <Form.Group className="mb-3" controlId="description">
            <Form.Label className="fw-medium">Description</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the hostel..."
              rows={4}
              required
              isInvalid={!!errors.description}
            />
            <Form.Control.Feedback type="invalid">
              {errors.description}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Amenities */}
          <Form.Group className="mb-3" controlId="amenities">
            <Form.Label className="fw-medium">Amenities</Form.Label>
            <div className="amenities-grid">
              {amenityOptions.map((amenity) => (
                <Form.Check
                  key={amenity}
                  type="checkbox"
                  id={`amenity-${amenity}`}
                  label={amenity}
                  checked={formData.amenities.includes(amenity)}
                  onChange={() => handleAmenityToggle(amenity)}
                  className="amenity-checkbox"
                />
              ))}
            </div>
            {errors.amenities && (
              <small className="text-danger">{errors.amenities}</small>
            )}
          </Form.Group>

          {/* Image Upload Placeholder */}
          <Form.Group className="mb-4" controlId="image">
            <Form.Label className="fw-medium">Hostel Images</Form.Label>
            <div className="image-upload-placeholder">
              <input type="file" accept="image/*" className="d-none" id="image-upload" />
              <label htmlFor="image-upload" className="upload-area">
                <i className="bi bi-cloud-upload fs-1 text-muted mb-2"></i>
                <p className="mb-0 text-muted">
                  <i className="bi bi-image me-1"></i>
                  Click to upload images
                </p>
                <small className="text-muted">PNG, JPG up to 5MB</small>
              </label>
            </div>
          </Form.Group>

          {/* Action Buttons */}
          <div className="d-flex gap-3">
            <Button variant="primary" type="submit" className="px-4">
              <i className="bi bi-check-lg me-2"></i>
              {initialData.id ? 'Update Hostel' : 'Add Hostel'}
            </Button>
            {onCancel && (
              <Button variant="outline-secondary" onClick={onCancel}>
                <i className="bi bi-x-lg me-2"></i>
                Cancel
              </Button>
            )}
          </div>
        </Form>

        <style>{`
          .amenities-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 0.5rem;
          }

          .amenity-checkbox .form-check-input:checked {
            background-color: #1a5f7a;
            border-color: #1a5f7a;
          }

          .image-upload-placeholder {
            border: 2px dashed #dee2e6;
            border-radius: 8px;
            padding: 2rem;
            text-align: center;
          }

          .upload-area {
            cursor: pointer;
            display: block;
          }

          .upload-area:hover {
            border-color: #1a5f7a;
            background: rgba(26, 95, 122, 0.05);
          }
        `}</style>
      </Card.Body>
    </Card>
  );
};

export default HostelForm;
