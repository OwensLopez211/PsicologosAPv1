// PublicRoute.tsx (actualizado)
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../LoadingSpinner';

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Pequeño retraso para asegurar que el estado de autenticación está correctamente cargado
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (loading || isChecking) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated && user) {
    // Redireccionar al dashboard según el tipo de usuario
    const userType = user.user_type?.toLowerCase();
    const dashboard = userType === 'psychologist'
      ? '/psicologo/dashboard'
      : userType === 'admin'
        ? '/admin/dashboard'
        : '/dashboard';
    return <Navigate to={dashboard} replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;