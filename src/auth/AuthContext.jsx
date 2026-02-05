import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Auth Context - Manages authentication state for the application
 * 
 * IMPORTANT: This is a frontend-only mock implementation.
 * Replace dummy auth logic with actual API calls when backend is ready.
 * 
 * @example
 * // In your component:
 * const { user, login, logout, isAuthenticated } = useAuth();
 */
const AuthContext = createContext(null);

/**
 * User object structure:
 * @typedef {Object} User
 * @property {string} id - Unique user identifier
 * @property {string} email - User's email address
 * @property {string} role - User role: 'student', 'landlord', or 'admin'
 * @property {string} [name] - Optional user name
 */

/**
 * AuthProvider Component
 * 
 * Wraps the application to provide authentication state and methods.
 * Persists auth state to localStorage for a better user experience across reloads.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  // This simulates reading a session/token on app load
  useEffect(() => {
    const storedUser = localStorage.getItem('hostelConnectUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        // Invalid stored data - clear it
        localStorage.removeItem('hostelConnectUser');
      }
    }
    setLoading(false);
  }, []);

  /**
   * Login method - DUMMY IMPLEMENTATION
   * 
   * TODO: Replace with actual API call when backend is ready
   * Example: const response = await fetch('/api/login', { method: 'POST', body: JSON.stringify(credentials) })
   * 
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email
   * @param {string} credentials.password
   * @returns {Promise<{success: boolean, user?: User, error?: string}>}
   */
  const login = async (credentials) => {
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // DUMMY AUTH LOGIC - Replace with actual API
    // This accepts any email/password for testing purposes
    const mockUsers = {
      'student@test.com': { id: '1', email: 'student@test.com', role: 'student', name: 'Test Student' },
      'landlord@test.com': { id: '2', email: 'landlord@test.com', role: 'landlord', name: 'Test Landlord' },
      'admin@test.com': { id: '3', email: 'admin@test.com', role: 'admin', name: 'Test Admin' },
    };

    const mockUser = mockUsers[credentials.email];
    
    if (mockUser) {
      // Optionally persist to localStorage
      // In production, this would store a JWT token instead
      localStorage.setItem('hostelConnectUser', JSON.stringify(mockUser));
      setUser(mockUser);
      setIsAuthenticated(true);
      return { success: true, user: mockUser };
    }

    return { success: false, error: 'Invalid credentials' };
  };

  /**
   * Register method - DUMMY IMPLEMENTATION
   * 
   * TODO: Replace with actual API call when backend is ready
   * 
   * @param {Object} userData - Registration data
   * @returns {Promise<{success: boolean, user?: User, error?: string}>}
   */
  const register = async (userData) => {
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // DUMMY REGISTRATION LOGIC
    const newUser = {
      id: Date.now().toString(),
      email: userData.email,
      role: userData.role || 'student',
      name: userData.name || '',
    };

    // In production, this would make an API call to create the user
    // and store the returned JWT token
    console.log('Registration successful (dummy):', newUser);
    
    return { success: true, user: newUser };
  };

  /**
   * Logout method
   * 
   * Clears auth state and removes stored credentials
   */
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('hostelConnectUser');
    // Reset state
    setUser(null);
    setIsAuthenticated(false);
  };

  /**
   * Utility method to check if user has a specific role
   * 
   * @param {string|string[]} roles - Role(s) to check against
   * @returns {boolean} - True if user has any of the specified roles
   */
  const hasRole = (roles) => {
    if (!user || !user.role) return false;
    
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  /**
   * Get current user role
   * 
   * @returns {string|null} - Current user role or null if not authenticated
   */
  const getRole = () => {
    return user?.role || null;
  };

  // Context value
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    register,
    hasRole,
    getRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access auth context
 * 
 * @throws {Error} If used outside of AuthProvider
 * @returns {Object} Auth context value with user, login, logout, etc.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
