import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  onMenuClick: () => void;
}

const TopBar = ({ onMenuClick }: TopBarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <img src="/logo.jpeg" alt="MentAliza" className="h-8 w-8 rounded-full ml-2 md:ml-0" />
            <span className="ml-2 text-xl font-semibold text-gray-900">MentAliza</span>
          </div>
          
          <div className="flex items-center">
            <span className="text-gray-700 mr-4 hidden sm:inline">
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

export default TopBar;