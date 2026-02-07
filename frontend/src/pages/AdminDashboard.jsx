import React, { useState } from 'react';
import { Container, Row, Col, Button, Breadcrumb } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import AdminOverview from '../components/AdminOverview';
import LandlordVerification from '../components/LandlordVerification';
import HostelVerification from '../components/HostelVerification';
import ListingsManager from '../components/ListingsManager';
import ReportsManager from '../components/ReportsManager';
import UsersManager from '../components/UsersManager';
import AdminProfile from '../components/AdminProfile';

/**
 * AdminDashboard Main Page
 * 
 * Comprehensive admin dashboard for platform management.
 * Includes sidebar navigation, routing, and all admin features.
 * 
 * Features:
 * - Sidebar navigation with mobile support
 * - Dashboard overview with metrics
 * - Landlord and hostel verification
 * - Listings management
 * - Reports and fraud flags
 * - Users management
 * - Admin profile
 * 
 * Route: /admin/dashboard
 * Protected: admin role only
 */
const AdminDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /**
   * Determine current section from URL
   */
  const getCurrentSection = () => {
    const path = location.pathname;
    if (path === '/admin/dashboard' || path === '/admin/dashboard/') {
      return 'overview';
    }
    if (path.includes('/landlord-verification')) return 'landlord-verification';
    if (path.includes('/hostel-verification')) return 'hostel-verification';
    if (path.includes('/listings')) return 'listings';
    if (path.includes('/reports')) return 'reports';
    if (path.includes('/users')) return 'users';
    if (path.includes('/profile')) return 'profile';
    return 'overview';
  };

  const currentSection = getCurrentSection();

  /**
   * Get page title based on section
   */
  const getPageTitle = () => {
    switch (currentSection) {
      case 'overview': return 'Dashboard';
      case 'landlord-verification': return 'Landlord Verification';
      case 'hostel-verification': return 'Hostel Verification';
      case 'listings': return 'Listings Management';
      case 'reports': return 'Reports & Flags';
      case 'users': return 'Users Management';
      case 'profile': return 'Admin Profile';
      default: return 'Dashboard';
    }
  };

  /**
   * Get breadcrumb items
   */
  const getBreadcrumbItems = () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Admin Dashboard' }
    ];
    
    if (currentSection !== 'overview') {
      items.splice(1, 0, { label: getPageTitle(), active: true });
    }
    
    return items;
  };

  /**
   * Handle section navigation
   * @param {string} section - Section to navigate to
   */
  const handleNavigate = (section) => {
    switch (section) {
      case 'landlord-verification':
        navigate('/admin/landlord-verification');
        break;
      case 'hostel-verification':
        navigate('/admin/hostel-verification');
        break;
      case 'reports':
        navigate('/admin/reports');
        break;
      default:
        navigate('/admin/dashboard');
    }
  };

  /**
   * Render the appropriate section
   */
  const renderSection = () => {
    switch (currentSection) {
      case 'overview':
        return <AdminOverview onNavigate={handleNavigate} />;
      
      case 'landlord-verification':
        return (
          <LandlordVerification
            onVerificationUpdate={(id, status) => {
              console.log(`Landlord ${id} status updated to: ${status}`);
            }}
          />
        );
      
      case 'hostel-verification':
        return (
          <HostelVerification
            onVerificationUpdate={(id, status) => {
              console.log(`Hostel ${id} status updated to: ${status}`);
            }}
          />
        );
      
      case 'listings':
        return (
          <ListingsManager
            onListingUpdate={(id, status) => {
              console.log(`Listing ${id} status updated to: ${status}`);
            }}
          />
        );
      
      case 'reports':
        return (
          <ReportsManager
            onReportUpdate={(id, status) => {
              console.log(`Report ${id} status updated to: ${status}`);
            }}
          />
        );
      
      case 'users':
        return (
          <UsersManager
            onUserUpdate={(id, status) => {
              console.log(`User ${id} status updated to: ${status}`);
            }}
          />
        );
      
      case 'profile':
        return (
          <AdminProfile
            onPasswordChange={() => {
              console.log('Password change requested');
            }}
          />
        );
      
      default:
        return <AdminOverview onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Mobile Toggle Button */}
      <Button 
        variant="primary"
        className="mobile-sidebar-toggle d-lg-none position-fixed"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{ 
          top: '80px', 
          left: '10px', 
          zIndex: 1060,
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          padding: '0'
        }}
      >
        <i className={`bi ${sidebarOpen ? 'bi-x' : 'bi-list'} fs-4`}></i>
      </Button>

      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="dashboard-content">
        <Container fluid className="px-4 py-4">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-3">
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
              <i className="bi bi-house-fill me-1"></i> Home
            </Breadcrumb.Item>
            <Breadcrumb.Item active>
              <i className="bi bi-shield-gear me-1"></i>
              Admin Dashboard
            </Breadcrumb.Item>
            {currentSection !== 'overview' && (
              <Breadcrumb.Item active>
                {getPageTitle()}
              </Breadcrumb.Item>
            )}
          </Breadcrumb>

          {/* Main Content */}
          {renderSection()}
        </Container>
      </main>

      <style>{`
        .admin-dashboard {
          min-height: 100vh;
          background: #f8f9fa;
        }

        .dashboard-content {
          margin-left: 0;
          transition: margin-left 0.3s ease;
        }

        @media (min-width: 991.98px) {
          .dashboard-content {
            margin-left: 260px;
          }
        }

        @media (max-width: 991.98px) {
          .dashboard-content {
            padding-top: 60px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
