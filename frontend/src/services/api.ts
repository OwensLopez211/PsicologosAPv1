import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import authService from './authService';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Skip token refresh for specific endpoints or if already retrying
    if (
      (originalRequest as any)._retry || 
      originalRequest.url?.includes('/auth/refresh/')
    ) {
      return Promise.reject(error);
    }

    // Only attempt token refresh for 401 errors
    if (error.response?.status === 401) {
      try {
        (originalRequest as any)._retry = true;
        
        // Simple debounce for token refresh
        const lastRefreshAttempt = localStorage.getItem('lastRefreshAttempt');
        const now = Date.now();
        
        if (lastRefreshAttempt) {
          const timeSinceLastAttempt = now - parseInt(lastRefreshAttempt);
          if (timeSinceLastAttempt < 10000) { // 10 seconds
            console.log('Token refresh attempted too recently, skipping');
            return Promise.reject(error);
          }
        }
        
        localStorage.setItem('lastRefreshAttempt', now.toString());
        
        // Instead of using the refresh token mechanism which is failing,
        // let's redirect to login if the token is expired
        const user = localStorage.getItem('user');
        if (user) {
          // Keep the user data but clear tokens
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          
          // Redirect to login page
          window.location.href = '/login?expired=true';
          return Promise.reject(error);
        }
      } catch (e) {
        console.error('Error in refresh token logic:', e);
      }
    }

    return Promise.reject(error);
  }
);

export default api;