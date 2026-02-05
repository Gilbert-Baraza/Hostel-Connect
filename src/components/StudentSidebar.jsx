import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

/**
 * StudentSidebar Component
 * Sidebar navigation for student dashboard
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Sidebar open state for mobile
 * @param {Function} props.setIsOpen - Function to toggle sidebar
 */
const StudentSidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/student/dashboard', icon: 'bi-grid-1x2', label: 'Dashboard Home' },
    { path: '/student/dashboard/saved', icon: 'bi-heart-fill', label: 'Saved Hostels' },
    { path: '/student/dashboard/requests', icon: 'bi-inbox', label: 'My Requests' },
    { path: '/student/dashboard/safety', icon: 'bi-shield-check', label: 'Safety & Verification' },
    { path: '/student/dashboard/profile', icon: 'bi-person', label: 'Profile' },
  ];

  const isActive = (path) => {
    if (path === '/student/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="sidebar-overlay d-lg-none" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`student-sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="d-flex align-items-center">
            <i className="bi bi-house-door-fill me-2"></i>
            <span className="fw-bold">Hostel Connect</span>
          </div>
          <span className="badge bg-success">Student</span>
        </div>

        <Nav className="sidebar-nav flex-column">
          {menuItems.map((item) => (
            <Nav.Link
              key={item.path}
              as={Link}
              to={item.path}
              className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              <i className={`bi ${item.icon} me-2`}></i>
              <span>{item.label}</span>
            </Nav.Link>
          ))}
        </Nav>

        <div className="sidebar-footer">
          <Nav.Link 
            href="/"
            className="sidebar-link text-danger"
          >
            <i className="bi bi-box-arrow-left me-2"></i>
            <span>Back to Site</span>
          </Nav.Link>
        </div>
      </aside>

      <style>{`
        .student-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: 260px;
          background: linear-gradient(180deg, #198754 0%, #146c43 100%);
          z-index: 1050;
          transform: translateX(-100%);
          transition: transform 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .student-sidebar.sidebar-open {
          transform: translateX(0);
        }

        @media (min-width: 992px) {
          .student-sidebar {
            transform: translateX(0);
          }
        }

        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1040;
        }

        .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem 0;
        }

        .sidebar-link {
          padding: 0.875rem 1.5rem;
          color: rgba(255, 255, 255, 0.8) !important;
          border-left: 3px solid transparent;
          transition: all 0.2s ease;
        }

        .sidebar-link:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white !important;
        }

        .sidebar-link.active {
          background: rgba(255, 255, 255, 0.15);
          color: white !important;
          border-left-color: #57c5b6;
        }

        .sidebar-footer {
          padding: 1rem 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </>
  );
};

export default StudentSidebar;
