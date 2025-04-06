import api from './api';
import { toast } from 'react-hot-toast';

export interface User {
  id: number;
  email: string;
  user_type: 'client' | 'psychologist' | 'admin';
  first_name: string;
  last_name: string;
}

interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RegisterData {
  email: string;
  username?: string;
  password: string;
  password2: string;
  user_type: 'client' | 'psychologist' | 'admin';
  first_name: string;
  last_name: string;
  phone_number?: string;
  professional_title?: string;
  // Puedes añadir más campos según necesites
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/login/', {
      email: email.toLowerCase().trim(),
      password
    });
    
    // Normalizar user_type a minúsculas para garantizar consistencia
    if (response.data.user && response.data.user.user_type) {
      response.data.user.user_type = response.data.user.user_type.toLowerCase() as 'client' | 'psychologist' | 'admin';
    }
    
    // Almacenar datos de autenticación en localStorage
    localStorage.setItem('token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  } catch (error: any) {
    console.error('Login error:', error.response || error);
    
    // More specific error handling
    if (!error.response) {
      throw new Error('NETWORK_ERROR');
    }
    
    if (error.response?.status === 401) {
      throw new Error('INVALID_CREDENTIALS');
    }

    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    
    throw new Error('UNKNOWN_ERROR');
  }
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    // Aseguramos que user_type esté en minúsculas
    const payload = {
      ...data,
      email: data.email.trim().toLowerCase(),
      username: data.email.trim().toLowerCase(), // Usar email como username
      user_type: data.user_type.toLowerCase() as 'client' | 'psychologist' | 'admin'
    };
    
    const response = await api.post<AuthResponse>('/auth/register/', payload);
    
    // Almacenar datos de autenticación en localStorage
    localStorage.setItem('token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  } catch (error: any) {
    // Manejo de errores de red
    if (!error.response) {
      toast.error('Error de conexión. Por favor, verifica tu conexión a internet.');
      throw new Error('NETWORK_ERROR');
    }

    const errorData = error.response?.data;
    
    // Manejo específico de errores comunes
    if (errorData?.errors?.email?.[0]?.includes('existe') || 
        errorData?.errors?.username?.[0]?.includes('existe')) {
      toast.error('Este correo electrónico ya está registrado en la plataforma');
      throw new Error('EMAIL_EXISTS');
    }
    
    // Manejo de errores de validación
    if (errorData?.errors) {
      const firstError = Object.values(errorData.errors)[0];
      if (Array.isArray(firstError) && firstError.length > 0) {
        toast.error(firstError[0]);
        throw new Error('VALIDATION_ERROR');
      }
    }
    
    // Manejo de errores inesperados
    toast.error('Ha ocurrido un error durante el registro. Por favor, intente nuevamente.');
    throw error;
  }
};

export const refreshToken = async (): Promise<string | null> => {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) {
    throw new Error('No refresh token available');
  }
  
  // Control de recursión - prevenir loops infinitos de refresh
  const lastRefreshAttempt = localStorage.getItem('lastRefreshAttempt');
  const now = Date.now();
  
  if (lastRefreshAttempt) {
    const timeSinceLastAttempt = now - parseInt(lastRefreshAttempt);
    // Si intentamos refrescar hace menos de 10 segundos, no intentar de nuevo
    if (timeSinceLastAttempt < 10000) {
      console.log('Skipping token refresh - attempted too recently');
      return null;
    }
  }
  
  // Registrar el timestamp de este intento
  localStorage.setItem('lastRefreshAttempt', now.toString());
  
  try {
    const response = await api.post('/auth/refresh/', {
      refresh: refresh
    });
    
    if (response.data.access) {
      localStorage.setItem('token', response.data.access);
      return response.data.access;
    }
    return null;
  } catch (error: any) {
    console.error('Token refresh error:', error);
    
    // Solo limpiar tokens si es un error de autenticación
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      console.log('Tokens cleared due to authentication error');
    }
    
    throw error;
  }
};

const authService = {
  login,
  register,
  refreshToken
};

export default authService;