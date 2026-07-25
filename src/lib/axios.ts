import axios from 'axios';

// Remove non-standard headers globally to prevent CORS preflight issues
delete axios.defaults.headers.common['X-Requested-With'];

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5247',
});



api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// A 401 means the JWT is missing/expired/invalid - clear it and bounce to the landing page, matching
// ProtectedRoute's own "no token -> /" redirect, instead of leaving the dashboard silently broken.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('jwt_token')) {
      localStorage.removeItem('jwt_token');
      window.location.assign('/');
    }
    return Promise.reject(error);
  }
);