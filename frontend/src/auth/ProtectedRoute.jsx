import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

/**
 * ProtectedRoute Component
 * 
 * Provides role-based access control for routes.
 * Redirects unauthenticated users to login page.
 * Redirects authenticated users with unauthorized roles to home page.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Protected content to render
 * @param {string|string[]} props.allowedRoles - Role(s) allowed to access this route
 * @param {boolean} props.requireAuth - Whether to require authentication (default: true)
 * @param {React.ReactNode} props.fallback - Optional custom fallback component
 * 
 * @example
 * // Protect a landlord-only route
 * <ProtectedRoute allowedRoles={['landlord']}>
 *   <LandlordDashboard />
 * </ProtectedRoute>
 * 
 * @example
 * // Protect an admin-only route
 * <ProtectedRoute allowedRoles={['admin']}>
 *   <AdminPanel />
 * </ProtectedRoute>
 * 
 * @example
 * // Multiple allowed roles
 * <ProtectedRoute allowedRoles={['landlord', 'admin']}>
 *   <SharedDashboard />
 * </ProtectedRoute>
 * 
 * @example
 * // Public route that redirects if already authenticated
 * <ProtectedRoute requireAuth={false}>
 *   <LoginPage />
 * </ProtectedRoute>
 */
const ProtectedRoute = ({ 
  children, 
  allowedRoles, 
  requireAuth = true,
  fallback = null 
}) => {
  const { isAuthenticated, hasRole: checkRole, loading } = useAuth();
  const location = useLocation();

  // Show loading state while auth is initializing
  if (loading) {
    return fallback || (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '200px' 
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  // Case 1: Route requires authentication but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Redirect to login, preserving the attempted URL for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Case 2: Route has role restrictions and user doesn't have required role
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAccess = checkRole(allowedRoles);
    
    if (!hasAccess) {
      // User is authenticated but lacks permission - redirect to home
      return <Navigate to="/" state={{ unauthorized: true }} replace />;
    }
  }

  // Case 3: Route should not be accessible when authenticated (e.g., login/register)
  if (requireAuth === false && isAuthenticated) {
    // Redirect to home or the page they came from
    const redirectTo = location.state?.from?.pathname || '/';
    return <Navigate to={redirectTo} replace />;
  }

  // Case 4: User has access - render the protected content
  return children;
};

export default ProtectedRoute;
