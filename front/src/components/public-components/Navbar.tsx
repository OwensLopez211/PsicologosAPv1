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

  // Handle scroll effect with throttling for performance
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    // Throttle scroll event for better performance
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const throttledScroll = () => {
      if (timeoutId === null) {
        timeoutId = setTimeout(() => {
          handleScroll();
          timeoutId = null;
        }, 100);
      }
    };

    window.addEventListener('scroll', throttledScroll);
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen && event.target instanceof HTMLElement && !event.target.closest('nav')) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

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

  // Navigation items for reuse
  const navItems = [
    { path: '/', label: 'Inicio' },
    { path: '/especialistas', label: 'Especialistas' },
    { path: '/quienes-somos', label: 'Quiénes somos' },
    { path: '/contacto', label: 'Contacto' },
    { path: '/preguntas-frecuentes', label: 'Preguntas frecuentes' }
  ];

  const renderNavItems = () => {
    return navItems.map((item) => (
      <NavLink 
        key={item.path}
        to={item.path} 
        className={({isActive}) => `relative group flex items-center transition-colors font-medium text-sm hover:text-[#2A6877] ${
          isActive ? 'text-[#2A6877]' : 'text-gray-600'
        }`}
      >
        <span>{item.label}</span>
        <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-[#2A6877] transform origin-left transition-transform duration-300 ${
          location.pathname === item.path ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
        }`} />
      </NavLink>
    ));
  };

  const renderMobileNavItems = () => {
    return navItems.map((item) => (
      <motion.a 
        key={item.path}
        onClick={() => handleNavigation(item.path)} 
        className={`block transition-colors font-medium text-sm py-3 px-4 rounded-lg cursor-pointer ${
          location.pathname === item.path 
            ? 'text-[#2A6877] bg-[#2A6877]/10' 
            : 'text-gray-600 hover:text-[#2A6877] hover:bg-gray-50'
        }`}
        whileHover={{ x: 4, backgroundColor: location.pathname === item.path ? '#2A6877/10' : '#f9fafb' }}
        whileTap={{ scale: 0.98 }}
        role="menuitem"
        aria-current={location.pathname === item.path ? 'page' : undefined}
      >
        {item.label}
      </motion.a>
    ));
  };

  const renderAuthButtons = () => {
    if (isAuthenticated) {
      return (
        <motion.div 
          className="relative group"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Link 
            to={getDashboardLink()} 
            className="flex items-center gap-2 px-5 py-2 text-white bg-gradient-to-r from-[#2A6877] to-[#1d4b56] rounded-lg hover:shadow-lg hover:shadow-[#2A6877]/20 transition-all duration-300 font-sans text-sm group-hover:shadow-md"
          >
            <span>Mi Panel</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" 
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
        </motion.div>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Link 
            to="/login" 
            className="px-5 py-2 text-[#2A6877] border border-[#2A6877] rounded-lg hover:bg-gray-50 transition-colors font-sans text-sm"
          >
            Iniciar sesión
          </Link>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Link 
            to="/registro" 
            className="px-5 py-2 text-white bg-[#2A6877] rounded-lg hover:bg-[#235A67] hover:shadow-md hover:shadow-[#2A6877]/20 transition-all font-sans text-sm"
          >
            Comenzar
          </Link>
        </motion.div>
      </div>
    );
  };

  const renderMobileAuthButtons = () => {
    if (isAuthenticated) {
      return (
        <motion.a
          onClick={() => handleNavigation(getDashboardLink())}
          className="flex items-center justify-center gap-2 w-full px-4 py-3 text-white bg-gradient-to-r from-[#2A6877] to-[#1d4b56] rounded-lg hover:shadow-md transition-all duration-300 font-sans text-sm cursor-pointer"
          whileHover={{ scale: 1.02, boxShadow: "0 4px 12px -2px rgba(42, 104, 119, 0.3)" }}
          whileTap={{ scale: 0.98 }}
          role="button"
          aria-label="Ir a mi panel"
        >
          <span>Mi Panel</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4" 
            viewBox="0 0 20 20" 
            fill="currentColor"
            aria-hidden="true" 
          >
            <path 
              fillRule="evenodd" 
              d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" 
              clipRule="evenodd" 
            />
          </svg>
        </motion.a>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <motion.a
          onClick={() => handleNavigation('/login')}
          className="flex justify-center items-center w-full px-4 py-3 text-center text-[#2A6877] border border-[#2A6877] rounded-lg hover:bg-gray-50 transition-colors font-sans text-sm cursor-pointer"
          whileHover={{ scale: 1.02, backgroundColor: '#f9fafb' }}
          whileTap={{ scale: 0.98 }}
          role="button"
          aria-label="Iniciar sesión"
        >
          Iniciar sesión
        </motion.a>
        <motion.a
          onClick={() => handleNavigation('/registro')}
          className="flex justify-center items-center w-full px-4 py-3 text-center text-white bg-[#2A6877] rounded-lg transition-colors font-sans text-sm cursor-pointer"
          whileHover={{ scale: 1.02, backgroundColor: '#235A67' }}
          whileTap={{ scale: 0.98 }}
          role="button"
          aria-label="Comenzar registro"
        >
          Comenzar
        </motion.a>
      </div>
    );
  };

  // Logo animation variants
  const logoVariants = {
    normal: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.2 } }
  };

  return (
    <nav 
      className={`fixed w-full transition-all duration-300 z-40 top-0 ${
        isScrolled 
          ? 'bg-white shadow-lg py-2' 
          : 'bg-white py-3'
      }`}
    >
      <div className="container mx-auto flex justify-between items-center px-4 md:px-6">
        <motion.div
          initial="normal"
          whileHover="hover"
          variants={logoVariants}
        >
          <Link to="/" className="flex items-center gap-3">
            <div className="relative h-14 w-14 flex-shrink-0">
              <img 
                src="/logo2.webp" 
                alt="E-mind" 
                className="h-full w-full object-contain transition-all"
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[#2A6877] text-2xl font-bold leading-tight">E-mind</span>
              <span className="text-gray-500 text-sm leading-tight">Encuentra tu bienestar</span>
            </div>
          </Link>
        </motion.div>

        {/* Mobile menu button */}
        <motion.button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="xl:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors relative z-50"
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div 
            className="w-6 h-6 flex flex-col justify-center items-center"
            animate={isMenuOpen ? "open" : "closed"}
          >
            <motion.span 
              className="w-5 h-0.5 bg-gray-800 block mb-1.5"
              variants={{
                closed: { rotate: 0, translateY: 0 },
                open: { rotate: 45, translateY: 7 }
              }}
              transition={{ duration: 0.3 }}
            />
            <motion.span 
              className="w-5 h-0.5 bg-gray-800 block mb-1.5"
              variants={{
                closed: { opacity: 1 },
                open: { opacity: 0 }
              }}
              transition={{ duration: 0.3 }}
            />
            <motion.span 
              className="w-5 h-0.5 bg-gray-800 block"
              variants={{
                closed: { rotate: 0, translateY: 0 },
                open: { rotate: -45, translateY: -7 }
              }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        </motion.button>

        {/* Desktop Navigation */}
        <div className="hidden xl:flex items-center gap-6 xl:gap-8">
          <div className="flex items-center gap-6 xl:gap-8">
            {renderNavItems()}
          </div>
          <div className="flex items-center gap-3 ml-4">
            {renderAuthButtons()}
          </div>
        </div>

        {/* Mobile menu overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="xl:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
              onClick={() => setIsMenuOpen(false)}
              aria-hidden="true"
            />
          )}
        </AnimatePresence>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="xl:hidden fixed top-0 right-0 h-[100dvh] w-4/5 max-w-sm bg-white shadow-xl z-40 overflow-y-auto rounded-l-2xl"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ 
                type: 'spring', 
                damping: 25, 
                stiffness: 300,
                duration: 0.4
              }}
              role="dialog"
              aria-modal="true"
              aria-label="Menú de navegación"
            >
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-gray-100 flex justify-center items-center bg-white sticky top-0 z-10 rounded-tl-2xl relative">
                  <Link 
                    to="/" 
                    className="flex flex-col items-center gap-1" 
                    onClick={() => setIsMenuOpen(false)}
                    aria-label="Ir a la página de inicio"
                  >
                    <div className="relative h-20 w-20 flex-shrink-0">
                      <img 
                        src="/logo2.webp" 
                        alt="E-mind" 
                        className="h-full w-full object-contain transition-all"
                        width="80"
                        height="80"
                        loading="eager"
                      />
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-[#2A6877] text-xl font-bold leading-tight">E-mind</span>
                      <span className="text-gray-500 text-sm leading-tight">Encuentra tu bienestar</span>
                    </div>
                  </Link>
                </div>
                
                <div className="p-4 flex flex-col flex-1 bg-white">
                  <nav className="space-y-1 mb-6">
                    {renderMobileNavItems()}
                  </nav>
                  
                  <div className="mt-auto space-y-4">
                    <div className="border-t border-gray-100 pt-4">
                      {renderMobileAuthButtons()}
                    </div>
                    
                    <div className="text-center text-xs text-gray-500 pb-4 rounded-bl-2xl">
                      © {new Date().getFullYear()} E-mind - Encuentra tu bienestar
                    </div>
                  </div>
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