// api.ts (actualizado)
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: 'http://186.64.113.186/api',
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
