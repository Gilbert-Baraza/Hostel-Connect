import React, { useEffect, useMemo, useState } from 'react';
import { Form, Button, Card, Row, Col, Alert, Badge, Spinner } from 'react-bootstrap';
import { uploadHostelImages } from '../api/uploads';

/**
 * HostelForm Component
 * Form for adding or editing hostel information
 */
const HostelForm = ({ initialData = {}, onSubmit, onCancel }) => {
  const normalizeAmenities = (amenities = []) => (
    amenities.map((amenity) => (typeof amenity === 'string' ? amenity : amenity?.name)).filter(Boolean)
  );

  const initialImages = useMemo(() => {
    if (Array.isArray(initialData.images) && initialData.images.length > 0) {
      return initialData.images.map((image) => ({
        id: image.publicId || image._id || image.url,
        url: image.url,
        publicId: image.publicId,
        name: image.caption || 'Hostel Image'
      }));
    }
    if (initialData.image) {
      return [{ id: 'legacy', url: initialData.image, name: 'Hostel Image' }];
    }
    return [];
  }, [initialData.image, initialData.images]);

  const initialFormData = useMemo(() => {
    const initialDistance = initialData.distanceFromCampus ?? initialData.distance;

    return ({
    name: initialData.name || '',
    hostelType: initialData.hostelType || '',
    address: {
      street: initialData.address?.street || '',
      city: initialData.address?.city || '',
      county: initialData.address?.county || ''
    },
    distance: initialDistance === undefined || initialDistance === null ? '' : String(initialDistance),
    description: initialData.description || '',
    amenities: normalizeAmenities(initialData.amenities || []),
    images: initialImages,
    isActive: initialData.isActive !== undefined ? initialData.isActive : true,
    coordinates: {
      latitude: initialData.address?.coordinates?.latitude ?? initialData.coordinates?.latitude ?? '',
      longitude: initialData.address?.coordinates?.longitude ?? initialData.coordinates?.longitude ?? ''
    },
    pricing: {
      minPrice: initialData.pricing?.minPrice ?? '',
      maxPrice: initialData.pricing?.maxPrice ?? ''
    }
    });
  }, [initialData, initialImages]);

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const amenityOptions = [
    'Water', 'WiFi', 'Security', 'Electricity', 
    'Laundry', 'Study Room', 'Gym', 'Cafeteria', 
    'Garden', 'Parking', 'CCTV', 'Generator'
  ];

  const amenityCategoryMap = {
    Water: 'essential',
    Electricity: 'essential',
    Security: 'security',
    CCTV: 'security',
    WiFi: 'comfort',
    Laundry: 'comfort',
    'Study Room': 'study',
    Gym: 'entertainment',
    Cafeteria: 'comfort',
    Garden: 'comfort',
    Parking: 'comfort',
    Generator: 'essential'
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handlePricingChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [name]: value
      }
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleCoordinateChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      coordinates: {
        ...prev.coordinates,
        [name]: value
      }
    }));
    if (errors.coordinates) {
      setErrors(prev => ({ ...prev, coordinates: null }));
    }
  };

  const handleStatusChange = (e) => {
    setFormData(prev => ({ ...prev, isActive: e.target.checked }));
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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingImages(true);
    setUploadError(null);

    uploadHostelImages(files)
      .then((response) => {
        const uploaded = response?.data?.images || [];
        const newImages = uploaded.map((image) => ({
          id: image.publicId || image.url,
          url: image.url,
          publicId: image.publicId,
          name: image.format ? `Image (${image.format.toUpperCase()})` : 'Hostel Image'
        }));

        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), ...newImages]
        }));
      })
      .catch((error) => {
        setUploadError(error.message || 'Failed to upload images');
      })
      .finally(() => {
        setUploadingImages(false);
      });

    e.target.value = '';
  };

  const handleRemoveImage = (imageId) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter(img => img.id !== imageId)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Hostel name is required';
    }

    if (!formData.hostelType) {
      newErrors.hostelType = 'Hostel type is required';
    }

    if (!formData.address.street.trim()) {
      newErrors.street = 'Street address is required';
    }

    if (!formData.address.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.address.county.trim()) {
      newErrors.county = 'County is required';
    }
    
    const distanceValue = String(formData.distance ?? '').trim();
    if (!distanceValue) {
      newErrors.distance = 'Distance to university is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (formData.amenities.length === 0) {
      newErrors.amenities = 'Select at least one amenity';
    }

    if (formData.pricing.minPrice === '' || Number(formData.pricing.minPrice) < 0) {
      newErrors.minPrice = 'Minimum price is required';
    }

    if (formData.pricing.maxPrice !== '' && Number(formData.pricing.maxPrice) < Number(formData.pricing.minPrice)) {
      newErrors.maxPrice = 'Maximum price must be greater than or equal to minimum price';
    }

    const latitude = formData.coordinates.latitude;
    const longitude = formData.coordinates.longitude;
    const hasLatitude = latitude !== '';
    const hasLongitude = longitude !== '';

    if (hasLatitude || hasLongitude) {
      const latValue = Number(latitude);
      const lngValue = Number(longitude);

      if (!hasLatitude || !hasLongitude) {
        newErrors.coordinates = 'Provide both latitude and longitude';
      } else if (!Number.isFinite(latValue) || !Number.isFinite(lngValue)) {
        newErrors.coordinates = 'Latitude and longitude must be valid numbers';
      } else if (latValue < -90 || latValue > 90 || lngValue < -180 || lngValue > 180) {
        newErrors.coordinates = 'Latitude must be between -90 and 90, longitude between -180 and 180';
      }
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
    const distanceValue = String(formData.distance ?? '').trim();
    const latRaw = formData.coordinates.latitude;
    const lngRaw = formData.coordinates.longitude;
    const latValue = Number(latRaw);
    const lngValue = Number(lngRaw);
    const hasCoordinates = latRaw !== '' && lngRaw !== '' &&
      Number.isFinite(latValue) && Number.isFinite(lngValue);

    const submitData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      hostelType: formData.hostelType,
      address: {
        street: formData.address.street.trim(),
        city: formData.address.city.trim(),
        county: formData.address.county.trim(),
        coordinates: hasCoordinates ? { latitude: latValue, longitude: lngValue } : undefined
      },
      distanceFromCampus: parseFloat(distanceValue) || 0,
      amenities: formData.amenities.map((name) => ({
        name,
        category: amenityCategoryMap[name] || 'essential'
      })),
      images: (formData.images || []).map((image, index) => ({
        url: image.url,
        publicId: image.publicId,
        isPrimary: index === 0
      })),
      pricing: {
        minPrice: Number(formData.pricing.minPrice),
        maxPrice: formData.pricing.maxPrice === '' ? undefined : Number(formData.pricing.maxPrice)
      },
      isActive: formData.isActive
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
          {initialData.id || initialData._id ? 'Edit Hostel' : 'Add New Hostel'}
          {initialData.verificationStatus === 'pending' && (
            <Badge bg="warning" className="ms-2">Pending Approval</Badge>
          )}
        </h5>
      </Card.Header>
      <Card.Body className="p-4">
        {initialData.verificationStatus === 'pending' && (
          <Alert variant="warning" className="mb-4">
            This hostel is pending approval. Updates may require re-verification.
          </Alert>
        )}

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

          {/* Hostel Type */}
          <Form.Group className="mb-3" controlId="hostelType">
            <Form.Label className="fw-medium">Hostel Type</Form.Label>
            <Form.Select
              name="hostelType"
              value={formData.hostelType}
              onChange={handleChange}
              required
              isInvalid={!!errors.hostelType}
            >
              <option value="">Select hostel type</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="mixed">Mixed</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.hostelType}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Address */}
          <Row className="g-3 mb-3">
            <Col md={12}>
              <Form.Group controlId="street">
                <Form.Label className="fw-medium">Street Address</Form.Label>
                <Form.Control
                  type="text"
                  name="street"
                  value={formData.address.street}
                  onChange={handleAddressChange}
                  placeholder="Enter street address"
                  required
                  isInvalid={!!errors.street}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.street}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="city">
                <Form.Label className="fw-medium">City</Form.Label>
                <Form.Control
                  type="text"
                  name="city"
                  value={formData.address.city}
                  onChange={handleAddressChange}
                  placeholder="Enter city"
                  required
                  isInvalid={!!errors.city}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.city}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="county">
                <Form.Label className="fw-medium">County</Form.Label>
                <Form.Control
                  type="text"
                  name="county"
                  value={formData.address.county}
                  onChange={handleAddressChange}
                  placeholder="Enter county"
                  required
                  isInvalid={!!errors.county}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.county}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

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

          {/* Pricing */}
          <Row className="g-3 mb-3">
            <Col md={6}>
              <Form.Group controlId="minPrice">
                <Form.Label className="fw-medium">Minimum Price (Monthly)</Form.Label>
                <Form.Control
                  type="number"
                  name="minPrice"
                  value={formData.pricing.minPrice}
                  onChange={handlePricingChange}
                  placeholder="Enter minimum price"
                  required
                  isInvalid={!!errors.minPrice}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.minPrice}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="maxPrice">
                <Form.Label className="fw-medium">Maximum Price (Optional)</Form.Label>
                <Form.Control
                  type="number"
                  name="maxPrice"
                  value={formData.pricing.maxPrice}
                  onChange={handlePricingChange}
                  placeholder="Enter maximum price"
                  isInvalid={!!errors.maxPrice}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.maxPrice}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

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

          {/* Listing Status */}
          <Form.Group className="mb-4" controlId="status">
            <Form.Label className="fw-medium">Listing Status</Form.Label>
            <Form.Check
              type="switch"
              id="hostel-active"
              label={formData.isActive ? 'Active' : 'Inactive'}
              checked={formData.isActive}
              onChange={handleStatusChange}
            />
          </Form.Group>

          {/* Location Coordinates */}
          <Form.Group className="mb-4" controlId="coordinates">
            <Form.Label className="fw-medium">Hostel Location (Map Support)</Form.Label>
            <Row className="g-3">
              <Col md={6}>
                <Form.Control
                  type="text"
                  name="latitude"
                  value={formData.coordinates.latitude}
                  onChange={handleCoordinateChange}
                  placeholder="Latitude (e.g., -0.3676)"
                  isInvalid={!!errors.coordinates}
                />
              </Col>
              <Col md={6}>
                <Form.Control
                  type="text"
                  name="longitude"
                  value={formData.coordinates.longitude}
                  onChange={handleCoordinateChange}
                  placeholder="Longitude (e.g., 35.9397)"
                  isInvalid={!!errors.coordinates}
                />
              </Col>
            </Row>
            {errors.coordinates && (
              <small className="text-danger d-block mt-2">{errors.coordinates}</small>
            )}
            <div className="map-preview mt-3">
              {formData.coordinates.latitude !== '' &&
              formData.coordinates.longitude !== '' &&
              Number.isFinite(Number(formData.coordinates.latitude)) &&
              Number.isFinite(Number(formData.coordinates.longitude)) ? (
                <iframe
                  title="hostel-map"
                  className="map-iframe"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(formData.coordinates.longitude) - 0.01}%2C${Number(formData.coordinates.latitude) - 0.01}%2C${Number(formData.coordinates.longitude) + 0.01}%2C${Number(formData.coordinates.latitude) + 0.01}&layer=mapnik&marker=${Number(formData.coordinates.latitude)}%2C${Number(formData.coordinates.longitude)}`}
                />
              ) : (
                <div className="map-placeholder">
                  <i className="bi bi-geo-alt fs-2 text-muted mb-2"></i>
                  <p className="mb-0 text-muted">Enter coordinates to preview the map</p>
                </div>
              )}
            </div>
          </Form.Group>

          {/* Image Upload */}
          <Form.Group className="mb-4" controlId="image">
            <Form.Label className="fw-medium">Hostel Images</Form.Label>
            <div className="image-upload-placeholder">
              <input
                type="file"
                accept="image/*"
                className="d-none"
                id="image-upload"
                multiple
                onChange={handleImageUpload}
                disabled={uploadingImages}
              />
              <label htmlFor="image-upload" className="upload-area">
                <i className="bi bi-cloud-upload fs-1 text-muted mb-2"></i>
                <p className="mb-0 text-muted">
                  <i className="bi bi-image me-1"></i>
                  Click to upload images
                </p>
                <small className="text-muted">PNG, JPG up to 5MB</small>
              </label>
            </div>
            {uploadingImages && (
              <div className="d-flex align-items-center gap-2 mt-2 text-muted">
                <Spinner size="sm" animation="border" />
                <span>Uploading images...</span>
              </div>
            )}
            {uploadError && (
              <small className="text-danger d-block mt-2">{uploadError}</small>
            )}
            {formData.images?.length > 0 && (
              <div className="image-preview-grid mt-3">
                {formData.images.map((image) => (
                  <div key={image.id} className="image-preview-card">
                    <img src={image.url} alt={image.name || 'Hostel'} />
                    <button
                      type="button"
                      className="btn btn-sm btn-danger image-remove"
                      onClick={() => handleRemoveImage(image.id)}
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Form.Group>

          {/* Action Buttons */}
          <div className="d-flex gap-3">
            <Button variant="primary" type="submit" className="px-4" disabled={uploadingImages}>
              <i className="bi bi-check-lg me-2"></i>
              {initialData.id || initialData._id ? 'Update Hostel' : 'Add Hostel'}
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

          .map-preview {
            border: 1px solid #dee2e6;
            border-radius: 8px;
            overflow: hidden;
            background: #f8f9fa;
          }

          .map-placeholder {
            min-height: 180px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
            text-align: center;
          }

          .map-iframe {
            width: 100%;
            height: 220px;
            border: 0;
          }

          .image-preview-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 0.75rem;
          }

          .image-preview-card {
            position: relative;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #dee2e6;
          }

          .image-preview-card img {
            width: 100%;
            height: 90px;
            object-fit: cover;
            display: block;
          }

          .image-remove {
            position: absolute;
            top: 6px;
            right: 6px;
            border-radius: 999px;
            padding: 2px 6px;
          }
        `}</style>
      </Card.Body>
    </Card>
  );
};

export default HostelForm;
