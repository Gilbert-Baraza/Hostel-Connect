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

export const getMyNotifications = async (params = {}) => {
  return apiRequest(`/api/notifications/my${buildQuery(params)}`);
};

export const markNotificationRead = async (notificationId) => {
  return apiRequest(`/api/notifications/${notificationId}/read`, {
    method: 'PATCH'
  });
};

export const markAllNotificationsRead = async () => {
  return apiRequest('/api/notifications/read-all', {
    method: 'PATCH'
  });
};
