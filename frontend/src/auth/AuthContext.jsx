import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  login as loginRequest,
  register as registerRequest,
  getMe as getMeRequest,
  logout as logoutRequest
} from '../api/auth';
import { authStorage } from '../api/client';

const AuthContext = createContext(null);
const AUTH_USER_KEY = 'authUser';

/**
 * AuthProvider Component
 * 
 * Manages authentication state and provides auth-related functions.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_USER_KEY);
    authStorage.clearToken();
  }, []);

  const saveSession = useCallback((nextUser, token) => {
    setUser(nextUser);
    setIsAuthenticated(true);
    if (token) {
      authStorage.setToken(token);
    }
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = authStorage.getToken();
        if (!token) {
          localStorage.removeItem(AUTH_USER_KEY);
          setLoading(false);
          return;
        }

        const response = await getMeRequest();
        const currentUser = response?.data?.user;

        if (currentUser) {
          saveSession(currentUser, token);
        } else {
          clearSession();
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        clearSession();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [clearSession, saveSession]);

  /**
   * Login function
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} Result with success status and user/error
   */
  const login = useCallback(async (credentials) => {
    try {
      const response = await loginRequest(credentials);
      const nextUser = response?.data?.user;
      const token = response?.data?.token;

      if (!nextUser || !token) {
        throw new Error('Login failed. Missing user or token.');
      }

      saveSession(nextUser, token);
      return { success: true, user: nextUser };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'Login failed',
        errors: error.data?.errors
      };
    }
  }, [saveSession]);

  /**
   * Register function
   * @param {Object} payload - Registration data
   * @returns {Promise<Object>} Result with success status or error
   */
  const register = useCallback(async (payload) => {
    try {
      const response = await registerRequest(payload);
      return { success: true, data: response?.data };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.message || 'Registration failed',
        errors: error.data?.errors
      };
    }
  }, []);

  /**
   * Logout function
   */
  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch (error) {
      console.warn('Logout error:', error);
    } finally {
      clearSession();
    }
  }, [clearSession]);

  /**
   * Check if user has specific role(s)
   * @param {string|string[]} roles - Role(s) to check
   * @returns {boolean} True if user has any of the specified roles
   */
  const hasRole = useCallback((roles) => {
    if (!user || !user.role) return false;
    
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  }, [user]);

  /**
   * Update user profile
   * @param {Object} updates - Profile fields to update
   */
  const updateProfile = useCallback((updates) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
  }, [user]);

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    hasRole,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth Hook
 * 
 * Custom hook to access authentication context.
 * Must be used within an AuthProvider.
 * 
 * @returns {Object} Auth context object with user, isAuthenticated, and auth functions
 * @throws {Error} If used outside of AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
