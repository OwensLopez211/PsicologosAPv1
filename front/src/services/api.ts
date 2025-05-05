// api.ts (actualizado)
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Utilizar variables de entorno para la URL base de la API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

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
    // Asegúrate de que no haya mensajes toast aquí que dupliquen los de authService
    
    return Promise.reject(error);
  }
);

export default api;