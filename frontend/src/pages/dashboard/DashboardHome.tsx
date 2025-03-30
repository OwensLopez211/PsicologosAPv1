import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardHome = () => {
  const { user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Show welcome popup when component mounts
    setShowWelcome(true);
    
    // Hide popup after 5 seconds
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  const getWelcomeMessage = () => {
    switch (user?.user_type?.toUpperCase()) {
      case 'CLIENT':
        return 'Bienvenido a tu espacio personal';
      case 'PSYCHOLOGIST':
        return 'Bienvenido a tu portal profesional';
      case 'ADMIN':
        return 'Panel de Administración';
      default:
        return 'Bienvenido';
    }
  };

  return (
    <div className="space-y-6 relative">
      <h1 className="text-3xl font-bold text-gray-800">{getWelcomeMessage()}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Widgets específicos según el tipo de usuario se agregarán aquí */}
      </div>
      
      {/* Welcome Popup */}
      <AnimatePresence>
        {showWelcome && user && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 right-4 bg-white shadow-lg rounded-lg p-4 z-50 border-l-4 border-[#2A6877] max-w-md"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <svg className="h-10 w-10 text-[#2A6877]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  ¡Bienvenido, {user.first_name}!
                </h3>
                <div className="mt-2 text-sm text-gray-500">
                  <p>
                    Nos alegra verte de nuevo en MentAliza. Estamos aquí para ayudarte en tu camino.
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setShowWelcome(false)}
                    className="text-sm font-medium text-[#2A6877] hover:text-[#1d4b56]"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardHome;