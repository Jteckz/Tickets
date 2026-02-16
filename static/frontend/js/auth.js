import { API_BASE_URL, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from './config.js';

export const auth = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  getUser: () => JSON.parse(localStorage.getItem(USER_KEY) || 'null'),
  isAuthenticated: () => Boolean(localStorage.getItem(ACCESS_TOKEN_KEY)),

  setSession({ access, refresh, user }) {
    if (access) localStorage.setItem(ACCESS_TOKEN_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  async login(payload) {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || 'Invalid credentials.');
    }
    this.setSession(data);
    return data;
  },

  async register(payload) {
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      const firstError = Object.values(data)?.[0]?.[0] || 'Registration failed.';
      throw new Error(firstError);
    }
    return data;
  },

  async refreshToken() {
    const refresh = this.getRefreshToken();
    if (!refresh) return null;

    const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (!response.ok) {
      this.clearSession();
      return null;
    }

    const data = await response.json();
    this.setSession({ access: data.access });
    return data.access;
  },

  logout() {
    this.clearSession();
    window.location.href = '/login/';
  },
};
