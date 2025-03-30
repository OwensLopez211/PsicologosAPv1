import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Small delay to ensure auth state is properly loaded
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return null; // or return a loading spinner if you prefer
  }

  if (isAuthenticated && user) {
    const dashboard = user.user_type === 'psychologist'
      ? '/psicologo/dashboard'
      : user.user_type === 'admin'
        ? '/admin/dashboard'
        : '/dashboard';
    return <Navigate to={dashboard} replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;