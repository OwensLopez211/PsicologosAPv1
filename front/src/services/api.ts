// api.ts (actualizado)
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Determinar la URL base según el entorno
let baseURL = '/api';
// Para desarrollo local usa la URL relativa, que será manejada por el proxy de Vite
// En producción usa la URL absoluta del servidor

const api = axios.create({
  baseURL,
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
    // Asegurarse de que no haya doble /api/ en las URLs
    if (config.url && config.url.startsWith('/api') && config.baseURL && config.baseURL.endsWith('/api')) {
      config.url = config.url.substring(4); // Eliminar el /api duplicado
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Interceptor de respuesta
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Log del error para depuración
    console.error('API Error:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    
    return Promise.reject(error);
  }
);

export default api;
