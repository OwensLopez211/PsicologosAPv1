// api.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Detectar si estamos en producción o desarrollo
const isProduction = window.location.hostname !== 'localhost' && 
                     window.location.hostname !== '127.0.0.1';

// Configurar baseURL según el entorno
const baseURL = isProduction 
  ? '/api' // URL relativa para producción
  : 'http://localhost:8000/api'; // URL absoluta para desarrollo

console.log(`API configured with baseURL: ${baseURL}, environment: ${isProduction ? 'production' : 'development'}`);

// Evento personalizado para manejar la expiración de sesión
export const SESSION_EXPIRED_EVENT = 'session_expired';

// Función para emitir evento de sesión expirada
export const emitSessionExpired = () => {
  const event = new CustomEvent(SESSION_EXPIRED_EVENT);
  window.dispatchEvent(event);
};

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false
});

// Logs adicionales para diagnóstico
function logApiRequest(config: InternalAxiosRequestConfig): void {
  console.log(`[API] Request to: ${config.method?.toUpperCase()} ${config.url}`);
}

function logApiError(error: AxiosError): void {
  console.error('[API] Error:', {
    url: error.config?.url,
    method: error.config?.method?.toUpperCase(),
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: error.response?.data
  });
}

// Interceptor de solicitud
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    logApiRequest(config);
    return config;
  },
  (error: AxiosError) => {
    logApiError(error);
    return Promise.reject(error);
  }
);

// Interceptor de respuesta
api.interceptors.response.use(
  (response) => {
    console.log(`[API] Success response from: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  async (error: AxiosError) => {
    logApiError(error);
    
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
            console.log('[API] Token refresh attempted too recently, skipping');
            emitSessionExpired();
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
            console.log('[API] No refresh token available, emitting session expired event');
            emitSessionExpired();
            return Promise.reject(error);
          }
          
          // Intentar refrescar el token
          console.log('[API] Attempting to refresh token');
          try {
            const response = await axios.post(`${baseURL}/auth/refresh/`, {
              refresh: refreshToken
            });
            
            if (response.data.access) {
              console.log('[API] Token refreshed successfully');
              localStorage.setItem('token', response.data.access);
              
              // Reintento de la solicitud original con el nuevo token
              originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
              return axios(originalRequest);
            }
          } catch (refreshError) {
            console.error('[API] Error refreshing token:', refreshError);
            // Si hay un error al refrescar, emitir evento de sesión expirada
            emitSessionExpired();
          }
        }
      } catch (e) {
        console.error('[API] Error in refresh token logic:', e);
        emitSessionExpired();
      }
    }

    return Promise.reject(error);
  }
);

export default api;