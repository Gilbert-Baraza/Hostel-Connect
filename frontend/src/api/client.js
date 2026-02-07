const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const AUTH_TOKEN_KEY = 'authToken';

const getAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

const buildUrl = (path) => {
  if (!path.startsWith('/')) {
    return `${API_BASE_URL}/${path}`;
  }
  return `${API_BASE_URL}${path}`;
};

const parseJson = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return null;
  }
  return response.json();
};

export const apiRequest = async (path, options = {}) => {
  const headers = { ...(options.headers || {}) };

  if (!headers['Content-Type'] && options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getAuthToken();
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers
  });

  const data = await parseJson(response);

  if (!response.ok) {
    const error = new Error(data?.message || response.statusText || 'Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const authStorage = {
  getToken: () => localStorage.getItem(AUTH_TOKEN_KEY),
  setToken: (token) => localStorage.setItem(AUTH_TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(AUTH_TOKEN_KEY)
};
