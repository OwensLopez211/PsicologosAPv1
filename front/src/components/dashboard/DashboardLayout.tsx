import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from './TopBar';

const DashboardLayout = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  // Effect for initial loading state
  useEffect(() => {
    // Simulate a brief loading period for smooth transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Improved scroll detection effect - solo para cambios visuales
  useEffect(() => {
    const handleScroll = () => {
      // Detect scrolling for UI adjustments
      if (window.scrollY > 10) {
        if (!scrolled) setScrolled(true);
      } else {
        if (scrolled) setScrolled(false);
      }
    };
    
    // Use passive listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Animation variants
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        duration: 0.4,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  const contentVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    },
    exit: { 
      opacity: 0,
      y: 20,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 overflow-x-hidden">
      {/* TopBar component es ya fijo en su propia implementación */}
      <TopBar />
      
      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="flex flex-col items-center"
            >
              {/* Logo or loading spinner */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#2A6877] to-[#B4E4D3] flex items-center justify-center text-white text-2xl font-bold">
                E
              </div>
              <p className="mt-4 text-gray-600 font-medium">Cargando...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main content area with proper spacing for fixed headers/footers */}
      <div 
        className="flex flex-col flex-grow" 
        style={{ 
          paddingTop: '80px', /* Espacio para la barra superior */
          paddingBottom: '80px' /* Espacio para la barra inferior en móvil */
        }}
      >
        {/* Sutile background decorations */}
        <div className="fixed top-0 right-0 -z-10 w-1/2 h-1/2 bg-[#B4E4D3]/10 blur-3xl rounded-full transform translate-x-1/3 -translate-y-1/4"></div>
        <div className="fixed bottom-0 left-0 -z-10 w-1/2 h-1/2 bg-[#2A6877]/5 blur-3xl rounded-full transform -translate-x-1/3 translate-y-1/4"></div>
        
        {/* Main content with animations for route transitions */}
        <motion.main 
          className="flex-grow px-2 sm:px-4 md:px-6 lg:px-8 mx-auto w-full max-w-full"
          variants={containerVariants}
          initial="initial"
          animate="animate"
          key={location.pathname}
        >
          {/* Content container with animation */}
          <motion.div
            className="w-full"
            variants={contentVariants}
            key={location.pathname}
          >
            <AnimatePresence mode="wait">
              <Outlet />
            </AnimatePresence>
          </motion.div>
        </motion.main>
      </div>
    </div>
  );
};

export default DashboardLayout;