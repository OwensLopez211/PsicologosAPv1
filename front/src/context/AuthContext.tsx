// AuthContext.tsx (actualizado)
import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { refreshToken } from '../services/authService';
import { setupTokenSync } from '../services/api';
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
  setToken: (token: string | null) => void; // Añadir setToken a la interfaz
  forceTokenSync: () => boolean; // Nueva función para forzar sincronización - devuelve boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token')); // Initialize from localStorage
  const initializeAttempts = useRef(0);

  // Función para forzar la sincronización del token
  const forceTokenSync = (): boolean => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      console.log('Forzando sincronización del token desde localStorage');
      setToken(storedToken);
      return true;
    }
    return false;
  };

  // Inicialización forzada del token cuando el contexto se monta
  useEffect(() => {
    // CRITICAL: Intentar forzar la sincronización varias veces al inicio
    const forceSyncInterval = setInterval(() => {
      const synced = forceTokenSync();
      initializeAttempts.current += 1;
      
      console.log(`Intento #${initializeAttempts.current} de sincronización del token:`, synced ? 'Éxito' : 'No se encontró token');
      
      // Detener después de 5 intentos
      if (initializeAttempts.current >= 5) {
        clearInterval(forceSyncInterval);
      }
    }, 500); // Intentar cada 500ms

    return () => clearInterval(forceSyncInterval);
  }, []);

  // Configurar la sincronización del token con el API
  useEffect(() => {
    setupTokenSync(setToken);
  }, []);
  
  // Escuchar el evento personalizado tokenChange
  useEffect(() => {
    const handleTokenChange = (event: CustomEvent<{ token: string }>) => {
      console.log('Evento tokenChange detectado:', !!event.detail.token);
      setToken(event.detail.token);
    };

    // Añadir el listener
    window.addEventListener('tokenChange', handleTokenChange as EventListener);
    
    // También escuchar el nuevo evento tokenUpdated
    const handleTokenUpdated = (event: CustomEvent<{ token: string }>) => {
      console.log('Evento tokenUpdated detectado:', !!event.detail.token);
      setToken(event.detail.token);
    };
    window.addEventListener('tokenUpdated', handleTokenUpdated as EventListener);
    
    // Eliminar el listener al desmontar
    return () => {
      window.removeEventListener('tokenChange', handleTokenChange as EventListener);
      window.removeEventListener('tokenUpdated', handleTokenUpdated as EventListener);
    };
  }, []);

  // En la función logout, añadir:
  const logout = () => {
    console.log('Logging out, clearing auth data');
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('profile_id'); // Eliminar también el profile_id
    localStorage.removeItem('lastRefreshAttempt');
    setUser(null);
    setToken(null);
  };
  
  // Nueva función para refrescar la sesión del usuario
  const refreshUserSession = async (): Promise<boolean> => {
    try {
      const refreshed = await refreshToken();
      // Update token state if refresh was successful
      if (refreshed) {
        const newToken = localStorage.getItem('token');
        setToken(newToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  };

  useEffect(() => {
    console.log('AuthContext initializing...');
    const initAuth = async () => {
      try {
        const savedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        const refreshTokenValue = localStorage.getItem('refresh_token');

        console.log('Auth state from localStorage:', { 
          hasUser: !!savedUser, 
          hasToken: !!storedToken, 
          hasRefreshToken: !!refreshTokenValue 
        });

        if (savedUser && (storedToken || refreshTokenValue)) {
          // Establecer el token de inmediato si existe
          if (storedToken) {
            setToken(storedToken);
            console.log('Token set from localStorage');
          }

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
          
          // Si no hay token pero hay refresh token, intentar refrescar la sesión
          if (!storedToken && refreshTokenValue) {
            console.log('No token found, attempting to refresh session');
            const success = await refreshUserSession();
            if (!success) {
              console.log('Failed to refresh session, logging out');
              logout();
            }
          }
        } else {
          console.log('No authentication data found, user is not logged in');
          setToken(null);
          setUser(null);
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
      setToken, // Añadir setToken al contexto
      forceTokenSync // Nueva función para forzar sincronización
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
  
  // Verificación proactiva: si hay token en localStorage pero no en el contexto, sincronizar
  if (!context.token) {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      console.log('useAuth: Token encontrado en localStorage pero no en contexto, sincronizando...');
      
      // Forzamos la sincronización en lugar de solo llamar a setToken
      context.forceTokenSync();
      
      // Forzar reporte del token ya presente (aunque el estado se actualizará en el próximo render)
      console.log('useAuth called, token status: true (forzado desde localStorage)');
      return {
        ...context,
        token: storedToken
      };
    }
  }
  
  // Modo producción: verificación más agresiva
  if (process.env.NODE_ENV === 'production' && !context.token) {
    console.log('⚠️ useAuth en PRODUCCIÓN sin token, intentando resincronizar...');
    setTimeout(() => {
      context.forceTokenSync();
    }, 100);
  }
  
  console.log('useAuth called, token status:', !!context.token, 'ENV:', process.env.NODE_ENV || 'development');
  return context;
};
