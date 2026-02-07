import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

/**
 * AdminSidebar Component
 * 
 * Navigation sidebar for the admin dashboard.
 * Provides links to all admin sections with role-based access control.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether sidebar is open (mobile)
 * @param {Function} props.setIsOpen - Function to toggle sidebar
 */
const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const { user } = useAuth();
  const location = useLocation();

  /**
   * Check if a nav item is currently active
   * @param {string} path - Path to check
   * @returns {boolean}
   */
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  /**
   * Navigation items configuration
   */
  const navItems = [
    {
      path: '/admin/dashboard',
      label: 'Dashboard Overview',
      icon: 'bi bi-grid-1x2',
      description: 'Platform metrics and health'
    },
    {
      path: '/admin/landlord-verification',
      label: 'Landlord Verification',
      icon: 'bi bi-person-check',
      description: 'Verify and manage landlords'
    },
    {
      path: '/admin/hostel-verification',
      label: 'Hostel Verification',
      icon: 'bi bi-building-check',
      description: 'Review hostel listings'
    },
    {
      path: '/admin/listings',
      label: 'Listings Management',
      icon: 'bi bi-list-ul',
      description: 'Manage all listings'
    },
    {
      path: '/admin/reports',
      label: 'Reports & Flags',
      icon: 'bi bi-flag',
      description: 'Review user reports'
    },
    {
      path: '/admin/users',
      label: 'Users Management',
      icon: 'bi bi-people',
      description: 'Manage platform users'
    },
    {
      path: '/admin/profile',
      label: 'Admin Profile',
      icon: 'bi bi-gear',
      description: 'Account settings'
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'show' : ''}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <aside 
        className={`admin-sidebar ${isOpen ? 'open' : ''}`}
        role="navigation"
        aria-label="Admin navigation"
      >
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <i className="bi bi-shield-gear-fill"></i>
            <span>Hostel Connect</span>
          </div>
          <div className="sidebar-subtitle">Admin Panel</div>
        </div>

        {/* Admin Info */}
        <div className="admin-info">
          <div className="admin-avatar">
            <i className="bi bi-person-fill"></i>
          </div>
          <div className="admin-details">
            <div className="admin-name">{user?.name || 'Admin'}</div>
            <div className="admin-role">
              <i className="bi bi-shield-check me-1"></i>
              Administrator
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <Nav className="sidebar-nav flex-column">
          {/* Home Link - Visible at top for easy navigation */}
          <Nav.Link 
            href="/"
            className="sidebar-link"
          >
            <i className="bi bi-house-fill sidebar-icon"></i>
            <div className="sidebar-text">
              <span className="sidebar-label">Home</span>
              <span className="sidebar-description">Return to homepage</span>
            </div>
          </Nav.Link>
          
          {navItems.map((item) => (
            <Nav.Link
              key={item.path}
              as={Link}
              to={item.path}
              className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
              aria-current={isActive(item.path) ? 'page' : undefined}
            >
              <i className={`bi ${item.icon} sidebar-icon`}></i>
              <div className="sidebar-text">
                <span className="sidebar-label">{item.label}</span>
                <span className="sidebar-description">{item.description}</span>
              </div>
            </Nav.Link>
          ))}
        </Nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-footer-text">
            <i className="bi bi-shield-check me-1"></i>
            Trust & Safety Center
          </div>
        </div>
      </aside>

      {/* Inline Styles */}
      <style>{`
        /* Sidebar Overlay for Mobile */
        .sidebar-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1040;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .sidebar-overlay.show {
          display: block;
          opacity: 1;
        }

        /* Sidebar Base Styles */
        .admin-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: 260px;
          height: 100vh;
          background: linear-gradient(180deg, #1a365d 0%, #2d3748 100%);
          color: #fff;
          z-index: 1050;
          display: flex;
          flex-direction: column;
          transition: transform 0.3s ease;
          box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
        }

        .admin-sidebar.open {
          transform: translateX(0);
        }

        @media (max-width: 991.98px) {
          .admin-sidebar {
            transform: translateX(-100%);
          }

          .admin-sidebar.open {
            transform: translateX(0);
          }
        }

        /* Sidebar Header */
        .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.25rem;
          font-weight: 700;
          color: #fff;
        }

        .sidebar-brand i {
          color: #60a5fa;
          font-size: 1.5rem;
        }

        .sidebar-subtitle {
          font-size: 0.75rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 0.25rem;
        }

        /* Admin Info */
        .admin-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .admin-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #3b82f6;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }

        .admin-details {
          flex: 1;
          min-width: 0;
        }

        .admin-name {
          font-weight: 600;
          font-size: 0.875rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .admin-role {
          font-size: 0.75rem;
          color: #60a5fa;
        }

        /* Navigation */
        .sidebar-nav {
          flex: 1;
          padding: 1rem 0;
          overflow-y: auto;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1.5rem;
          color: #cbd5e1 !important;
          transition: all 0.2s ease;
          border-left: 3px solid transparent;
        }

        .sidebar-link:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #fff !important;
        }

        .sidebar-link.active {
          background: rgba(59, 130, 246, 0.15);
          color: #60a5fa !important;
          border-left-color: #3b82f6;
        }

        .sidebar-icon {
          font-size: 1.25rem;
          width: 24px;
          text-align: center;
          flex-shrink: 0;
        }

        .sidebar-text {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .sidebar-label {
          font-weight: 500;
          font-size: 0.875rem;
        }

        .sidebar-description {
          font-size: 0.7rem;
          color: #94a3b8;
          margin-top: 0.125rem;
        }

        /* Sidebar Footer */
        .sidebar-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .sidebar-footer-text {
          font-size: 0.75rem;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        /* Scrollbar Styling */
        .sidebar-nav::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar-nav::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-nav::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
        }

        .sidebar-nav::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </>
  );
};

export default AdminSidebar;
