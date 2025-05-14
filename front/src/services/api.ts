// api.ts (actualizado)
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Usar la variable de entorno o una URL por defecto apuntando al servidor de producción
const API_URL = import.meta.env.VITE_API_URL 

// Log de la URL base para debugging
console.log('API URL configurada:', API_URL);

const api = axios.create({
  baseURL: API_URL,
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
    // Log detallado del error para debugging
    if (error.response) {
      console.error('Error en respuesta API:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
        url: error.config?.url
      });
    } else if (error.request) {
      console.error('Error en petición (no respuesta):', error.request);
    } else {
      console.error('Error al configurar petición:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;