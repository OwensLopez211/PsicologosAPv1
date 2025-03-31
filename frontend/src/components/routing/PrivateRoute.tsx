// PrivateRoute.tsx (actualizado)
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../LoadingSpinner';

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('client' | 'psychologist' | 'admin')[];
}

const PrivateRoute = ({ children, allowedRoles = [] }: PrivateRouteProps) => {
  const { isAuthenticated, user, loading, refreshUserSession } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      // Si ya está cargando desde AuthContext, esperar
      if (loading) return;
      
      // Si no está autenticado, pero hay un token de refresco, intentar renovar
      if (!isAuthenticated && localStorage.getItem('refresh_token')) {
        try {
          const success = await refreshUserSession();
          setIsChecking(false);
          return;
        } catch (error) {
          console.error('Error refreshing session:', error);
        }
      }
      
      setIsChecking(false);
    };

    checkAuth();
  }, [isAuthenticated, loading, refreshUserSession]);

  // Mostrar spinner mientras se verifica la autenticación
  if (loading || isChecking) {
    return <LoadingSpinner />;
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si hay roles permitidos especificados y el usuario no tiene uno de ellos
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.user_type)) {
    // Redirigir a la página de inicio o a una página de acceso denegado
    return <Navigate to="/" replace />;
  }

  // Si todo está bien, mostrar el contenido protegido
  return <>{children}</>;
};

export default PrivateRoute;