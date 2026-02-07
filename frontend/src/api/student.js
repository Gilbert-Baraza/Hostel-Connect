import { apiRequest } from './client';

export const getSavedHostels = async () => {
  return apiRequest('/api/students/saved-hostels');
};

export const saveHostel = async (hostelId) => {
  return apiRequest(`/api/students/saved-hostels/${hostelId}`, {
    method: 'POST'
  });
};

export const removeSavedHostel = async (hostelId) => {
  return apiRequest(`/api/students/saved-hostels/${hostelId}`, {
    method: 'DELETE'
  });
};
