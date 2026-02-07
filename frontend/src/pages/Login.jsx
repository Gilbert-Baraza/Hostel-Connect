import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Breadcrumb } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import useDocumentTitle from '../hooks/useDocumentTitle';

/**
 * Login Page Component
 * Allows students or landlords to enter credentials
 * 
 * Features:
 * - Email and password form fields
 * - "Remember me" checkbox
 * - "Forgot password?" link
 * - Loading state
 * - Error state handling
 * - Backend API integration
 */
const Login = () => {
  useDocumentTitle('Login');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validated, setValidated] = useState(false);
  
  /**
   * Handle input changes
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };
  
  /**
   * Validate email format
   */
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  /**
   * Handle form submission
   * Calls backend API
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    // Form validation
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    // Additional validation
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    setError(null);

    const result = await login({
      email: formData.email,
      password: formData.password
    });

    if (result.success) {
      const role = result.user?.role;
      const defaultRedirect = role === 'admin'
        ? '/admin/dashboard'
        : role === 'landlord'
          ? '/landlord/dashboard'
          : '/hostels';
      const redirectTo = location.state?.from?.pathname || defaultRedirect;
      navigate(redirectTo, { replace: true });
    } else {
      const errorMessage = result.errors?.length
        ? result.errors.join('. ')
        : result.error || 'Invalid email or password';
      setError(errorMessage);
    }

    setLoading(false);
  };
  
  return (
    <div className="login-page">
      {/* Breadcrumb */}
      <Container className="mt-3">
        <Breadcrumb>
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
            <i className="bi bi-house-fill me-1"></i>
            Home
          </Breadcrumb.Item>
          <Breadcrumb.Item active>Login</Breadcrumb.Item>
        </Breadcrumb>
      </Container>
      
      {/* Login Form */}
      <section className="login-section py-5">
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} sm={10} md={8} lg={5} xl={4}>
              <Card className="login-card border-0 shadow-lg">
                <Card.Body className="p-5">
                  {/* Header */}
                  <div className="text-center mb-4">
                    <div className="login-icon mb-3">
                      <i className="bi bi-person-circle fs-1 text-primary"></i>
                    </div>
                    <h2 className="fw-bold mb-2">Welcome Back</h2>
                    <p className="text-muted">
                      Sign in to your Hostel Connect account
                    </p>
                  </div>
                  
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
                  
                  {/* Login Form */}
                  <Form 
                    noValidate 
                    validated={validated} 
                    onSubmit={handleSubmit}
                  >
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
                      />
                      <Form.Control.Feedback type="invalid">
                        Please enter a valid email address
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
                        placeholder="Enter your password"
                        required
                        className="form-control-lg"
                        autoComplete="current-password"
                        disabled={loading}
                      />
                      <Form.Control.Feedback type="invalid">
                        Please enter your password
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    {/* Remember Me & Forgot Password */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <Form.Check
                        type="checkbox"
                        id="rememberMe"
                        label="Remember me"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      <a 
                        href="#forgot-password" 
                        className="text-decoration-none small"
                      >
                        Forgot password?
                      </a>
                    </div>
                    
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
                          Signing in...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-box-arrow-in-right me-2"></i>
                          Sign In
                        </>
                      )}
                    </Button>
                  </Form>
                  
                  {/* Divider */}
                  <div className="divider my-4">
                    <div className="divider-line"></div>
                    <span className="divider-text">or</span>
                    <div className="divider-line"></div>
                  </div>
                  
                  {/* Social Login (Placeholder) */}
                  <div className="social-login mb-4">
                    <Button 
                      variant="outline-secondary" 
                      className="w-100 mb-2"
                      disabled={loading}
                    >
                      <i className="bi bi-google me-2"></i>
                      Continue with Google
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      className="w-100"
                      disabled={loading}
                    >
                      <i className="bi bi-facebook me-2"></i>
                      Continue with Facebook
                    </Button>
                  </div>
                  
                  {/* Register Link */}
                  <div className="text-center">
                    <p className="mb-0 text-muted">
                      Don't have an account?{' '}
                      <Link 
                        to="/register" 
                        className="text-primary fw-bold text-decoration-none"
                      >
                        Register here
                      </Link>
                    </p>
                  </div>
                </Card.Body>
              </Card>
              
              {/* Security Notice */}
              <div className="security-notice mt-4 text-center">
                <small className="text-muted">
                  <i className="bi bi-shield-check me-1"></i>
                  Your connection is secure. We use encryption to protect your data.
                </small>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Login;
