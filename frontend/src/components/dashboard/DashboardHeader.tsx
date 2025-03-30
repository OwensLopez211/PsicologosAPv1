import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardHeader = () => {
  const { user, logout } = useAuth();  // Use logout from AuthContext
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();  // Use the logout function from context
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <img src="/logo.jpeg" alt="MentAliza" className="h-8 w-8 rounded-full" />
            <span className="ml-2 text-xl font-semibold text-gray-900">MentAliza</span>
          </div>
          
          <div className="flex items-center">
            <span className="text-gray-700 mr-4">
              {user?.first_name} {user?.last_name}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-[#2A6877] hover:bg-gray-50 rounded-md transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;