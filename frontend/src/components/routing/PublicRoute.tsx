import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const { user } = useAuth();

  if (user) {
    // Redirect authenticated users based on their role
    switch (user.user_type) {
      case 'client':
        return <Navigate to="/dashboard" replace />;
      case 'psychologist':
        return <Navigate to="/psicologo/dashboard" replace />;
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default PublicRoute;