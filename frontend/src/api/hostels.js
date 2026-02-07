import { apiRequest } from './client';

export const getHostels = async () => {
  return apiRequest('/api/hostels');
};

export const getPublicHostels = async () => {
  return apiRequest('/api/hostels/public');
};

export const getHostelById = async (id) => {
  return apiRequest(`/api/hostels/${id}`);
};

export const getAdminHostels = async (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.append(key, value);
  });
  const queryString = searchParams.toString();
  return apiRequest(`/api/hostels${queryString ? `?${queryString}` : ''}`);
};

export const verifyHostel = async (id, payload) => {
  return apiRequest(`/api/hostels/${id}/verify`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
};

export const disableHostel = async (id, payload) => {
  return apiRequest(`/api/hostels/${id}/disable`, {
    method: 'PATCH',
    body: JSON.stringify(payload || {})
  });
};

export const enableHostel = async (id, payload) => {
  return apiRequest(`/api/hostels/${id}/enable`, {
    method: 'PATCH',
    body: JSON.stringify(payload || {})
  });
};

export const createHostel = async (payload) => {
  return apiRequest('/api/hostels', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};

export const updateHostel = async (id, payload) => {
  return apiRequest(`/api/hostels/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
};

export const deleteHostel = async (id) => {
  return apiRequest(`/api/hostels/${id}`, {
    method: 'DELETE'
  });
};
