import React, { useState } from 'react';
import { Container, Row, Col, Button, Breadcrumb } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import StudentSidebar from '../components/StudentSidebar';
import DashboardHome from '../components/DashboardHome';
import SavedHostels from '../components/SavedHostels';
import RequestsList from '../components/RequestsList';
import SafetySection from '../components/SafetySection';
import StudentProfile from '../components/StudentProfile';
import { useAuth } from '../auth/AuthContext';

/**
 * StudentDashboard Main Page
 * Comprehensive dashboard for students to manage their hostel search
 * 
 * Features:
 * - Sidebar navigation with mobile support
 * - Dashboard home with welcome and quick actions
 * - Saved hostels shortlist
 * - Request tracking (viewing/booking)
 * - Safety and verification awareness
 * - Profile management
 */
const StudentDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Determine current section from URL
  const getCurrentSection = () => {
    const path = location.pathname;
    if (path === '/student/dashboard' || path === '/student/dashboard/') {
      return 'home';
    }
    if (path.includes('/saved')) return 'saved';
    if (path.includes('/requests')) return 'requests';
    if (path.includes('/safety')) return 'safety';
    if (path.includes('/profile')) return 'profile';
    return 'home';
  };

  const currentSection = getCurrentSection();

  // Get page title based on section
  const getPageTitle = () => {
    switch (currentSection) {
      case 'home': return 'Dashboard';
      case 'saved': return 'Saved Hostels';
      case 'requests': return 'My Requests';
      case 'safety': return 'Safety & Verification';
      case 'profile': return 'Profile & Preferences';
      default: return 'Dashboard';
    }
  };

  // Get breadcrumb items based on section
  const getBreadcrumbItems = () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Student Dashboard' }
    ];
    
    if (currentSection !== 'home') {
      items.splice(1, 0, { label: getPageTitle(), active: true });
    }
    
    return items;
  };

  // Render the appropriate section
  const renderSection = () => {
    switch (currentSection) {
      case 'home':
        return <DashboardHome user={user} />;
      
      case 'saved':
        return (
          <SavedHostels
            onRemove={(hostelId) => {
              console.log('Removed hostel:', hostelId);
            }}
          />
        );
      
      case 'requests':
        return (
          <RequestsList
            onCancel={(requestId) => {
              console.log('Cancelled request:', requestId);
            }}
          />
        );
      
      case 'safety':
        return (
          <SafetySection
            onReport={() => {
              alert('Report functionality would open a modal/form here');
            }}
          />
        );
      
      case 'profile':
        return (
          <StudentProfile
            user={user}
            onUpdate={(profile) => {
              console.log('Updated profile:', profile);
            }}
          />
        );
      
      default:
        return <DashboardHome user={user} />;
    }
  };

  return (
    <div className="student-dashboard">
      {/* Mobile Toggle Button */}
      <Button 
        variant="success"
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

      <StudentSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="dashboard-content">
        <Container fluid className="px-4 py-4">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-3">
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
              <i className="bi bi-house-fill me-1"></i> Home
            </Breadcrumb.Item>
            <Breadcrumb.Item active>
              <i className="bi bi-person-workspace me-1"></i>
              Student Dashboard
            </Breadcrumb.Item>
            {currentSection !== 'home' && (
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
        .student-dashboard {
          min-height: 100vh;
          background: #f8f9fa;
        }

        .dashboard-content {
          margin-left: 0;
          transition: margin-left 0.3s ease;
        }

        @media (min-width: 992px) {
          .dashboard-content {
            margin-left: 260px;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentDashboard;
