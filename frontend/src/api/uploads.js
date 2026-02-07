import { apiRequest } from './client';

export const uploadHostelImages = async (files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));

  return apiRequest('/api/uploads/hostel-images', {
    method: 'POST',
    body: formData
  });
};
