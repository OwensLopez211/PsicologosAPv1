// api.ts (actualizado)
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false
});

// Interceptor de solicitud
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

// Interceptor de respuesta
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Omitir renovación de token para endpoints específicos o si ya estamos reintentando
    if (
      (originalRequest as any)._retry || 
      originalRequest.url?.includes('/auth/refresh/')
    ) {
      return Promise.reject(error);
    }

    // Solo intentar renovar el token para errores 401
    if (error.response?.status === 401) {
      try {
        (originalRequest as any)._retry = true;
        
        const lastRefreshAttempt = localStorage.getItem('lastRefreshAttempt');
        const now = Date.now();
        
        if (lastRefreshAttempt) {
          const timeSinceLastAttempt = now - parseInt(lastRefreshAttempt);
          if (timeSinceLastAttempt < 10000) { // 10 segundos
            console.log('Token refresh attempted too recently, skipping');
            return Promise.reject(error);
          }
        }
        
        localStorage.setItem('lastRefreshAttempt', now.toString());
        
        // Redireccionar al login si el token está expirado
        const hasUser = localStorage.getItem('user');
        if (hasUser) {
          const refreshToken = localStorage.getItem('refresh_token');
          
          // Solo redireccionar si no hay refresh token o hay otros problemas
          if (!refreshToken) {
            localStorage.removeItem('token');
            window.location.href = '/login?expired=true';
            return Promise.reject(error);
          }
        }
      } catch (e) {
        console.error('Error in refresh token logic:', e);
      }
    }

    return Promise.reject(error);
  }
);

export default api;