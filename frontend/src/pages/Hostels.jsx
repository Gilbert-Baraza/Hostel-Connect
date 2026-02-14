import React, { useState, useEffect } from 'react';
import { Button, Container } from 'react-bootstrap';
import HostelList from '../components/HostelList';
import HostelsSidebar from '../components/HostelsSidebar';
import useDocumentTitle from '../hooks/useDocumentTitle';

/**
 * Hostels Page Component
 * Main page for browsing and searching hostels
 */
const Hostels = () => {
  useDocumentTitle('Find Hostels', { append: true });
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      <Button
        variant="primary"
        className="mobile-sidebar-toggle d-lg-none position-fixed"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle navigation"
      >
        <i className={`bi ${sidebarOpen ? 'bi-x' : 'bi-list'} fs-4`}></i>
      </Button>

      <HostelsSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="hostels-main">
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
      </main>
    </div>
  );
};

export default Hostels;
