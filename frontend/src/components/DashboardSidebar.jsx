import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

/**
 * DashboardSidebar Component
 * Persistent sidebar navigation for landlord dashboard
 */
const DashboardSidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/landlord/dashboard', icon: 'bi-grid-1x2', label: 'Dashboard Overview' },
    { path: '/landlord/dashboard/hostels', icon: 'bi-building', label: 'Hostels' },
    { path: '/landlord/dashboard/rooms', icon: 'bi-door-open', label: 'Rooms' },
    { path: '/landlord/dashboard/requests', icon: 'bi-inbox', label: 'Requests' },
    { path: '/landlord/dashboard/profile', icon: 'bi-person', label: 'Profile' },
  ];

  const isActive = (path) => {
    if (path === '/landlord/dashboard') {
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
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="d-flex align-items-center">
            <i className="bi bi-house-door-fill me-2"></i>
            <span className="fw-bold">Hostel Connect</span>
          </div>
          <span className="badge bg-warning text-dark">Landlord</span>
        </div>

        <Nav className="sidebar-nav flex-column">
          {/* Home Link - Visible at top for easy navigation */}
          <Nav.Link 
            href="/"
            className="sidebar-link"
          >
            <i className="bi bi-house-fill me-2"></i>
            <span>Home</span>
          </Nav.Link>
          
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
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
