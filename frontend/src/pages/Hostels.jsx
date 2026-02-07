import React, { useState, useEffect } from 'react';
import { Container, Breadcrumb } from 'react-bootstrap';
import HostelList from '../components/HostelList';
import { Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';

/**
 * Hostels Page Component
 * Main page for browsing and searching hostels
 */
const Hostels = () => {
  useDocumentTitle('Find Hostels', { append: true });
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="hostels-page">
      {/* Page Header */}
      <section className="page-header-section">
        <Container>
          

          {/* Title & Subtitle */}
          <div className="page-header-content">
            <h1 className="page-title">
              <i className="bi bi-building me-3"></i>
              Find Available Hostels
            </h1>
            <p className="page-subtitle">
              Browse verified off-campus hostels near your university
            </p>
          </div>
        </Container>
      </section>

      {/* Hostel Listings Section */}
      <section className="hostels-content-section">
        <Container>
          <HostelList isMobile={isMobile} />
        </Container>
      </section>
    </div>
  );
};

export default Hostels;
