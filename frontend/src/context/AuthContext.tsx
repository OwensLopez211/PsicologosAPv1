// AuthContext.tsx (actualizado)
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { refreshToken } from '../services/authService';
import toast from 'react-hot-toast';

interface User {
  id: number;
  email: string;
  user_type: 'client' | 'psychologist' | 'admin';
  first_name: string;
  last_name: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => void;
  refreshUserSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('lastRefreshAttempt');
    setUser(null);
  };

  // Nueva función para refrescar la sesión del usuario
  const refreshUserSession = async (): Promise<boolean> => {
    try {
      const refreshed = await refreshToken();
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
        const token = localStorage.getItem('token');
        const refreshTokenValue = localStorage.getItem('refresh_token');

        if (savedUser && (token || refreshTokenValue)) {
          const parsedUser = JSON.parse(savedUser);
          
          // Normalizar el tipo de usuario a minúsculas
          const normalizedUser = {
            ...parsedUser,
            user_type: parsedUser.user_type?.toLowerCase() as 'client' | 'psychologist' | 'admin'
          };
          
          setUser(normalizedUser);
          
          // Solo intentar refrescar el token si existe un refresh token
          if (refreshTokenValue && !token) {
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
      refreshUserSession
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