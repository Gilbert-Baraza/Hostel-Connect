import { apiRequest } from './client';

export const getReviewsByHostel = async (hostelId, params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.append(key, value);
  });
  const queryString = searchParams.toString();
  return apiRequest(`/api/hostels/${hostelId}/reviews${queryString ? `?${queryString}` : ''}`);
};

export const createReview = async (hostelId, payload) => {
  return apiRequest(`/api/hostels/${hostelId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};

export const updateReview = async (reviewId, payload) => {
  return apiRequest(`/api/reviews/${reviewId}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
};

export const deleteReview = async (reviewId) => {
  return apiRequest(`/api/reviews/${reviewId}`, {
    method: 'DELETE'
  });
};
