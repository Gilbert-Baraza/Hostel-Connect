import { apiRequest } from './client';

export const getRoomsByHostel = async (hostelId, params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.append(key, value);
  });
  const queryString = searchParams.toString();
  return apiRequest(`/api/hostels/${hostelId}/rooms${queryString ? `?${queryString}` : ''}`);
};

export const createRoom = async (hostelId, payload) => {
  return apiRequest(`/api/hostels/${hostelId}/rooms`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};

export const updateRoom = async (roomId, payload) => {
  return apiRequest(`/api/rooms/${roomId}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
};

export const deleteRoom = async (roomId) => {
  return apiRequest(`/api/rooms/${roomId}`, {
    method: 'DELETE'
  });
};

export const toggleRoomAvailability = async (roomId, isAvailable) => {
  return apiRequest(`/api/rooms/${roomId}/availability`, {
    method: 'PATCH',
    body: JSON.stringify({ isAvailable })
  });
};
