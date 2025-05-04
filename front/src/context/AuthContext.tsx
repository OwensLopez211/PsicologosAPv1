// AuthContext.tsx (actualizado)
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { refreshToken } from '../services/authService';
import { useNavigate, useLocation } from 'react-router-dom';
import { SESSION_EXPIRED_EVENT } from '../services/api';
import toastService from '../services/toastService';
// import toast from 'react-hot-toast';

interface User {
  id: number;
  email: string;
  user_type: 'client' | 'psychologist' | 'admin';
  first_name: string;
  last_name: string;
  profile_id?: number; // Añadimos el profile_id como opcional
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => void;
  refreshUserSession: () => Promise<boolean>;
  token: string | null; // Add token to the context
  handleSessionExpired: () => void; // Añadimos la función para manejar sesión expirada
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null); // Add token state
  const navigate = useNavigate();
  const location = useLocation();

  // Función para manejar la expiración de sesión
  const handleSessionExpired = () => {
    console.log('Session expired event triggered, redirecting to login');
    // Limpiar datos de autenticación
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    // Mantener el usuario para mostrar mensaje personalizado
    const savedUser = localStorage.getItem('user');
    
    // Limpiar estado
    setUser(null);
    setToken(null);
    
    // Redireccionar con parámetro expired=true
    navigate('/login?expired=true', { replace: true });
    
    // Mostrar mensaje de sesión expirada
    toastService.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
  };

  // Escuchar evento de sesión expirada
  useEffect(() => {
    const handleExpiredEvent = () => {
      handleSessionExpired();
    };
    
    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpiredEvent);
    
    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpiredEvent);
    };
  }, [navigate]);

  // En la función logout, añadir:
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('profile_id'); // Eliminar también el profile_id
    localStorage.removeItem('lastRefreshAttempt');
    setUser(null);
    setToken(null);
  };
  
  // En la función initAuth, asegurarse de que el profile_id se cargue correctamente:
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        const refreshTokenValue = localStorage.getItem('refresh_token');
  
        if (savedUser && (storedToken || refreshTokenValue)) {
          const parsedUser = JSON.parse(savedUser);
          
          // Normalizar el tipo de usuario a minúsculas
          const normalizedUser = {
            ...parsedUser,
            user_type: parsedUser.user_type?.toLowerCase() as 'client' | 'psychologist' | 'admin'
          };
          
          // Asegurarse de que el profile_id esté incluido
          const profileId = localStorage.getItem('profile_id');
          if (profileId && !normalizedUser.profile_id) {
            normalizedUser.profile_id = parseInt(profileId);
          }
          
          setUser(normalizedUser);
          
          // El resto del código permanece igual
        }
      } catch (error) {
        // El manejo de errores permanece igual
      }
    };
  
    initAuth();
  }, []);

  // Nueva función para refrescar la sesión del usuario
  const refreshUserSession = async (): Promise<boolean> => {
    try {
      const refreshed = await refreshToken();
      // Update token state if refresh was successful
      if (refreshed) {
        const newToken = localStorage.getItem('token');
        setToken(newToken);
      }
      return !!refreshed;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        const refreshTokenValue = localStorage.getItem('refresh_token');

        if (savedUser && (storedToken || refreshTokenValue)) {
          const parsedUser = JSON.parse(savedUser);
          
          // Normalizar el tipo de usuario a minúsculas
          const normalizedUser = {
            ...parsedUser,
            user_type: parsedUser.user_type?.toLowerCase() as 'client' | 'psychologist' | 'admin'
          };
          
          setUser(normalizedUser);
          
          // Set token state
          if (storedToken) {
            setToken(storedToken);
          }
          // Solo intentar refrescar el token si existe un refresh token
          else if (refreshTokenValue) {
            const success = await refreshUserSession();
            if (!success) {
              logout();
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      isAuthenticated: !!user,
      loading,
      logout,
      refreshUserSession,
      token, // Include token in the context
      handleSessionExpired // Exponemos la función para manejar la sesión expirada
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
