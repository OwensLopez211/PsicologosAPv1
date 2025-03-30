import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { refreshToken } from '../services/authService';
import toast from 'react-hot-toast';

interface User {
  id: number;
  email: string;
  user_type: 'client' | 'psychologist' | 'admin';  // Changed to lowercase to match backend
  first_name: string;
  last_name: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        const refreshTokenValue = localStorage.getItem('refresh_token');

        if (savedUser && (token || refreshTokenValue)) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          
          // Only try to refresh token if we have a refresh token
          if (refreshTokenValue) {
            try {
              await refreshToken();
            } catch (error) {
              console.error('Token refresh failed:', error);
              // Don't logout immediately on first page load if refresh fails
              // This gives a better UX - we'll let the API interceptor handle 401s
              if ((error as any)?.response?.status !== 404) {
                logout();
              }
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
      logout
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