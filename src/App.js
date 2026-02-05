import React, { useState } from 'react';
import { Navbar, Nav, Container, Button, Form, Row, Col, Card } from 'react-bootstrap';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Hostels from './pages/Hostels';
import HostelDetails from './pages/HostelDetails';
import Login from './pages/Login';
import Register from './pages/Register';

/**
 * Hostel Connect - Landing Page
 */

// =============================================================================
// COMPONENT: Navbar (Sticky, Responsive)
// =============================================================================
const Navigation = () => {
  const [expanded, setExpanded] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/hostels', label: 'Find Hostels' },
    { href: '/#how-it-works', label: 'How It Works', isAnchor: true },
  ];

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
                onClick={() => setExpanded(false)}
              >
                {link.label}
              </Nav.Link>
            ))}
          </Nav>

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
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

// =============================================================================
// COMPONENT: Hero Section with Search Bar
// =============================================================================
const HeroSection = () => {
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
                      />
                    </Col>
                    <Col xs={12} md={3}>
                      <Form.Select className="form-select">
                        <option value="">Select Budget</option>
                        <option value="5000">1500 - 2000</option>
                        <option value="15000">2000 - 3000</option>
                        <option value="20000">3000 - 4000</option>
                        <option value="25000">4000 - 5000</option>
                      
                      </Form.Select>
                    </Col>
                    <Col xs={12} md={3}>
                      <Form.Select className="form-select">
                        <option value="">Hostel Type</option>
                        <option value="male">Male Hostel</option>
                        <option value="female">Female Hostel</option>
                        <option value="mixed">Mixed Hostel</option>
                      </Form.Select>
                    </Col>
                    <Col xs={12} md={2}>
                      <Button
                        variant="primary"
                        className="btn-search w-100"
                        type="button"
                        as={Link}
                        to="/hostels"
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
    {
      icon: 'bi bi-eye-slash',
      title: 'Lack of Transparency',
      description: 'Hidden fees, unclear pricing, and vague amenity lists make it difficult to compare options fairly.',
    },
  ];

  return (
    <section className="section-padding bg-light">
      <Container>
        <div className="text-center mb-5">
          <h2 className="section-title">The Student Housing Struggle</h2>
          <p className="section-subtitle">
            Finding the right off-campus hostel shouldn't be this hard. Here's what students face every year.
          </p>
        </div>

        <Row>
          {problems.map((problem, index) => (
            <Col key={index} md={6} lg={3} className="mb-4">
              <Card className="problem-card h-100">
                <Card.Body>
                  <div className="icon-box icon-box-primary mb-3 mx-auto">
                    <i className={`bi ${problem.icon}`}></i>
                  </div>
                  <Card.Title className="h5 fw-bold mb-3 text-center">
                    {problem.title}
                  </Card.Title>
                  <Card.Text className="text-muted text-center">
                    {problem.description}
                  </Card.Text>
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
// COMPONENT: Solution / Value Proposition Section
// =============================================================================
const SolutionSection = () => {
  const solutions = [
    {
      icon: 'bi bi-patch-check',
      title: 'Verified Landlords & Listings',
      description: 'Every landlord undergoes a strict verification process. All listings are manually reviewed before going live.',
    },
    {
      icon: 'bi bi-info-circle',
      title: 'Transparent Details',
      description: 'View complete hostel information — amenities, distance to campus, pricing, photos, and real student reviews.',
    },
    {
      icon: 'bi bi-building',
      title: 'Centralized Platform',
      description: 'Browse hundreds of hostels in one place. Filter by budget, location, amenities, and preferences.',
    },
    {
      icon: 'bi bi-clock-history',
      title: 'Time-Saving Search',
      description: 'Find and book your ideal hostel in minutes, not weeks. No more endless campus visits.',
    },
  ];

  return (
    <section className="section-padding">
      <Container>
        <Row className="align-items-center">
          <Col lg={6} className="mb-4 mb-lg-0">
            <img
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 400'%3E%3Crect fill='%23ffffff' width='500' height='400' rx='20'/%3E%3Crect x='50' y='50' width='180' height='120' rx='10' fill='%231a5f7a' opacity='0.1'/%3E%3Crect x='270' y='80' width='180' height='120' rx='10' fill='%2357c5b6' opacity='0.2'/%3E%3Crect x='80' y='80' width='100' height='60' rx='5' fill='%231a5f7a' opacity='0.3'/%3E%3Crect x='300' y='110' width='100' height='60' rx='5' fill='%2357c5b6' opacity='0.4'/%3E%3Ccircle cx='130' cy='200' r='30' fill='%231a5f7a' opacity='0.5'/%3E%3Ccircle cx='350' cy='220' r='25' fill='%2357c5b6' opacity='0.5'/%3E%3Crect x='50' y='250' width='400' height='20' rx='5' fill='%23e9ecef'/%3E%3Crect x='50' y='280' width='400' height='20' rx='5' fill='%23e9ecef'/%3E%3Crect x='50' y='310' width='300' height='20' rx='5' fill='%23e9ecef'/%3E%3Ctext x='250' y='370' text-anchor='middle' font-family='Arial, sans-serif' font-size='14' fill='%231a5f7a'%3ESimple. Transparent. Trusted.%3C/text%3E%3C/svg%3E"
              alt="Solution illustration"
              className="img-fluid"
            />
          </Col>

          <Col lg={6}>
            <div className="ps-lg-5">
              <h2 className="section-title">What Hostel Connect solves</h2>
              <p className="text-muted mb-4">
                We've built a platform that puts students first — eliminating the stress, scams, and uncertainty from your hostel search.
              </p>

              <Row>
                {solutions.map((solution, index) => (
                  <Col key={index} xs={12} className="mb-3">
                    <div className="d-flex align-items-start">
                      <div className="icon-box icon-box-secondary me-3 flex-shrink-0">
                        <i className={`bi ${solution.icon}`}></i>
                      </div>
                      <div>
                        <h5 className="fw-bold mb-1">{solution.title}</h5>
                        <p className="text-muted mb-0">{solution.description}</p>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>

              <div className="mt-4">
                <Button variant="primary" className="btn-primary-custom" as={Link} to="/hostels">
                  Find Hostels Now
                  <i className="bi bi-arrow-right ms-2"></i>
                </Button>
              </div>
            </div>
          </Col>
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
      icon: 'bi bi-geo-alt',
      stepNumber: '1',
      title: 'Search Hostels',
      description: 'Enter your university location and browse verified hostels nearby with advanced filters.',
    },
    {
      icon: 'bi bi-card-checklist',
      stepNumber: '2',
      title: 'View Verified Listings',
      description: 'Explore detailed profiles with photos, amenities, pricing, and verified student reviews.',
    },
    {
      icon: 'bi bi-chat-dots',
      stepNumber: '3',
      title: 'Contact Landlords',
      description: 'Message verified landlords directly through our secure platform to schedule viewings.',
    },
    {
      icon: 'bi bi-house-check',
      stepNumber: '4',
      title: 'Book Your Hostel',
      description: 'Find your perfect fit and secure your room with confidence and peace of mind.',
    },
  ];

  return (
    <section id="how-it-works" className="section-padding bg-light">
      <Container>
        <div className="text-center mb-5">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">
            Finding your next home is simple — just 4 easy steps
          </p>
        </div>

        <Row>
          {steps.map((step, index) => (
            <Col key={index} sm={6} lg={3} className="mb-4">
              <div className="text-center">
                <div className="step-icon mx-auto position-relative">
                  <i className={`bi ${step.icon}`}></i>
                  <span className="step-number">{step.stepNumber}</span>
                </div>
                <h4 className="fw-bold mt-3 mb-2">{step.title}</h4>
                <p className="text-muted">{step.description}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

// =============================================================================
// COMPONENT: Key Features Section
// =============================================================================
const FeaturesSection = () => {
  const features = [
    {
      icon: 'bi bi-patch-check-fill',
      title: 'Verified Hostels',
      description: 'All listings go through our verification process to ensure quality and authenticity.',
    },
    {
      icon: 'bi bi-camera-fill',
      title: 'Real Photos & Amenities',
      description: 'Browse actual photos and detailed amenity lists to make informed decisions.',
    },
    {
      icon: 'bi bi-currency-dollar',
      title: 'No Agents, No Fees',
      description: 'Connect directly with landlords. No middlemen, no hidden viewing fees.',
    },
    {
      icon: 'bi bi-shield-check',
      title: 'Secure Platform',
      description: 'Your data is protected. Report suspicious listings and stay safe.',
    },
    {
      icon: 'bi bi-people-fill',
      title: 'Student-Focused',
      description: 'Designed by students, for students. We understand your needs and budget.',
    },
    {
      icon: 'bi bi-star-fill',
      title: 'Student Reviews',
      description: 'Read authentic reviews from current and past tenants.',
    },
  ];

  return (
    <section className="section-padding">
      <Container>
        <div className="text-center mb-5">
          <h2 className="section-title">Key Features</h2>
          <p className="section-subtitle">
            Everything you need to find your perfect student accommodation
          </p>
        </div>

        <Row>
          {features.map((feature, index) => (
            <Col key={index} sm={6} lg={4} className="mb-4">
              <Card className="feature-card h-100">
                <Card.Body className="text-center">
                  <div className="icon-box icon-box-accent mx-auto mb-3">
                    <i className={`bi ${feature.icon}`}></i>
                  </div>
                  <Card.Title className="h5 fw-bold mb-2">
                    {feature.title}
                  </Card.Title>
                  <Card.Text className="text-muted">
                    {feature.description}
                  </Card.Text>
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
// COMPONENT: Trust & Transparency Section
// =============================================================================
const TrustSection = () => {
  const trustItems = [
    {
      icon: 'bi bi-patch-check-fill',
      title: 'Verified Badge',
      description: 'Landlords must verify their identity and property documents before listing.',
    },
    {
      icon: 'bi bi-check-circle-fill',
      title: 'Admin-Approved Listings',
      description: 'Our team reviews every listing to ensure accuracy and quality standards.',
    },
    {
      icon: 'bi bi-shield-fill',
      title: 'Fraud Prevention',
      description: 'Report suspicious activity. We actively investigate and remove fake listings.',
    },
    {
      icon: 'bi bi-person-check-fill',
      title: 'Real Student Reviews',
      description: 'Only verified students can leave reviews, ensuring authentic feedback.',
    },
  ];

  return (
    <section className="section-padding bg-light">
      <Container>
        <Row className="align-items-center">
          <Col lg={6} className="mb-4 mb-lg-0">
            <h2 className="section-title">Why Students Trust Hostel Connect</h2>
            <p className="text-muted mb-4">
              We've built a platform based on trust, transparency, and student safety.
              Here's what makes us different:
            </p>

            <Row>
              {trustItems.map((item, index) => (
                <Col key={index} xs={12} className="mb-3">
                  <div className="d-flex align-items-start">
                    <div
                      className="icon-box icon-box-primary flex-shrink-0 me-3"
                      style={{ width: '50px', height: '50px', fontSize: '20px' }}
                    >
                      <i className={`bi ${item.icon}`}></i>
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1">{item.title}</h6>
                      <p className="text-muted mb-0 small">{item.description}</p>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Col>

          <Col lg={6}>
            <Card className="border-0 shadow-lg">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <div
                    className="icon-box icon-box-secondary mx-auto"
                    style={{ width: '80px', height: '80px', fontSize: '36px' }}
                  >
                    <i className="bi bi-award-fill"></i>
                  </div>
                  <h4 className="fw-bold mt-3">Student Satisfaction Guarantee</h4>
                  <p className="text-muted">
                    Your satisfaction is our priority. If you encounter any issues,
                    our support team is here to help.
                  </p>
                </div>

                {/* Placeholder Testimonials */}
                <div className="border-top pt-4">
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <div
                        className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white me-3"
                        style={{ width: '40px', height: '40px' }}
                      >
                        <i className="bi bi-person-fill"></i>
                      </div>
                      <div>
                        <h6 className="fw-bold mb-0">Treva O.G</h6>
                        <small className="text-muted">Kibabii University</small>
                      </div>
                    </div>
                    <p className="text-muted small mb-0">
                      "Found my perfect hostel in just 2 days! No agents, no scams.
                      Hostel Connect made my search so easy."
                    </p>
                  </div>

                  <div>
                    <div className="d-flex align-items-center mb-2">
                      <div
                        className="bg-secondary rounded-circle d-flex align-items-center justify-content-center text-white me-3"
                        style={{ width: '40px', height: '40px' }}
                      >
                        <i className="bi bi-person-fill"></i>
                      </div>
                      <div>
                        <h6 className="fw-bold mb-0">Gilbert B.W</h6>
                        <small className="text-muted">Kibabii University</small>
                      </div>
                    </div>
                    <p className="text-muted small mb-0">
                      "The verified listings feature gave me peace of mind.
                      Highly recommend for any student looking for housing."
                    </p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

// =============================================================================
// COMPONENT: Call to Action Section
// =============================================================================
const CTASection = () => {
  return (
    <section className="cta-section">
      <Container>
        <div className="text-center">
          <h2 className="cta-title">Stop Tarmacking. Find Your Next Hostel Online.</h2>
          <p className="cta-subtitle">
            Join thousands of students who found their perfect hostel without the stress.
          </p>
          <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
            <Button
              variant="light"
              className="btn-light-custom"
              as={Link}
              to="/hostels"
            >
              <i className="bi bi-search me-2"></i>
              Find Hostels
            </Button>
            <Button
              variant="outline-light"
              className="btn-outline-light-custom"
              as={Link}
              to="/register"
            >
              <i className="bi bi-building me-2"></i>
              List Your Hostel
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
};

// =============================================================================
// COMPONENT: Footer
// =============================================================================
const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { label: 'About Us', href: '/#about' },
      { label: 'How It Works', href: '/#how-it-works' },
      { label: 'Careers', href: '#careers' },
      { label: 'Press', href: '#press' },
    ],
    support: [
      { label: 'Help Center', href: '#help' },
      { label: 'Contact Us', href: '#contact' },
      { label: 'FAQs', href: '#faqs' },
      { label: 'Report a Problem', href: '#report' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '#privacy' },
      { label: 'Terms of Service', href: '#terms' },
      { label: 'Cookie Policy', href: '#cookies' },
    ],
  };

  return (
    <footer className="footer-section">
      <Container>
        <Row>
          <Col lg={4} className="mb-4 mb-lg-0">
            <div className="footer-brand mb-4">
              <h4 className="fw-bold text-white">
                <i className="bi bi-house-door-fill me-2"></i>
                Hostel Connect
              </h4>
              <p className="text-white-50 mb-3">
                Connecting university students with verified off-campus hostels.
                No agents, no scams — just trusted housing solutions.
              </p>
              <div className="d-flex gap-3">
                <a href="#facebook" className="text-white-50 fs-5">
                  <i className="bi bi-facebook"></i>
                </a>
                <a href="#twitter" className="text-white-50 fs-5">
                  <i className="bi bi-twitter-x"></i>
                </a>
                <a href="#instagram" className="text-white-50 fs-5">
                  <i className="bi bi-instagram"></i>
                </a>
                <a href="#linkedin" className="text-white-50 fs-5">
                  <i className="bi bi-linkedin"></i>
                </a>
              </div>
            </div>
          </Col>

          <Col sm={6} lg={2} className="mb-4 mb-sm-0">
            <h5 className="footer-title">Company</h5>
            <ul className="footer-links">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </Col>

          <Col sm={6} lg={2} className="mb-4 mb-sm-0">
            <h5 className="footer-title">Support</h5>
            <ul className="footer-links">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </Col>

          <Col lg={4}>
            <h5 className="footer-title">Contact Us</h5>
            <ul className="footer-links">
              <li>
                <i className="bi bi-envelope-fill me-2"></i>
                support@hostelconnect.com
              </li>
              <li>
                <i className="bi bi-telephone-fill me-2"></i>
                +254705049184
              </li>
              <li>
                <i className="bi bi-geo-alt-fill me-2"></i>
                Kenya(Serving students nationwide)
              </li>
            </ul>
          </Col>
        </Row>

        <div className="footer-bottom text-center text-md-start">
          <Row className="align-items-center">
            <Col md={6} className="mb-3 mb-md-0">
              <p className="mb-0 text-white-50">
                © {currentYear} Hostel Connect. All rights reserved.
              </p>
            </Col>
            <Col md={6}>
              <ul className="footer-links d-flex justify-content-md-end gap-4 mb-0">
                {footerLinks.legal.map((link, index) => (
                  <li key={index}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </Col>
          </Row>
        </div>
      </Container>
    </footer>
  );
};

// =============================================================================
// MAIN APP COMPONENT
// =============================================================================
function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/" element={
            <>
              <HeroSection />
              <ProblemSection />
              <SolutionSection />
              <HowItWorksSection />
              <FeaturesSection />
              <TrustSection />
              <CTASection />
              <Footer />
            </>
          } />
          <Route path="/hostels" element={<Hostels />} />
          <Route path="/hostels/:id" element={<HostelDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
