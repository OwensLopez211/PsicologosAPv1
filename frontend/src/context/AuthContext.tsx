// AuthContext.tsx (actualizado)
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { refreshToken } from '../services/authService';
// import toast from 'react-hot-toast';

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
  token: string | null; // Add token to the context
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null); // Add token state

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('lastRefreshAttempt');
    setUser(null);
    setToken(null); // Clear token state
  };

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
      token // Include token in the context
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
