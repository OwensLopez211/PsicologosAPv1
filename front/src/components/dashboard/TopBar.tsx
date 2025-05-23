import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import {
  HomeIcon, UserIcon, CalendarIcon, UsersIcon, 
  UserGroupIcon, MagnifyingGlassIcon, ArrowRightOnRectangleIcon,
  ArrowLeftIcon, CreditCardIcon, StarIcon,
} from '@heroicons/react/24/outline';
import {  AnimatePresence } from 'framer-motion';

// Evento personalizado para recargar datos
export const triggerDataRefresh = (module: string) => {
  console.log(`Triggering refresh event for module: ${module}`);
  const event = new CustomEvent('refreshData', { detail: { module } });
  window.dispatchEvent(event);
};

const TopBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  
  const normalizedUserType = user?.user_type?.toUpperCase() || 'CLIENT';

  // Efecto para detectar cambios en la ruta y actualizar datos cuando corresponda
  useEffect(() => {
    // Verificar si estamos en una página de pacientes (con cualquier variante)
    const isPatientsPage = location.pathname.includes('/patients') || 
                          location.pathname.includes('/pacients');
    
    // Si estamos en la página de pacientes, disparar evento de recarga
    if (isPatientsPage) {
      console.log('Navigated to patients page, triggering refresh');
      triggerDataRefresh('patients');
    }
  }, [location.pathname]);

  // Detectar scroll para cambios visuales, pero no para mover la barra
  useEffect(() => {
    const handleScroll = () => {
      // Solo cambiamos la apariencia visual, no la posición
      if (window.scrollY > 5) {
        if (!scrolled) setScrolled(true);
      } else {
        if (scrolled) setScrolled(false);
      }
    };

    // Usar passive listener para mejor rendimiento
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Manejador para clic en elementos de menú
  const handleMenuItemClick = (path: string) => {
    // Si es el enlace de pacientes, disparar evento de recarga
    // Nota: verificamos ambas variantes "patients" y "pacients"
    if (path.includes('/patients') || path.includes('/pacients')) {
      console.log('Patient module clicked, triggering refresh');
      triggerDataRefresh('patients');
    }
  };

  const getMenuItems = () => {
    const roleSpecificItems = {
      CLIENT: [
        { path: '/dashboard', label: 'Inicio', icon: HomeIcon },
        { path: '/dashboard/profile', label: 'Perfil', icon: UserIcon },
        { path: '/dashboard/appointments', label: 'Citas', icon: CalendarIcon },
        { path: '/dashboard/reviews', label: 'Valoraciones', icon: StarIcon },
        { path: '/especialistas', label: 'Buscar', icon: MagnifyingGlassIcon },
      ],
      PSYCHOLOGIST: [
        { path: '/psicologo/dashboard', label: 'Inicio', icon: HomeIcon },
        { path: '/psicologo/dashboard/profile', label: 'Perfil', icon: UserIcon },
        { path: '/psicologo/dashboard/schedule', label: 'Agenda', icon: CalendarIcon },
        { path: '/psicologo/dashboard/patients', label: 'Pacientes', icon: UsersIcon },
        { path: '/psicologo/dashboard/payments', label: 'Pagos', icon: CreditCardIcon },

        { path: '/psicologo/dashboard/reviews', label: 'Valoraciones', icon: StarIcon },
      ],
      ADMIN: [
        { path: '/admin/dashboard', label: 'Inicio', icon: HomeIcon },
        { path: '/admin/dashboard/profile', label: 'Perfil', icon: UserIcon },
        { path: '/admin/dashboard/payments', label: 'Pagos', icon: CreditCardIcon },
        { path: '/admin/dashboard/pacients', label: 'Pacientes', icon: UsersIcon },
        { path: '/admin/dashboard/psychologists', label: 'Psicólogos', icon: UserGroupIcon },
        { path: '/admin/dashboard/reviews', label: 'Valoraciones', icon: StarIcon },
      ],
    };

    return [...(roleSpecificItems[normalizedUserType as keyof typeof roleSpecificItems] || roleSpecificItems.CLIENT)];
  };

  // Improved outside click handling
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    // Add a small delay to prevent immediate closure when opening
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  // Obtener iniciales para el avatar
  const getInitials = () => {
    if (!user) return 'U';
    const firstInitial = user.first_name ? user.first_name.charAt(0) : '';
    const lastInitial = user.last_name ? user.last_name.charAt(0) : '';
    return (firstInitial + lastInitial).toUpperCase();
  };

  return (
    <>
      {/* Barra superior fija - usando inline styles para máxima compatibilidad */}
      <div 
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          height: '64px',
          zIndex: 9999,
          willChange: 'transform', /* Mejora el rendimiento */
          transform: 'translateZ(0)', /* Fuerza GPU rendering */
        }}
        className={`${
          scrolled 
            ? "bg-white/95 backdrop-blur-md shadow-md border-b border-gray-200" 
            : "bg-white shadow-sm"
        } transition-all duration-300`}
      >
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Brand Section - Versión escritorio (a la izquierda) */}
            <div className="hidden md:flex flex-shrink-0 items-center">
              <Link 
                to="/" 
                className="flex items-center group"
                title="Volver a la página principal"
              >
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#2A6877] to-[#B4E4D3] rounded-full opacity-40 group-hover:opacity-60 blur-sm transition duration-300"></div>
                  <div className="relative h-9 w-9 rounded-full border-2 border-white overflow-hidden flex items-center justify-center bg-white">
                    <img 
                      src="/logo2.webp" 
                      alt="E-mind" 
                      className="h-7 w-7 object-contain transform group-hover:scale-105 transition-transform duration-300" 
                    />
                  </div>
                </div>
                <span className="ml-2.5 text-xl font-semibold text-[#2A6877]">
                E-mind
                </span>
                <div className="ml-2 flex">
                  <ArrowLeftIcon className="h-4 w-4 text-gray-400 group-hover:text-[#2A6877] transition-colors" />
                </div>
              </Link>
            </div>
            
            {/* Versión móvil - Flecha a la izquierda */}
            <div className="flex md:hidden items-center justify-start w-1/4">
              <Link 
                to="/" 
                className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                title="Volver a la página principal"
              >
                <ArrowLeftIcon className="h-4 w-4 text-gray-600" />
              </Link>
            </div>
            
            {/* Versión móvil - Logo centrado */}
            <div className="flex md:hidden items-center justify-center w-2/4">
              <Link 
                to="/" 
                className="flex items-center group"
                title="E-mind"
              >
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#2A6877] to-[#B4E4D3] rounded-full opacity-40 group-hover:opacity-60 blur-sm transition duration-300"></div>
                  <div className="relative h-9 w-9 rounded-full border-2 border-white overflow-hidden flex items-center justify-center bg-white">
                    <img 
                      src="/logo2.webp" 
                      alt="E-mind" 
                      className="h-7 w-7 object-contain transform group-hover:scale-105 transition-transform duration-300" 
                    />
                  </div>
                </div>
              </Link>
            </div>
            
            {/* Desktop Navigation - Improved active styles */}
            <div className="hidden md:flex items-center justify-center flex-1">
              {getMenuItems().map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => handleMenuItemClick(item.path)}
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
            
            {/* User profile dropdown - Para escritorio es normal, para móvil a la derecha */}
            <div className="flex items-center space-x-2 md:w-auto w-1/4 justify-end">
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
                    <span 
                      className={`absolute -right-2 -bottom-1 h-5 w-5 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </div>
                </button>
                
                <AnimatePresence>
                  {isProfileOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-100"
                      style={{
                        animation: 'fadeIn 0.2s ease-out',
                      }}
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
                          Perfil
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
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Barra inferior fija para móviles */}
      <div 
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60px',
          zIndex: 9999,
          willChange: 'transform',
          transform: 'translateZ(0)', /* Fuerza GPU rendering */
        }}
        className="md:hidden bg-white border-t border-gray-200 flex justify-between shadow-lg"
      >
        {getMenuItems().map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => handleMenuItemClick(item.path)}
              className={`flex flex-1 flex-col items-center justify-center px-1 py-1.5 text-[9px] ${
                isActive ? 'text-[#2A6877]' : 'text-gray-600'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-[#2A6877]' : 'text-gray-500'}`} />
              <span className="mt-0.5 text-center max-w-[60px] truncate">{item.label}</span>
              {isActive && (
                <div 
                  className="absolute bottom-0 h-0.5 w-8 bg-[#2A6877] rounded-t-full"
                />
              )}
            </Link>
          );
        })}
      </div>
      {/* Estilo global para animaciones */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(-10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  );
};

export default TopBar;