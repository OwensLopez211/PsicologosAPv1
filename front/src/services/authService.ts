import api from './api';
import { toast } from 'react-hot-toast';

export interface User {
  id: number;
  email: string;
  user_type: 'client' | 'psychologist' | 'admin';
  first_name: string;
  last_name: string;
  profile_id?: number; // Añadimos el profile_id como opcional
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

export const login = async (email: string, password: string): Promise<AuthResponse | { error: string }> => {
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
    
    // Publicar un evento personalizado para notificar que el token ha cambiado
    // Esto permitirá que otros componentes reaccionen al cambio
    const tokenChangeEvent = new CustomEvent('tokenChange', { 
      detail: { token: response.data.access }
    });
    window.dispatchEvent(tokenChangeEvent);
    
    // Almacenar el profile_id por separado si existe
    if (response.data.user.profile_id) {
      localStorage.setItem('profile_id', response.data.user.profile_id.toString());
    }
    
    return response.data;
  } catch (error: any) {
    if (!error.response) {
      return { error: 'NETWORK_ERROR' };
    }

    const errorData = error.response?.data;
    const statusCode = error.response?.status;
    
    if (statusCode === 401) {
      return { error: 'INVALID_CREDENTIALS' };
    }
    
    // Cuenta inactiva
    if (errorData?.detail && errorData.detail.includes('inactive')) {
      return { error: 'USER_INACTIVE' };
    }
    
    // Para cualquier otro mensaje de error específico del backend
    if (errorData?.detail) {
      return { error: errorData.detail };
    }
    
    return { error: 'UNKNOWN_ERROR' };
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
    
    // Almacenar el profile_id por separado si existe
    if (response.data.user.profile_id) {
      localStorage.setItem('profile_id', response.data.user.profile_id.toString());
    }
    
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

/**
 * Solicita un restablecimiento de contraseña para el correo electrónico proporcionado
 * @param email El correo electrónico del usuario que quiere restablecer su contraseña
 * @returns Una promesa que se resuelve con la respuesta del servidor
 */
export const requestPasswordReset = async (email: string) => {
  try {
    // Obtener el dominio actual para construir el base_url
    const base_url = `${window.location.protocol}//${window.location.host}`;
    
    const response = await api.post('/auth/request-password-reset/', {
      email,
      base_url // Enviamos el base_url para que el backend pueda construir el enlace completo
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Error al solicitar restablecimiento de contraseña:', error);
    
    if (!error.response) {
      return { error: 'NETWORK_ERROR' };
    }
    
    return { error: error.response?.data?.detail || 'REQUEST_FAILED' };
  }
};

/**
 * Establece una nueva contraseña usando un token de restablecimiento
 * @param token Token de restablecimiento recibido por correo electrónico
 * @param newPassword Nueva contraseña del usuario
 * @returns Una promesa que se resuelve con la respuesta del servidor
 */
export const resetPassword = async (token: string, newPassword: string) => {
  try {
    // Primero verificamos el token para obtener el email asociado
    const verifyResponse = await api.post('/auth/verify-reset-token/', { token });
    const email = verifyResponse.data.email;
    
    if (!email) {
      return { error: 'NO_EMAIL_FOUND' };
    }
    
    const response = await api.post('/auth/reset-password/', {
      token,
      email,
      new_password: newPassword
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Error al restablecer contraseña:', error);
    
    if (!error.response) {
      return { error: 'NETWORK_ERROR' };
    }
    
    return { error: error.response?.data?.detail || 'RESET_FAILED' };
  }
};

/**
 * Verifica si un token de restablecimiento de contraseña es válido
 * @param token Token de restablecimiento a verificar
 * @returns Una promesa que se resuelve con la respuesta del servidor
 */
export const verifyResetToken = async (token: string) => {
  try {
    const response = await api.post('/auth/verify-reset-token/', {
      token
    });
    
    return { ...(response.data), valid: true };
  } catch (error: any) {
    console.error('Error al verificar token de restablecimiento:', error);
    
    if (!error.response) {
      return { error: 'NETWORK_ERROR', valid: false };
    }
    
    return { error: error.response?.data?.detail || 'INVALID_TOKEN', valid: false };
  }
};

const authService = {
  login,
  register,
  refreshToken,
  requestPasswordReset,
  resetPassword,
  verifyResetToken
};

export default authService;