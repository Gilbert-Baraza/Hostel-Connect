import { apiRequest } from './client';

const buildQuery = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.append(key, value);
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

export const getAdminOverview = async () => {
  return apiRequest('/api/admin/overview');
};

export const getAdminUsers = async (params = {}) => {
  return apiRequest(`/api/admin/users${buildQuery(params)}`);
};

export const updateUserStatus = async (userId, status) => {
  return apiRequest(`/api/admin/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
};

export const getAdminLandlords = async (params = {}) => {
  return apiRequest(`/api/admin/landlords${buildQuery(params)}`);
};

export const verifyLandlord = async (landlordId, payload) => {
  return apiRequest(`/api/admin/landlords/${landlordId}/verify`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
};

export const getAdminReports = async (params = {}) => {
  return apiRequest(`/api/admin/reports${buildQuery(params)}`);
};

export const updateReport = async (reportId, payload) => {
  return apiRequest(`/api/admin/reports/${reportId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
};
