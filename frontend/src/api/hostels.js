import { apiRequest } from './client';

export const getHostels = async () => {
  return apiRequest('/api/hostels');
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
