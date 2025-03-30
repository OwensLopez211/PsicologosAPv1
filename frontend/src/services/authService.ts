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
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/login/', {
      email: email.toLowerCase().trim(),
      password
    });
    
    // Normalize user_type to lowercase to ensure consistency
    if (response.data.user && response.data.user.user_type) {
      response.data.user.user_type = response.data.user.user_type.toLowerCase() as 'client' | 'psychologist' | 'admin';
    }
    
    // Store auth data in localStorage
    localStorage.setItem('token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Credenciales inválidas');
    }
    throw error;
  }
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/register/', {
      email: data.email,
      username: data.email, // Using email as username
      password: data.password,
      password2: data.password2,
      user_type: data.user_type,
      first_name: data.first_name,
      last_name: data.last_name,
      phone_number: data.phone_number
    });
    
    return response.data;
  } catch (error: any) {
    // Handle network errors
    if (!error.response) {
      toast.error('Error de conexión. Por favor, verifica tu conexión a internet.');
      throw new Error('NETWORK_ERROR');
    }

    const errorData = error.response?.data;
    
    // Handle email/username already exists
    if (errorData?.errors?.email?.[0]?.includes('existe') || 
        errorData?.errors?.username?.[0]?.includes('existe')) {
      toast.error('Este correo electrónico ya está registrado en la plataforma');
      throw new Error('EMAIL_EXISTS');
    }
    
    // Handle validation errors
    if (errorData?.errors) {
      const firstError = Object.values(errorData.errors)[0];
      if (Array.isArray(firstError) && firstError.length > 0) {
        toast.error(firstError[0]);
        throw new Error('VALIDATION_ERROR');
      }
    }
    
    // Handle unexpected errors
    toast.error('Ha ocurrido un error durante el registro. Por favor, intente nuevamente.');
    throw error;
  }
};

export const refreshToken = async () => {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) throw new Error('No refresh token available');
  
  // Add a flag to localStorage to prevent refresh loops
  const lastRefreshAttempt = localStorage.getItem('lastRefreshAttempt');
  const now = Date.now();
  
  if (lastRefreshAttempt) {
    const timeSinceLastAttempt = now - parseInt(lastRefreshAttempt);
    // If we tried to refresh less than 10 seconds ago, don't try again
    if (timeSinceLastAttempt < 10000) {
      console.log('Skipping token refresh - attempted too recently');
      return null;
    }
  }
  
  // Set the timestamp of this attempt
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
    
    // Only clear tokens if it's an authentication error
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('lastRefreshAttempt'); // Clear the timestamp too
      console.log('Tokens cleared due to authentication error');
    }
    
    throw error;
  }
};

// Add this function to complete the authService
const authService = {
  login,
  register,
  refreshToken
};

export default authService;
