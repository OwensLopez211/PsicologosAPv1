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

  // Efecto para gestionar el estado de carga inicial
  useEffect(() => {
    // Simular una carga breve para suavizar la transición
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Efecto para detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Redirigir si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Variantes para las animaciones
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
    // Añadir overflow-x-hidden para evitar scroll horizontal y min-h-screen para ocupar al menos toda la altura
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 overflow-x-hidden">
      {/* TopBar con efecto de elevación al hacer scroll */}
      <div className={`sticky top-0 z-50 transition-shadow duration-300 ${
        scrolled ? 'shadow-md bg-white/80 backdrop-blur-sm' : 'bg-white'
      }`}>
        <TopBar />
      </div>
      
      {/* Overlay de carga inicial */}
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
              {/* Logo o spinner de carga */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#2A6877] to-[#B4E4D3] flex items-center justify-center text-white text-2xl font-bold">
                B
              </div>
              <p className="mt-4 text-gray-600 font-medium">Cargando...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Contenedor flex que ocupa todo el espacio disponible */}
      <div className="flex flex-col flex-grow">
        {/* Decoración sutil de fondo - asegurar que no cause overflow */}
        <div className="fixed top-0 right-0 -z-10 w-1/2 h-1/2 bg-[#B4E4D3]/10 blur-3xl rounded-full transform translate-x-1/3 -translate-y-1/4"></div>
        <div className="fixed bottom-0 left-0 -z-10 w-1/2 h-1/2 bg-[#2A6877]/5 blur-3xl rounded-full transform -translate-x-1/3 translate-y-1/4"></div>
        
        {/* Contenido principal con animaciones de transición entre rutas */}
        <motion.main 
          className="flex-grow p-4 md:p-6 lg:p-8 mx-auto w-full max-w-full"
          variants={containerVariants}
          initial="initial"
          animate="animate"
          key={location.pathname}
        >
          {/* Contenedor para las rutas con animación */}
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
        
        {/* Footer siempre al final */}
        <footer className="mt-auto text-center text-sm text-gray-500 py-4">
          <p>© {new Date().getFullYear()} Bienestar - Plataforma de Salud Mental</p>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;