// AuthContext.tsx (actualizado)
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token')); // Initialize from localStorage

  // Configurar la sincronización del token con el API
  useEffect(() => {
    setupTokenSync(setToken);
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
      setToken // Añadir setToken al contexto
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
  console.log('useAuth called, token status:', !!context.token);
  return context;
};
