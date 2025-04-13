import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import {
  HomeIcon, UserIcon, CalendarIcon, UsersIcon, 
  UserGroupIcon, MagnifyingGlassIcon, ArrowRightOnRectangleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const TopBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const normalizedUserType = user?.user_type?.toUpperCase() || 'CLIENT';

  const getMenuItems = () => {
    const roleSpecificItems = {
      CLIENT: [
        { path: '/dashboard', label: 'Inicio', icon: HomeIcon },
        { path: '/dashboard/profile', label: 'Mi Perfil', icon: UserIcon },
        { path: '/dashboard/appointments', label: 'Mis Citas', icon: CalendarIcon },
        { path: '/dashboard/psychologists', label: 'Buscar Psicólogos', icon: MagnifyingGlassIcon },
      ],
      PSYCHOLOGIST: [
        { path: '/psicologo/dashboard', label: 'Inicio', icon: HomeIcon },
        { path: '/psicologo/dashboard/profile', label: 'Mi Perfil', icon: UserIcon },
        { path: '/psicologo/dashboard/schedule', label: 'Mi Agenda', icon: CalendarIcon },
        { path: '/psicologo/dashboard/patients', label: 'Mis Pacientes', icon: UsersIcon },
      ],
      ADMIN: [
        { path: '/admin/dashboard', label: 'Inicio', icon: HomeIcon },
        { path: '/admin/dashboard/profile', label: 'Mi Perfil', icon: UserIcon },
        { path: '/admin/dashboard/pacients', label: 'Pacientes', icon: UsersIcon },
        { path: '/admin/dashboard/psychologists', label: 'Psicólogos', icon: UserGroupIcon },
      ],
    };

    return [...(roleSpecificItems[normalizedUserType as keyof typeof roleSpecificItems] || roleSpecificItems.CLIENT)];
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center group mr-6"
              title="Volver a la página principal"
            >
              <img src="/logo.jpeg" alt="Bienestar" className="h-8 w-8 rounded-full" />
              <span className="ml-2 text-xl font-semibold text-gray-900">Bienestar</span>
              <ArrowLeftIcon className="h-4 w-4 ml-2 text-gray-400 group-hover:text-[#2A6877] transition-colors" />
            </Link>
            
            {/* Back to main site - Mobile version */}
            <Link 
              to="/" 
              className="hidden xs:flex md:hidden items-center justify-center h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              title="Volver a la página principal"
            >
              <ArrowLeftIcon className="h-4 w-4 text-gray-600" />
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {getMenuItems().map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive 
                      ? 'text-[#2A6877] bg-blue-50' 
                      : 'text-gray-600 hover:text-[#2A6877] hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-1" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
          
          <div className="flex items-center">
            {/* Mobile menu button */}
            <div className="md:hidden relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              {/* Mobile menu dropdown */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  {/* Back to main site - Mobile menu option */}
                  <Link
                    to="/"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-b"
                  >
                    <ArrowLeftIcon className="h-5 w-5 mr-2 text-gray-400" />
                    Página principal
                  </Link>
                  
                  {getMenuItems().map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center px-4 py-2 text-sm ${
                          isActive ? 'text-[#2A6877] bg-gray-50' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-2" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* User profile dropdown */}
            <div className="relative ml-4" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
              >
                <span className="hidden sm:inline-block mr-2">
                  {user?.first_name} {user?.last_name}
                </span>
                <div className="h-8 w-8 rounded-full bg-[#2A6877] flex items-center justify-center text-white">
                  {user?.first_name?.[0]?.toUpperCase() || 'U'}
                </div>
              </button>
              
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 text-xs text-gray-500 border-b">
                    Conectado como {user?.email}
                  </div>
                  {/* Back to main site - Profile dropdown option */}
                  <Link
                    to="/"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-b"
                  >
                    <ArrowLeftIcon className="h-5 w-5 mr-2 text-gray-400" />
                    Página principal
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2 text-gray-400" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;