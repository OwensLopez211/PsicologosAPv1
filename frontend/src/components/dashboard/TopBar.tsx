import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import {
  HomeIcon, UserIcon, CalendarIcon, UsersIcon, 
  UserGroupIcon, MagnifyingGlassIcon, ArrowRightOnRectangleIcon,
  ArrowLeftIcon, CreditCardIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const TopBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  
  const normalizedUserType = user?.user_type?.toUpperCase() || 'CLIENT';

  // Detectar scroll para cambiar el estilo del header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
        { path: '/admin/dashboard/payments', label: 'Verificar Pagos', icon: CreditCardIcon },
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

  // Obtener iniciales para el avatar
  const getInitials = () => {
    if (!user) return 'U';
    const firstInitial = user.first_name ? user.first_name.charAt(0) : '';
    const lastInitial = user.last_name ? user.last_name.charAt(0) : '';
    return (firstInitial + lastInitial).toUpperCase();
  };

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`sticky top-0 z-50 ${
        scrolled 
          ? "bg-white/90 backdrop-blur-md shadow-md" 
          : "bg-white shadow-sm"
      } transition-all duration-300`}
    >
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand Section */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center group mr-6"
              title="Volver a la página principal"
            >
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#2A6877] to-[#B4E4D3] rounded-full opacity-40 group-hover:opacity-60 blur-sm transition duration-300"></div>
                <img 
                  src="/logo.jpeg" 
                  alt="Bienestar" 
                  className="relative h-9 w-9 rounded-full border-2 border-white object-cover transform group-hover:scale-105 transition-transform duration-300" 
                />
              </div>
              <span className="ml-2.5 text-xl font-semibold text-[#2A6877] hidden sm:block">
                Bienestar
              </span>
              <motion.div 
                whileHover={{ x: -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="ml-2 hidden sm:flex" 
              >
                <ArrowLeftIcon className="h-4 w-4 text-gray-400 group-hover:text-[#2A6877] transition-colors" />
              </motion.div>
            </Link>
            
            {/* Back to main site - Mobile version */}
            <Link 
              to="/" 
              className="sm:hidden flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              title="Volver a la página principal"
            >
              <ArrowLeftIcon className="h-4 w-4 text-gray-600" />
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {getMenuItems().map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    isActive 
                      ? 'text-[#2A6877] bg-[#2A6877]/10 shadow-sm' 
                      : 'text-gray-600 hover:text-[#2A6877] hover:bg-[#2A6877]/5'
                  }`}
                >
                  <Icon className={`h-5 w-5 mr-1.5 ${isActive ? 'text-[#2A6877]' : 'text-gray-500'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
          
          <div className="flex items-center space-x-2">
            
            {/* Mobile menu button */}
            <div className="md:hidden relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1.5 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none transition-colors"
                aria-expanded={isMenuOpen ? 'true' : 'false'}
                aria-label="Menu principal"
              >
                <svg className={`h-6 w-6 transition-transform duration-300 ${isMenuOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              {/* Mobile menu dropdown */}
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-1.5 z-50 border border-gray-100"
                  >
                    {/* Back to main site - Mobile menu option */}
                    <Link
                      to="/"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-[#2A6877]/5 border-b border-gray-100"
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
                          className={`flex items-center px-4 py-2.5 text-sm ${
                            isActive 
                              ? 'text-[#2A6877] bg-[#2A6877]/10 font-medium' 
                              : 'text-gray-700 hover:bg-[#2A6877]/5'
                          }`}
                        >
                          <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-[#2A6877]' : 'text-gray-500'}`} />
                          {item.label}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* User profile dropdown */}
            <div className="relative ml-2" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
                aria-expanded={isProfileOpen ? 'true' : 'false'}
                aria-label="Menú de usuario"
              >
                <span className="hidden sm:inline-block mr-1 max-w-[150px] truncate">
                  {user?.first_name} {user?.last_name}
                </span>
                <div className="relative">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#2A6877] to-[#B4E4D3] flex items-center justify-center text-white font-medium text-sm">
                    {getInitials()}
                  </div>
                  <motion.span 
                    animate={{ rotate: isProfileOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute -right-2 -bottom-1 h-5 w-5 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </motion.span>
                </div>
              </button>
              
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-100"
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.first_name} {user?.last_name}</p>
                      <p className="text-xs text-gray-500 mt-1 truncate">{user?.email}</p>
                      <div className="mt-2 text-xs inline-flex items-center px-2 py-0.5 rounded-full bg-[#2A6877]/10 text-[#2A6877] font-medium">
                        {normalizedUserType === 'CLIENT' ? 'Paciente' : 
                          normalizedUserType === 'PSYCHOLOGIST' ? 'Psicólogo' : 'Administrador'}
                      </div>
                    </div>
                    
                    <div className="py-1">
                      <Link
                        to={normalizedUserType === 'CLIENT' ? '/dashboard/profile' : 
                             normalizedUserType === 'PSYCHOLOGIST' ? '/psicologo/dashboard/profile' : 
                             '/admin/dashboard/profile'}
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <UserIcon className="h-5 w-5 mr-3 text-gray-500" />
                        Mi Perfil
                      </Link>
                      
                    </div>
                    
                    <div className="py-1 border-t border-gray-100">
                      {/* Back to main site - Profile dropdown option */}
                      <Link
                        to="/"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <ArrowLeftIcon className="h-5 w-5 mr-3 text-gray-500" />
                        Página principal
                      </Link>
                      
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          handleLogout();
                        }}
                        className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 text-red-500" />
                        Cerrar sesión
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      
      {/* Simplified Mobile Nav - Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 flex justify-between z-40">
        {getMenuItems().slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-1 flex-col items-center justify-center py-2 text-xs ${
                isActive ? 'text-[#2A6877]' : 'text-gray-600'
              }`}
            >
              <Icon className={`h-6 w-6 mb-1 ${isActive ? 'text-[#2A6877]' : 'text-gray-500'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </motion.header>
  );
};

export default TopBar;