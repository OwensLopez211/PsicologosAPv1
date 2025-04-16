
import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = (path: string) => {
    setIsMenuOpen(false);
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getDashboardLink = () => {
    switch (user?.user_type) {
      case 'psychologist':
        return '/psicologo/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/dashboard';
    }
  };

  const renderAuthButtons = () => {
    if (isAuthenticated) {
      return (
        <div className="relative group">
          <Link 
            to={getDashboardLink()} 
            className="flex items-center gap-2 px-4 py-1.5 text-white bg-gradient-to-r from-[#2A6877] to-[#1d4b56] rounded-md hover:shadow-md transition-all duration-300 font-sans text-sm group-hover:shadow-[#2A6877]/20"
          >
            <span>Mi Panel</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" 
                clipRule="evenodd" 
              />
            </svg>
          </Link>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      );
    }

    return (
      <>
        <Link 
          to="/login" 
          className="px-4 py-1.5 text-[#2A6877] border border-[#2A6877] rounded-md hover:bg-gray-50 transition-colors font-sans text-sm"
        >
          Iniciar sesión
        </Link>
        <Link 
          to="/registro" 
          className="px-4 py-1.5 text-white bg-[#2A6877] rounded-md hover:bg-[#235A67] transition-colors font-sans text-sm"
        >
          Comenzar
        </Link>
      </>
    );
  };

  const renderMobileAuthButtons = () => {
    if (isAuthenticated) {
      return (
        <a
          onClick={() => handleNavigation(getDashboardLink())}
          className="flex items-center justify-center gap-2 w-full px-4 py-2 text-white bg-gradient-to-r from-[#2A6877] to-[#1d4b56] rounded-md hover:shadow-md transition-all duration-300 font-sans text-sm cursor-pointer"
        >
          <span>Mi Panel</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" 
              clipRule="evenodd" 
            />
          </svg>
        </a>
      );
    }

    return (
      <>
        <a
          onClick={() => handleNavigation('/login')}
          className="block w-full px-4 py-2 text-center text-[#2A6877] border border-[#2A6877] rounded-md hover:bg-gray-50 transition-colors font-sans text-sm cursor-pointer"
        >
          Iniciar sesión
        </a>
        <a
          onClick={() => handleNavigation('/registro')}
          className="block w-full px-4 py-2 text-center text-white bg-[#2A6877] rounded-md hover:bg-[#235A67] transition-colors font-sans text-sm cursor-pointer"
        >
          Comenzar
        </a>
      </>
    );
  };

  return (
    <nav className={`fixed w-full transition-all duration-300 z-40 top-0 ${
      isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-lg' : 'bg-white/80'
    }`}>
      <div className="container mx-auto flex justify-between items-center py-2 px-6">
        <Link to="/" className="flex items-center space-x-3">
          <img 
            src="/logo.jpeg" 
            alt="Bienestar" 
            className="h-10 w-10 rounded-full object-cover border-2 border-[#2A6877]" 
          />
          <div className="flex flex-col">
            <span className="text-[#2A6877] text-xl font-bold tracking-tight">Bienestar</span>
            <span className="text-gray-500 text-xs">Psicología Online</span>
          </div>
        </Link>

        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          <motion.svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            animate={{ rotate: isMenuOpen ? 180 : 0 }}
          >
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </motion.svg>
        </button>

        <div className="hidden lg:flex items-center gap-8">
          <NavLink 
            to="/" 
            className={({isActive}) => `transition-colors font-medium text-sm hover:text-[#2A6877] relative group ${
              isActive ? 'text-[#2A6877]' : 'text-gray-600'
            }`}
          >
            <span>Inicio</span>
            <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-[#2A6877] transform origin-left transition-transform duration-300 ${
              location.pathname === '/' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
            }`} />
          </NavLink>
          <NavLink 
            to="/especialistas" 
            className={({isActive}) => `transition-colors font-medium text-sm hover:text-[#2A6877] relative group ${
              isActive ? 'text-[#2A6877]' : 'text-gray-600'
            }`}
          >
            <span>Especialistas</span>
            <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-[#2A6877] transform origin-left transition-transform duration-300 ${
              location.pathname === '/especialistas' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
            }`} />
          </NavLink>
          <NavLink 
            to="/quienes-somos" 
            className={({isActive}) => `transition-colors font-medium text-sm hover:text-[#2A6877] relative group ${
              isActive ? 'text-[#2A6877]' : 'text-gray-600'
            }`}
          >
            <span>Quiénes somos</span>
            <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-[#2A6877] transform origin-left transition-transform duration-300 ${
              location.pathname === '/quienes-somos' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
            }`} />
          </NavLink>
          <NavLink 
            to="/contacto" 
            className={({isActive}) => `transition-colors font-medium text-sm hover:text-[#2A6877] relative group ${
              isActive ? 'text-[#2A6877]' : 'text-gray-600'
            }`}
          >
            <span>Contacto</span>
            <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-[#2A6877] transform origin-left transition-transform duration-300 ${
              location.pathname === '/contacto' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
            }`} />
          </NavLink>
          <div className="flex items-center gap-4">
            {renderAuthButtons()}
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden fixed top-[64px] left-0 right-0 border-t border-gray-100" // Changed from top-[92px] to top-[64px]
            >
              <div className="px-4 py-4 space-y-4 bg-white/95 backdrop-blur-sm shadow-lg"> {/* Added shadow-lg */}
                <a 
                  onClick={() => handleNavigation('/')} 
                  className={`block transition-colors font-medium text-sm py-2 cursor-pointer ${
                    location.pathname === '/' ? 'text-[#2A6877]' : 'text-gray-600 hover:text-[#2A6877]'
                  }`}
                >
                  Inicio
                </a>
                <a 
                  onClick={() => handleNavigation('/especialistas')} 
                  className={`block transition-colors font-medium text-sm py-2 cursor-pointer ${
                    location.pathname === '/especialistas' ? 'text-[#2A6877]' : 'text-gray-600 hover:text-[#2A6877]'
                  }`}
                >
                  Especialistas
                </a>
                <a 
                  onClick={() => handleNavigation('/quienes-somos')} 
                  className={`block transition-colors font-medium text-sm py-2 cursor-pointer ${
                    location.pathname === '/quienes-somos' ? 'text-[#2A6877]' : 'text-gray-600 hover:text-[#2A6877]'
                  }`}
                >
                  Quiénes somos
                </a>
                <a 
                  onClick={() => handleNavigation('/contacto')} 
                  className={`block transition-colors font-medium text-sm py-2 cursor-pointer ${
                    location.pathname === '/contacto' ? 'text-[#2A6877]' : 'text-gray-600 hover:text-[#2A6877]'
                  }`}
                >
                  Contacto
                </a>
                <div className="pt-4 space-y-2">
                  {renderMobileAuthButtons()}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;