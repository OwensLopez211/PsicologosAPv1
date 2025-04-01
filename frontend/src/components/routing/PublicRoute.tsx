// PublicRoute.tsx (actualizado)
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../LoadingSpinner';

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();

  // Add this to check if we're on the terms page
  const isTermsPage = location.pathname === '/terminos-y-condiciones';

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

  // Don't redirect if on terms page, even if authenticated
  if (isAuthenticated && user && !isTermsPage) {
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