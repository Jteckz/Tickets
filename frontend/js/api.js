import { API_BASE_URL } from './config.js';
import { auth } from './auth.js';

async function request(endpoint, options = {}, shouldRetry = true) {
  const token = auth.getAccessToken();

  const headers = {
    ...(options.headers || {}),
  };

  const isFormData = options.body instanceof FormData;
  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && shouldRetry) {
    const newToken = await auth.refreshToken();
    if (newToken) return request(endpoint, options, false);
    auth.logout();
    throw new Error('Your session has expired. Please login again.');
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : await response.blob();

  if (!response.ok) {
    const message = data?.detail || data?.error || 'Request failed.';
    throw new Error(message);
  }

  return data;
}

export const api = {
  get: (endpoint) => request(endpoint),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
  patch: (endpoint, body) => request(endpoint, { method: 'PATCH', body: body instanceof FormData ? body : JSON.stringify(body) }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body) }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};
