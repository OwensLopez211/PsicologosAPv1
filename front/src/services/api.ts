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

// Variable para almacenar la función de sincronización del token
let syncTokenFunction: ((token: string | null) => void) | null = null;

// Función para configurar el sincronizador de token desde AuthContext
export const setupTokenSync = (syncFn: (token: string | null) => void) => {
  syncTokenFunction = syncFn;
  console.log('Token sync function configurada');
};

// Interceptor de solicitud
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Siempre obtener el token más reciente de localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      console.log('API usando token para solicitud:', config.url);
      
      // Asegurarse de que el Authorization header esté actualizado
      config.headers.Authorization = `Bearer ${token}`;
      
      // Sincronizar token con el contexto si está disponible la función
      if (syncTokenFunction) {
        syncTokenFunction(token);
      }
    } else {
      console.log('API: No se encontró token para solicitud:', config.url);
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
      
      // Si es un error 401, puede ser por token expirado o inválido
      if (error.response.status === 401) {
        console.error('Error 401 detectado - posible problema de autenticación');
      }
    } else if (error.request) {
      console.error('Error en petición (no respuesta):', error.request);
    } else {
      console.error('Error al configurar petición:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;

// Nueva función para obtener estadísticas del cliente
export const fetchClientStats = async () => {
  try {
    // Intentar con el endpoint principal de estadísticas del cliente
    const response = await api.get('/appointments/dashboard-stats/');
    console.log('Estadísticas obtenidas desde dashboard-stats:', response.data);
    
    return {
      totalAppointments: response.data.totalAppointments || 0,
      upcomingAppointments: response.data.upcomingAppointments || 0,
      completedAppointments: response.data.completedAppointments || 0,
      lastSessionDate: response.data.lastSessionDate || null
    };
  } catch (statsError) {
    console.error('Error al obtener estadísticas desde dashboard-stats:', statsError);
    
    // Intentar con el endpoint alternativo
    try {
      const testResponse = await api.get('/appointments/test-stats/');
      console.log('Estadísticas obtenidas desde test-stats:', testResponse.data);
      
      if ('totalAppointments' in testResponse.data) {
        return {
          totalAppointments: testResponse.data.totalAppointments || 0,
          upcomingAppointments: testResponse.data.upcomingAppointments || 0,
          completedAppointments: testResponse.data.completedAppointments || 0,
          lastSessionDate: testResponse.data.lastSessionDate || null
        };
      }
    } catch (testError) {
      console.error('Error al obtener estadísticas desde test-stats:', testError);
    }
    
    // Devolver estadísticas vacías cuando hay error para evitar romper la UI
    return {
      totalAppointments: 0,
      upcomingAppointments: 0,
      completedAppointments: 0,
      lastSessionDate: null
    };
  }
};