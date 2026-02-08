import { apiRequest } from './client';

export const geocodeLocation = async (payload = {}, options = {}) => {
  return apiRequest('/api/geocode', {
    method: 'POST',
    body: JSON.stringify(payload),
    ...options
  });
};
