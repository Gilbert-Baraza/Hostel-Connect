import { apiRequest } from './client';

export const getMyBookings = async (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.append(key, value);
  });
  const queryString = searchParams.toString();
  return apiRequest(`/api/bookings/my${queryString ? `?${queryString}` : ''}`);
};

export const createBooking = async (roomId, payload) => {
  return apiRequest(`/api/rooms/${roomId}/book`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};

export const cancelBooking = async (bookingId, payload) => {
  return apiRequest(`/api/bookings/${bookingId}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify(payload || {})
  });
};

export const getHostelBookings = async (hostelId, params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.append(key, value);
  });
  const queryString = searchParams.toString();
  return apiRequest(`/api/hostels/${hostelId}/bookings${queryString ? `?${queryString}` : ''}`);
};

export const decideBooking = async (bookingId, payload) => {
  return apiRequest(`/api/bookings/${bookingId}/decision`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
};
