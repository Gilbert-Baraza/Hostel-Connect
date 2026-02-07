import { apiRequest } from './client';

export const login = async ({ email, password }) => {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
};

export const register = async ({ name, email, password, role }) => {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, role })
  });
};

export const getMe = async () => {
  return apiRequest('/api/auth/me');
};

export const logout = async () => {
  return apiRequest('/api/auth/logout', { method: 'POST' });
};
