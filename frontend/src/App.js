import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Navbar, Nav, Container, Button, Form, Row, Col, Card, Badge, Dropdown, Spinner } from 'react-bootstrap';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import SkipLink from './components/SkipLink';
import { getMyNotifications, markNotificationRead, markAllNotificationsRead } from './api/notifications';

// Lazy load pages for code splitting and better performance
const Hostels = lazy(() => import('./pages/Hostels'));
const HostelDetails = lazy(() => import('./pages/HostelDetails'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const LandlordDashboard = lazy(() => import('./pages/LandlordDashboard'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="d-flex align-items-center justify-content-center min-vh-100">
    <div className="text-center">
      <div className="spinner-border text-primary mb-3" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-muted">Loading...</p>
    </div>
  </div>
);

/**
 * Hostel Connect - Landing Page
 */

// =============================================================================
// COMPONENT: Navigation (Sticky, Responsive)
// =============================================================================
const Navigation = () => {
  const [expanded, setExpanded] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notificationsTotal, setNotificationsTotal] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState(null);
  const userId = user?._id || user?.id;
  
  // Hide navbar on landlord/student/admin dashboard routes
  const isDashboardRoute = location.pathname.startsWith('/landlord/') || 
                            location.pathname.startsWith('/student/') || 
                            location.pathname.startsWith('/admin/');
  useEffect(() => {
    let isMounted = true;

    const fetchUnreadCount = async () => {
      if (!isAuthenticated || !userId) {
        if (isMounted) setUnreadCount(0);
        return;
      }

      try {
        const response = await getMyNotifications({ isRead: false, limit: 1 });
        const total = response?.data?.pagination?.total;
        const fallbackTotal = response?.data?.notifications?.length || 0;
        if (isMounted) {
          setUnreadCount(Number.isFinite(total) ? total : fallbackTotal);
        }
      } catch (error) {
        if (isMounted) {
          setUnreadCount(0);
        }
      }
    };

    fetchUnreadCount();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, userId]);

  useEffect(() => {
    if (location.pathname !== '/' || !location.hash) return;

    let attempts = 0;
    const hashId = location.hash.replace('#', '');

    const tryScroll = () => {
      const target = document.getElementById(hashId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      attempts += 1;
      if (attempts < 5) {
        setTimeout(tryScroll, 100);
      }
    };

    tryScroll();
  }, [location.pathname, location.hash]);

  const loadNotifications = async () => {
    if (!isAuthenticated || !userId) {
      setNotifications([]);
      setNotificationsTotal(0);
      return;
    }

    setNotificationsLoading(true);
    setNotificationsError(null);
    try {
      const response = await getMyNotifications({ limit: 5 });
      const list = response?.data?.notifications || [];
      const total = response?.data?.pagination?.total;
      setNotifications(list);
      setNotificationsTotal(Number.isFinite(total) ? total : list.length);
    } catch (error) {
      setNotificationsError(error?.message || 'Failed to load notifications');
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleMarkRead = async (notificationId) => {
    if (!notificationId) return;
    try {
      await markNotificationRead(notificationId);
      setNotifications((prev) =>
        prev.map((item) =>
          item._id === notificationId || item.id === notificationId
            ? { ...item, isRead: true }
            : item
        )
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (error) {
      setNotificationsError(error?.message || 'Failed to update notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      setNotificationsError(error?.message || 'Failed to update notifications');
    }
  };

  const formatNotificationTime = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-KE', {
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (value, limit = 80) => {
    if (!value) return '';
    const text = String(value);
    return text.length > limit ? `${text.slice(0, limit)}...` : text;
  };

  if (isDashboardRoute) {
    return null;
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/hostels', label: 'Find Hostels' },
    { href: '/#how-it-works', label: 'How It Works', isAnchor: true },
  ];

  // Show landlord/admin links only for authenticated users with appropriate roles
  if (isAuthenticated && (user?.role === 'landlord' || user?.role === 'admin')) {
    navLinks.push({ href: '/landlord/dashboard', label: 'Dashboard' });
  }

  // Show admin dashboard link for authenticated admins
  if (isAuthenticated && user?.role === 'admin') {
    navLinks.push({ href: '/admin/dashboard', label: 'Admin Panel' });
  }

  // Show student dashboard link for authenticated students
  if (isAuthenticated && user?.role === 'student') {
    navLinks.push({ href: '/student/dashboard', label: 'My Dashboard' });
  }

  const handleNavClick = (link) => {
    if (link.isAnchor) {
      if (location.pathname !== '/') {
        setExpanded(false);
        return;
      }

      const targetId = link.href.replace('/#', '');
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setExpanded(false);
        return;
      }
    }

    setExpanded(false);
  };

  return (
    <Navbar
      expand="lg"
      expanded={expanded}
      className="navbar-custom"
      fixed="top"
    >
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <i className="bi bi-house-door-fill me-2"></i>
          <span>Hostel Connect</span>
        </Navbar.Brand>

        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          onClick={() => setExpanded(!expanded)}
        >
          <span className="navbar-toggler-icon"></span>
        </Navbar.Toggle>

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto ms-lg-4">
            {navLinks.map((link, index) => (
              <Nav.Link
                key={index}
                as={Link}
                to={link.href}
                onClick={() => handleNavClick(link)}
              >
                {link.label}
              </Nav.Link>
            ))}
          </Nav>

          {/* Show login/register for guests, user menu for authenticated users */}
          {!isAuthenticated ? (
            <div className="d-flex flex-column flex-lg-row gap-2 mt-3 mt-lg-0">
              <Button
                variant="outline-primary"
                className="btn-outline-custom"
                as={Link}
                to="/login"
              >
                Login
              </Button>
              <Button
                variant="primary"
                className="btn-register"
                as={Link}
                to="/register"
              >
                Register
              </Button>
            </div>
          ) : (
            <Nav className="d-flex flex-column flex-lg-row gap-2 mt-3 mt-lg-0 align-items-center">
              <Dropdown
                align="end"
                onToggle={(nextOpen) => {
                  if (nextOpen) {
                    loadNotifications();
                  }
                }}
              >
                <Dropdown.Toggle
                  variant="link"
                  className="position-relative p-0 text-decoration-none text-muted"
                  aria-label="Notifications"
                >
                  <i className="bi bi-bell fs-5"></i>
                  {unreadCount > 0 && (
                    <Badge
                      bg="danger"
                      pill
                      className="position-absolute top-0 start-100 translate-middle"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </Dropdown.Toggle>
                <Dropdown.Menu className="shadow-sm" style={{ minWidth: '320px' }}>
                  <div className="d-flex justify-content-between align-items-center px-3 py-2">
                    <span className="fw-bold">Notifications</span>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-decoration-none"
                      onClick={handleMarkAllRead}
                      disabled={unreadCount === 0}
                    >
                      Mark all read
                    </Button>
                  </div>
                  <Dropdown.Divider />
                  {notificationsLoading ? (
                    <div className="text-center py-3 text-muted">
                      <Spinner animation="border" size="sm" className="me-2" />
                      Loading...
                    </div>
                  ) : notificationsError ? (
                    <div className="text-danger px-3 py-2">{notificationsError}</div>
                  ) : notifications.length === 0 ? (
                    <div className="text-muted px-3 py-2">No notifications yet</div>
                  ) : (
                    notifications.map((notification) => {
                      const notificationId = notification._id || notification.id;
                      return (
                        <Dropdown.Item
                          key={notificationId}
                          className={`py-2 ${notification.isRead ? 'text-muted' : 'fw-semibold'}`}
                          onClick={() => handleMarkRead(notificationId)}
                        >
                          <div className="d-flex justify-content-between align-items-start">
                            <span className="me-2">{notification.title}</span>
                            <small className="text-muted">
                              {formatNotificationTime(notification.createdAt)}
                            </small>
                          </div>
                          <div className="small text-muted">
                            {truncateText(notification.message)}
                          </div>
                        </Dropdown.Item>
                      );
                    })
                  )}
                  {notificationsTotal > notifications.length && (
                    <>
                      <Dropdown.Divider />
                      <div className="text-center py-2 text-muted small">
                        Showing {notifications.length} of {notificationsTotal}
                      </div>
                    </>
                  )}
                </Dropdown.Menu>
              </Dropdown>
              <span className="text-muted small mb-2 mb-lg-0">
                <i className="bi bi-person-circle me-1"></i>
                {user?.name || user?.email}
                <span className="badge bg-secondary ms-1">{user?.role}</span>
              </span>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => {
                  logout();
                  setExpanded(false);
                }}
              >
                <i className="bi bi-box-arrow-right me-1"></i>
                Logout
              </Button>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

// =============================================================================
// COMPONENT: Hero Section with Search Bar
// =============================================================================
const HeroSection = () => {
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [hostelType, setHostelType] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (budget) params.set('budget', budget);
    if (hostelType) params.set('type', hostelType);
    navigate(`/hostels?${params.toString()}`);
  };

  return (
    <section id="home" className="hero-section">
      <Container>
        <Row className="align-items-center">
          <Col lg={6} className="mb-5 mb-lg-0">
            <div className="fade-in">
              <span className="trust-badge mb-3 d-inline-block">
                <i className="bi bi-patch-check-fill"></i>
                100% Verified Listings
              </span>

              <h1 className="hero-title">
                Find Verified Off-Campus Hostels Near Your University
              </h1>

              <p className="hero-subtitle">
                Search, compare, and connect with trusted landlords — no agents, no scams.
                Your next home is just a few clicks away.
              </p>

              {/* Search Bar */}
              <div className="search-bar mt-4">
                <Form>
                  <Row className="g-3">
                    <Col xs={12} md={4}>
                      <Form.Control
                        type="text"
                        placeholder="Enter university or location"
                        className="form-control"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </Col>
                    <Col xs={12} md={3}>
                      <Form.Select
                        className="form-select"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                      >
                        <option value="">Select Budget</option>
                        <option value="0-2000">Under Ksh. 2,000</option>
                        <option value="2000-3000">Ksh. 2,000 - 3,000</option>
                        <option value="3000-4000">Ksh. 3,000 - 4,000</option>
                        <option value="4000-5000">Ksh. 4,000 - 5,000</option>
                        <option value="5000-10000">Over Ksh. 5,000</option>
                      </Form.Select>
                    </Col>
                    <Col xs={12} md={3}>
                      <Form.Select
                        className="form-select"
                        value={hostelType}
                        onChange={(e) => setHostelType(e.target.value)}
                      >
                        <option value="">Hostel Type</option>
                        <option value="male">Male Only</option>
                        <option value="female">Female Only</option>
                        <option value="mixed">Mixed</option>
                      </Form.Select>
                    </Col>
                    <Col xs={12} md={2}>
                      <Button
                        variant="primary"
                        className="btn-search w-100"
                        type="button"
                        onClick={handleSearch}
                      >
                        <i className="bi bi-search me-1"></i>
                        Search
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </div>

              {/* Quick Stats */}
              <Row className="mt-4 text-center text-lg-start">
                <Col xs={4}>
                  <div className="text-white">
                    <h3 className="fw-bold mb-0">500+</h3>
                    <small className="text-white-50">Verified Hostels</small>
                  </div>
                </Col>
                <Col xs={4}>
                  <div className="text-white">
                    <h3 className="fw-bold mb-0">50+</h3>
                    <small className="text-white-50">Universities</small>
                  </div>
                </Col>
                <Col xs={4}>
                  <div className="text-white">
                    <h3 className="fw-bold mb-0">1K+</h3>
                    <small className="text-white-50">Happy Students</small>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>

          <Col lg={6}>
            <div className="text-center text-lg-end">
              <img
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 400'%3E%3Crect fill='%23f8f9fa' width='500' height='400' rx='20'/%3E%3Cg transform='translate(50, 50)'%3E%3Ccircle cx='200' cy='150' r='80' fill='%231a5f7a' opacity='0.2'/%3E%3Ccircle cx='300' cy='200' r='60' fill='%2357c5b6' opacity='0.3'/%3E%3Crect x='100' y='200' width='120' height='100' rx='10' fill='%231a5f7a' opacity='0.8'/%3E%3Crect x='240' y='220' width='100' height='80' rx='10' fill='%2357c5b6' opacity='0.6'/%3E%3Ccircle cx='160' cy='170' r='20' fill='%23ffffff' opacity='0.9'/%3E%3Ccircle cx='220' cy='160' r='15' fill='%23ffffff' opacity='0.7'/%3E%3Crect x='150' y='280' width='200' height='20' rx='5' fill='%231a5f7a' opacity='0.4'/%3E%3Ctext x='250' y='100' text-anchor='middle' font-family='Arial, sans-serif' font-size='18' fill='%231a5f7a' font-weight='bold'%3EStudent Housing%3C/text%3E%3C/g%3E%3C/svg%3E"
                alt="Student housing illustration"
                className="img-fluid"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

// =============================================================================
// COMPONENT: Problem Statement Section
// =============================================================================
const ProblemSection = () => {
  const problems = [
    {
      icon: 'bi bi-search',
      title: 'Tedious Hostel Searching',
      description: 'Students spend weeks "tarmacking" — physically visiting numerous hostels, wasting time and energy on inefficient searches.',
    },
    {
      icon: 'bi bi-exclamation-triangle',
      title: 'Fraudulent Agents & Scams',
      description: 'Unscrupulous agents demand fees for fake listings or nonexistent rooms, exploiting desperate students.',
    },
    {
      icon: 'bi bi-house-x',
      title: 'Poor-Quality Housing',
      description: 'Many hostels misrepresent their facilities online. Students discover mold, poor sanitation, or broken amenities only after paying.',
    },
  ];

  return (
    <section id="problems" className="problems-section">
      <Container>
        <Row className="mb-5">
          <Col className="text-center">
            <span className="section-badge">The Problem</span>
            <h2 className="section-title mt-2">Why Finding Student Housing is Challenging</h2>
            <p className="section-subtitle">
              Kenyan university students face significant obstacles when searching for off-campus accommodation
            </p>
          </Col>
        </Row>

        <Row className="g-4">
          {problems.map((problem, index) => (
            <Col key={index} md={4}>
              <Card className="problem-card h-100 border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="problem-icon mb-3">
                    <i className={`bi ${problem.icon} fs-1`}></i>
                  </div>
                  <h5 className="problem-title">{problem.title}</h5>
                  <p className="problem-description text-muted">{problem.description}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

// =============================================================================
// COMPONENT: How It Works Section
// =============================================================================
const HowItWorksSection = () => {
  const steps = [
    {
      number: '01',
      title: 'Search & Compare',
      description: 'Browse verified listings with detailed photos, amenities, and reviews from real students.',
      icon: 'bi bi-search',
    },
    {
      number: '02',
      title: 'Connect Directly',
      description: 'Contact landlords directly through our secure messaging system — no middlemen or agent fees.',
      icon: 'bi bi-chat-dots',
    },
    {
      number: '03',
      title: 'Visit & Decide',
      description: 'Schedule viewings at your convenience. Take your time to make the right choice.',
      icon: 'bi bi-calendar-check',
    },
    {
      number: '04',
      title: 'Book Securely',
      description: 'Complete your booking with confidence. Our verification system protects you from scams.',
      icon: 'bi bi-shield-check',
    },
  ];

  return (
    <section id="how-it-works" className="how-it-works-section">
      <Container>
        <Row className="mb-5">
          <Col className="text-center">
            <span className="section-badge">How It Works</span>
            <h2 className="section-title mt-2">Find Your Perfect Hostel in 4 Simple Steps</h2>
            <p className="section-subtitle">
              Our platform makes it easy to find and book verified student housing
            </p>
          </Col>
        </Row>

        <Row className="g-4">
          {steps.map((step, index) => (
            <Col key={index} xs={12} sm={6} lg={3}>
              <div className="step-card text-center h-100">
                <div className="step-number mb-3">{step.number}</div>
                <div className="step-icon mb-3">
                  <i className={`bi ${step.icon} fs-2`}></i>
                </div>
                <h5 className="step-title">{step.title}</h5>
                <p className="step-description text-muted">{step.description}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

// =============================================================================
// COMPONENT: Features Section
// =============================================================================
const FeaturesSection = () => {
  const features = [
    {
      icon: 'bi bi-patch-check-fill',
      title: '100% Verified Landlords',
      description: 'Every landlord undergoes thorough verification including identity checks, property ownership verification, and background screening.',
    },
    {
      icon: 'bi bi-star-fill',
      title: 'Honest Student Reviews',
      description: 'Read authentic reviews from verified students who have lived in the hostels. No fake reviews — just honest feedback.',
    },
    {
      icon: 'bi bi-currency-exchange',
      title: 'Transparent Pricing',
      description: 'No hidden fees or surprise charges. See the full cost breakdown including deposit, rent, and any additional expenses upfront.',
    },
    {
      icon: 'bi bi-geo-alt-fill',
      title: 'Location Insights',
      description: 'Find hostels close to your university with information about nearby shops, hospitals, and public transportation.',
    },
  ];

  return (
    <section id="features" className="features-section">
      <Container>
        <Row className="mb-5">
          <Col className="text-center">
            <span className="section-badge">Why Choose Us</span>
            <h2 className="section-title mt-2">The Hostel Connect Difference</h2>
            <p className="section-subtitle">
              We're building the most trusted student housing platform in Kenya
            </p>
          </Col>
        </Row>

        <Row className="g-4">
          {features.map((feature, index) => (
            <Col key={index} md={6} lg={3}>
              <div className="feature-card h-100 text-center p-4 rounded-4">
                <div className="feature-icon mb-3">
                  <i className={`bi ${feature.icon} fs-1`}></i>
                </div>
                <h5 className="feature-title">{feature.title}</h5>
                <p className="feature-description text-muted">{feature.description}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

// =============================================================================
// COMPONENT: Trust Section
// =============================================================================
const TrustSection = () => {
  const trustMetrics = [
    { value: '10,000+', label: 'Active Users' },
    { value: '500+', label: 'Verified Hostels' },
    { value: '50+', label: 'Partner Universities' },
    { value: '98%', label: 'Satisfaction Rate' },
  ];

  return (
    <section className="trust-section">
      <Container>
        <Row className="align-items-center">
          <Col lg={6} className="mb-4 mb-lg-0">
            <span className="section-badge">Trusted by Students</span>
            <h2 className="section-title mt-2">Join Thousands of Happy Students</h2>
            <p className="trust-description">
              Hostel Connect has helped thousands of university students find safe, verified, and affordable accommodation. Join our community today and experience the difference.
            </p>
            <Button variant="primary" size="lg" as={Link} to="/hostels" className="mt-3">
              <i className="bi bi-search me-2"></i>
              Start Searching
            </Button>
          </Col>
          <Col lg={6}>
            <Row className="g-4">
              {trustMetrics.map((metric, index) => (
                <Col key={index} xs={6}>
                  <div className="trust-metric-card text-center p-4 rounded-4">
                    <h3 className="trust-metric-value">{metric.value}</h3>
                    <p className="trust-metric-label text-muted mb-0">{metric.label}</p>
                  </div>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

// =============================================================================
// COMPONENT: Safety Tips Section
// =============================================================================
const SafetyTipsSection = () => {
  const tips = [
    {
      icon: 'bi bi-cash-coin',
      title: 'Never Pay Viewing Fees',
      description: 'Genuine landlords don\'t charge for viewings. If an agent asks for money before showing a property, it\'s likely a scam.',
    },
    {
      icon: 'bi bi-file-earmark-text',
      title: 'Get Everything in Writing',
      description: 'Always get your rental agreement in writing. Read carefully before signing and keep a copy of the contract.',
    },
    {
      icon: 'bi bi-camera',
      title: 'Document the Property',
      description: 'Take photos of the property before moving in. Document any existing damage to avoid disputes when moving out.',
    },
    {
      icon: 'bi bi-person-badge',
      title: 'Verify Landlord Identity',
      description: 'Ask for identification and verify the landlord owns the property. Our verified badges help you identify trusted landlords.',
    },
  ];

  return (
    <section id="safety" className="safety-section">
      <Container>
        <Row className="mb-5">
          <Col className="text-center">
            <span className="section-badge">Stay Safe</span>
            <h2 className="section-title mt-2">Student Housing Safety Tips</h2>
            <p className="section-subtitle">
              Protect yourself from rental scams with these essential tips
            </p>
          </Col>
        </Row>

        <Row className="g-4">
          {tips.map((tip, index) => (
            <Col key={index} md={6} lg={3}>
              <div className="safety-tip-card h-100 p-4 rounded-4">
                <div className="safety-icon mb-3">
                  <i className={`bi ${tip.icon} fs-1`}></i>
                </div>
                <h5 className="safety-title">{tip.title}</h5>
                <p className="safety-description text-muted">{tip.description}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

// =============================================================================
// COMPONENT: Footer
// =============================================================================
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-section">
      <Container>
        <Row className="g-4 mb-4">
          <Col lg={4} className="mb-4 mb-lg-0">
            <div className="footer-brand">
              <h5 className="footer-brand-name mb-3">
                <i className="bi bi-house-door-fill me-2"></i>
                Hostel Connect
              </h5>
              <p className="footer-description">
                The trusted platform for finding verified student housing in Kenya. No agents, no scams — just safe, comfortable homes for students.
              </p>
            </div>
          </Col>
          <Col sm={6} lg={2}>
            <h6 className="footer-heading">Quick Links</h6>
            <ul className="footer-links list-unstyled">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/hostels">Find Hostels</Link></li>
              <li><Link to="/register">List Your Hostel</Link></li>
              <li><Link to="/#how-it-works">How It Works</Link></li>
            </ul>
          </Col>
          <Col sm={6} lg={3}>
            <h6 className="footer-heading">Resources</h6>
            <ul className="footer-links list-unstyled">
              <li><Link to="/#safety">Safety Tips</Link></li>
              <li><Link to="/#features">Why Choose Us</Link></li>
              <li><Link to="/#problems">Student Housing Guide</Link></li>
              <li><Link to="/register">Become a Landlord</Link></li>
            </ul>
          </Col>
          <Col sm={6} lg={3}>
            <h6 className="footer-heading">Contact</h6>
            <ul className="footer-links list-unstyled">
              <li><i className="bi bi-envelope me-2"></i>support@hostelconnect.co.ke</li>
              <li><i className="bi bi-telephone me-2"></i>+254 700 000 000</li>
              <li><i className="bi bi-geo-alt me-2"></i>Nairobi, Kenya</li>
            </ul>
          </Col>
        </Row>
        <Row className="border-top pt-4">
          <Col className="text-center">
            <p className="footer-copyright mb-0">
              &copy; {currentYear} Hostel Connect. All rights reserved.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

// =============================================================================
// COMPONENT: Main Landing Page
// =============================================================================
const LandingPage = () => {
  return (
    <div className="landing-page">
      <Navigation />
      <main>
        <HeroSection />
        <ProblemSection />
        <HowItWorksSection />
        <FeaturesSection />
        <TrustSection />
        <SafetyTipsSection />
      </main>
      <Footer />
      <SkipLink />
    </div>
  );
};

// =============================================================================
// COMPONENT: Main App
// =============================================================================
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/hostels" element={<Hostels />} />
            <Route path="/hostels/:id" element={<HostelDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/404" element={<NotFoundPage />} />

            {/* Protected Landlord Routes */}
            <Route
              path="/landlord/dashboard/*"
              element={
                <ProtectedRoute allowedRoles={['landlord', 'admin']}>
                  <LandlordDashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected Student Routes */}
            <Route
              path="/student/dashboard/*"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Redirect unknown routes to 404 */}
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
};

export default App;
