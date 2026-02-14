import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

/**
 * HostelsSidebar Component
 * Sidebar navigation for the hostels browsing page
 */
const HostelsSidebar = ({ isOpen, setIsOpen }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const role = user?.role;

  const isExact = (path) => location.pathname === path || location.pathname === `${path}/`;
  const isSection = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  const baseItems = [
    {
      path: '/',
      icon: 'bi-house-fill',
      label: 'Home',
      isActive: () => location.pathname === '/'
    },
    {
      path: '/hostels',
      icon: 'bi-building',
      label: 'Find Hostels',
      isActive: () => isSection('/hostels')
    }
  ];

  const studentItems = [
    {
      path: '/student/dashboard',
      icon: 'bi-speedometer2',
      label: 'My Dashboard',
      isActive: () => isExact('/student/dashboard')
    },
    {
      path: '/student/dashboard/saved',
      icon: 'bi-heart-fill',
      label: 'Saved Hostels',
      isActive: () => isSection('/student/dashboard/saved')
    },
    {
      path: '/student/dashboard/requests',
      icon: 'bi-inbox',
      label: 'My Requests',
      isActive: () => isSection('/student/dashboard/requests')
    }
  ];

  const landlordItems = [
    {
      path: '/landlord/dashboard',
      icon: 'bi-speedometer2',
      label: 'My Dashboard',
      isActive: () => isExact('/landlord/dashboard')
    },
    {
      path: '/landlord/dashboard/hostels',
      icon: 'bi-building',
      label: 'My Listings',
      isActive: () => isSection('/landlord/dashboard/hostels')
    },
    {
      path: '/landlord/dashboard/requests',
      icon: 'bi-inbox',
      label: 'Booking Requests',
      isActive: () => isSection('/landlord/dashboard/requests')
    }
  ];

  const adminItems = [
    {
      path: '/admin/dashboard',
      icon: 'bi-speedometer2',
      label: 'Admin Dashboard',
      isActive: () => isExact('/admin/dashboard')
    },
    {
      path: '/admin/hostel-verification',
      icon: 'bi-building-check',
      label: 'Hostel Verification',
      isActive: () => isSection('/admin/hostel-verification')
    },
    {
      path: '/admin/users',
      icon: 'bi-people',
      label: 'Manage Users',
      isActive: () => isSection('/admin/users')
    }
  ];

  const guestItems = [
    {
      path: '/login',
      icon: 'bi-box-arrow-in-right',
      label: 'Login',
      isActive: () => isExact('/login')
    },
    {
      path: '/register',
      icon: 'bi-person-plus',
      label: 'Register',
      isActive: () => isExact('/register')
    }
  ];

  let roleItems = [];
  if (isAuthenticated) {
    if (role === 'student') {
      roleItems = studentItems;
    } else if (role === 'landlord') {
      roleItems = landlordItems;
    } else if (role === 'admin') {
      roleItems = adminItems;
    }
  } else {
    roleItems = guestItems;
  }

  const items = [...baseItems, ...roleItems];

  const roleLabel = isAuthenticated
    ? role === 'student'
      ? 'Student'
      : role === 'landlord'
        ? 'Landlord'
        : role === 'admin'
          ? 'Admin'
          : 'Member'
    : 'Guest';

  const roleBadgeClass = role === 'student'
    ? 'bg-success'
    : role === 'landlord'
      ? 'bg-warning text-dark'
      : role === 'admin'
        ? 'bg-danger'
        : 'bg-secondary';

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-overlay d-lg-none"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="d-flex align-items-center">
            <i className="bi bi-house-door-fill me-2"></i>
            <span className="fw-bold">Hostel Connect</span>
          </div>
          <span className={`badge ${roleBadgeClass}`}>{roleLabel}</span>
        </div>

        <Nav className="sidebar-nav flex-column">
          {items.map((item) => (
            <Nav.Link
              key={item.path}
              as={Link}
              to={item.path}
              className={`sidebar-link ${item.isActive() ? 'active' : ''}`}
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

export default HostelsSidebar;
