import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Breadcrumb, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

/**
 * Register Page Component
 * Allows role-based signup (Student or Landlord)
 * 
 * Features:
 * - Full name, email, password, confirm password fields
 * - Role selector (Student / Landlord)
 * - Frontend validation
 * - Loading and success UI
 * - Ready for API integration
 */
const Register = () => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [validated, setValidated] = useState(false);
  
  // Validation errors
  const [errors, setErrors] = useState({});
  
  /**
   * Handle input changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user types
    if (error) {
      setError(null);
    }
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  /**
   * Handle role selection
   */
  const handleRoleChange = (value) => {
    setFormData(prev => ({
      ...prev,
      role: value
    }));
  };
  
  /**
   * Validate form
   */
  const validateForm = () => {
    const newErrors = {};
    
    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  /**
   * Get password strength color
   */
  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { level: '', color: '', text: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/(?=.*[a-z])(?=.*[A-Z])/.test(password)) strength++;
    if (/(?=.*\d)/.test(password)) strength++;
    if (/(?=.*[!@#$%^&*])/.test(password)) strength++;
    
    if (strength <= 1) return { level: 'weak', color: 'danger', text: 'Weak' };
    if (strength <= 2) return { level: 'fair', color: 'warning', text: 'Fair' };
    if (strength <= 3) return { level: 'good', color: 'info', text: 'Good' };
    return { level: 'strong', color: 'success', text: 'Strong' };
  };
  
  const passwordStrength = getPasswordStrength();
  
  /**
   * Handle form submission
   * Ready for API integration
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setValidated(true);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    // Simulate API call
    // Replace with actual API call when backend is ready
    /*
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      
      const data = await response.json();
      setSuccess(true);
      // Redirect to login after success
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
    */
    
    // Simulate successful registration after delay
    setTimeout(() => {
      console.log('Registration successful with:', formData);
      setSuccess(true);
      setLoading(false);
      // Redirect to login after showing success message
      setTimeout(() => navigate('/login'), 2000);
    }, 1500);
  };
  
  return (
    <div className="register-page">
      {/* Breadcrumb */}
      <Container className="mt-3">
        <Breadcrumb>
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
            <i className="bi bi-house-fill me-1"></i>
            Home
          </Breadcrumb.Item>
          <Breadcrumb.Item active>Register</Breadcrumb.Item>
        </Breadcrumb>
      </Container>
      
      {/* Register Form */}
      <section className="register-section py-5">
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} sm={10} md={8} lg={6} xl={5}>
              <Card className="register-card border-0 shadow-lg">
                <Card.Body className="p-5">
                  {/* Header */}
                  <div className="text-center mb-4">
                    <div className="register-icon mb-3">
                      <i className="bi bi-person-plus-fill fs-1 text-primary"></i>
                    </div>
                    <h2 className="fw-bold mb-2">Create Account</h2>
                    <p className="text-muted">
                      Join Hostel Connect to find or list hostels
                    </p>
                  </div>
                  
                  {/* Success Alert */}
                  {success && (
                    <Alert variant="success" className="mb-4">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-check-circle-fill me-2 fs-4"></i>
                        <div>
                          <strong>Registration successful!</strong>
                          <p className="mb-0 small">Redirecting to login...</p>
                        </div>
                      </div>
                    </Alert>
                  )}
                  
                  {/* Error Alert */}
                  {error && (
                    <Alert 
                      variant="danger" 
                      className="mb-4"
                      onClose={() => setError(null)}
                      dismissible
                    >
                      <div className="d-flex align-items-center">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        <span>{error}</span>
                      </div>
                    </Alert>
                  )}
                  
                  {/* Register Form */}
                  {!success && (
                    <Form 
                      noValidate 
                      validated={validated} 
                      onSubmit={handleSubmit}
                    >
                      {/* Role Selector */}
                      <Form.Group className="mb-4" controlId="role">
                        <Form.Label className="fw-medium mb-3">
                          <i className="bi bi-people-fill me-2"></i>
                          I am a:
                        </Form.Label>
                        <ToggleButtonGroup
                          type="radio"
                          name="role"
                          value={formData.role}
                          onChange={handleRoleChange}
                          className="w-100"
                        >
                          <ToggleButton
                            id="role-student"
                            value="student"
                            variant="outline-primary"
                            className="flex-fill py-3"
                          >
                            <div className="d-flex align-items-center justify-content-center">
                              <i className="bi bi-backpack-fill me-2"></i>
                              <div className="text-start">
                                <div className="fw-bold">Student</div>
                                <small className="text-muted">Looking for accommodation</small>
                              </div>
                            </div>
                          </ToggleButton>
                          <ToggleButton
                            id="role-landlord"
                            value="landlord"
                            variant="outline-primary"
                            className="flex-fill py-3"
                          >
                            <div className="d-flex align-items-center justify-content-center">
                              <i className="bi bi-building-fill me-2"></i>
                              <div className="text-start">
                                <div className="fw-bold">Landlord</div>
                                <small className="text-muted">Listing my property</small>
                              </div>
                            </div>
                          </ToggleButton>
                        </ToggleButtonGroup>
                      </Form.Group>
                      
                      {/* Full Name Field */}
                      <Form.Group className="mb-3" controlId="fullName">
                        <Form.Label className="fw-medium">
                          <i className="bi bi-person-fill me-2"></i>
                          Full Name
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder="Enter your full name"
                          required
                          className="form-control-lg"
                          autoComplete="name"
                          disabled={loading}
                          isInvalid={!!errors.fullName}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.fullName}
                        </Form.Control.Feedback>
                      </Form.Group>
                      
                      {/* Email Field */}
                      <Form.Group className="mb-3" controlId="email">
                        <Form.Label className="fw-medium">
                          <i className="bi bi-envelope-fill me-2"></i>
                          Email Address
                        </Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter your email"
                          required
                          className="form-control-lg"
                          autoComplete="email"
                          disabled={loading}
                          isInvalid={!!errors.email}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.email}
                        </Form.Control.Feedback>
                      </Form.Group>
                      
                      {/* Password Field */}
                      <Form.Group className="mb-3" controlId="password">
                        <Form.Label className="fw-medium">
                          <i className="bi bi-lock-fill me-2"></i>
                          Password
                        </Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Create a password"
                          required
                          className="form-control-lg"
                          autoComplete="new-password"
                          disabled={loading}
                          isInvalid={!!errors.password}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.password}
                        </Form.Control.Feedback>
                        
                        {/* Password Strength Indicator */}
                        {formData.password && (
                          <div className="mt-2">
                            <div className="d-flex align-items-center gap-2">
                              <div 
                                className={`progress flex-grow-1`}
                                style={{ height: '5px' }}
                              >
                                <div 
                                  className={`progress-bar bg-${passwordStrength.color}`}
                                  style={{ width: `${(passwordStrength.level === 'weak' ? 25 : passwordStrength.level === 'fair' ? 50 : passwordStrength.level === 'good' ? 75 : 100)}%` }}
                                ></div>
                              </div>
                              <small className={`text-${passwordStrength.color} fw-bold`}>
                                {passwordStrength.text}
                              </small>
                            </div>
                          </div>
                        )}
                        
                        {/* Password Requirements */}
                        <small className="text-muted mt-2 d-block">
                          Must be at least 8 characters with uppercase, lowercase, and number
                        </small>
                      </Form.Group>
                      
                      {/* Confirm Password Field */}
                      <Form.Group className="mb-4" controlId="confirmPassword">
                        <Form.Label className="fw-medium">
                          <i className="bi bi-lock-fill me-2"></i>
                          Confirm Password
                        </Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm your password"
                          required
                          className="form-control-lg"
                          autoComplete="new-password"
                          disabled={loading}
                          isInvalid={!!errors.confirmPassword}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.confirmPassword}
                        </Form.Control.Feedback>
                      </Form.Group>
                      
                      {/* Terms Agreement */}
                      <Form.Group className="mb-4">
                        <Form.Check
                          type="checkbox"
                          id="terms"
                          required
                          label={
                            <span className="small">
                              I agree to the{' '}
                              <a href="#terms" className="text-primary">Terms of Service</a>
                              {' '}and{' '}
                              <a href="#privacy" className="text-primary">Privacy Policy</a>
                            </span>
                          }
                          feedback="You must agree to the terms to register"
                        />
                      </Form.Group>
                      
                      {/* Submit Button */}
                      <Button
                        variant="primary"
                        type="submit"
                        className="w-100 py-2 mb-3 fw-bold"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Creating Account...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-person-plus me-2"></i>
                            Create Account
                          </>
                        )}
                      </Button>
                    </Form>
                  )}
                  
                  {/* Divider */}
                  {!success && (
                    <>
                      <div className="divider my-4">
                        <div className="divider-line"></div>
                        <span className="divider-text">or</span>
                        <div className="divider-line"></div>
                      </div>
                      
                      {/* Social Signup (Placeholder) */}
                      <div className="social-register mb-4">
                        <Button 
                          variant="outline-secondary" 
                          className="w-100 mb-2"
                          disabled={loading || success}
                        >
                          <i className="bi bi-google me-2"></i>
                          Sign up with Google
                        </Button>
                      </div>
                    </>
                  )}
                  
                  {/* Login Link */}
                  {!success && (
                    <div className="text-center">
                      <p className="mb-0 text-muted">
                        Already have an account?{' '}
                        <Link 
                          to="/login" 
                          className="text-primary fw-bold text-decoration-none"
                        >
                          Login here
                        </Link>
                      </p>
                    </div>
                  )}
                </Card.Body>
              </Card>
              
              {/* Security Notice */}
              <div className="security-notice mt-4 text-center">
                <small className="text-muted">
                  <i className="bi bi-shield-check me-1"></i>
                  Your information is protected and encrypted
                </small>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Register;
