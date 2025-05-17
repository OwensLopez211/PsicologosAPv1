import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

type UserType = 'patient' | 'psychologist' | null;

interface UserTypeSelectionProps {
  onSelectUserType: (type: UserType) => void;
}

const UserTypeSelection = ({ onSelectUserType }: UserTypeSelectionProps) => {
  const [hoveredType, setHoveredType] = useState<UserType>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#B4E4D3]/70 via-white to-[#B4E4D3]/30 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-[#2A6877]/10 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-[#B4E4D3]/20 blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 rounded-full bg-[#2A6877]/5 blur-2xl"></div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <Link to="/" className="block relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#2A6877] to-[#B4E4D3] rounded-lg blur opacity-25 group-hover:opacity-60 transition duration-700"></div>
          <img
            className="relative mx-auto h-24 w-24 rounded-xl shadow-lg transform group-hover:scale-105 transition duration-300"
            src="/logo2.webp"
            alt="E-mind"
          />
        </Link>
        <h2 className="mt-6 text-center text-4xl font-bold text-[#2A6877]">Crear una cuenta</h2>
        <p className="mt-3 text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="font-semibold text-[#2A6877] hover:text-[#235A67] underline decoration-2 decoration-[#B4E4D3] underline-offset-2 transition-colors">
            Inicia sesión aquí
          </Link>
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-white/90 backdrop-blur-md py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-white/50">
          <h3 className="text-xl font-semibold text-gray-800 mb-8 text-center">
            ¿Cómo deseas utilizar E-mind?
          </h3>
          
          <div className="space-y-5">
            <motion.div 
              className="relative"
              onHoverStart={() => setHoveredType('patient')}
              onHoverEnd={() => setHoveredType(null)}
            >
              <AnimatePresence>
                {hoveredType === 'patient' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute -right-10 top-1/2 -translate-y-1/2 bg-white p-3 rounded-xl shadow-lg text-xs text-gray-600 w-32 text-center z-10"
                  >
                    Encuentra el apoyo que necesitas
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent border-r-white"></div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelectUserType('patient')}
                className={`w-full flex items-center gap-3 px-6 py-5 rounded-xl border-2 transition-all duration-300 group ${
                  hoveredType === 'patient' 
                    ? 'border-[#2A6877] bg-gradient-to-r from-[#2A6877]/5 to-transparent shadow-md' 
                    : 'border-gray-200 bg-white hover:border-[#2A6877]/50 hover:bg-gray-50'
                }`}
              >
                <div className="relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    hoveredType === 'patient' 
                      ? 'bg-[#2A6877] text-white' 
                      : 'bg-[#2A6877]/10 text-[#2A6877]'
                  } transition-colors duration-300`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <motion.div
                    animate={{ 
                      scale: hoveredType === 'patient' ? 1.2 : 1,
                      opacity: hoveredType === 'patient' ? 1 : 0 
                    }}
                    className="absolute -right-1 -top-1 bg-green-500 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                </div>
                <div className="text-left flex-1">
                  <span className={`block text-lg font-semibold ${
                    hoveredType === 'patient' ? 'text-[#2A6877]' : 'text-gray-800 group-hover:text-[#2A6877]'
                  } transition-colors`}>
                    Soy Paciente
                  </span>
                  <span className="text-sm text-gray-500">Busco ayuda profesional</span>
                </div>
                <div className={`${hoveredType === 'patient' ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#2A6877]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </motion.button>
            </motion.div>

            <motion.div 
              className="relative"
              onHoverStart={() => setHoveredType('psychologist')}
              onHoverEnd={() => setHoveredType(null)}
            >
              <AnimatePresence>
                {hoveredType === 'psychologist' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute -right-10 top-1/2 -translate-y-1/2 bg-white p-3 rounded-xl shadow-lg text-xs text-gray-600 w-32 text-center z-10"
                  >
                    Ayuda a otros con tu experiencia
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent border-r-white"></div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelectUserType('psychologist')}
                className={`w-full flex items-center gap-3 px-6 py-5 rounded-xl border-2 transition-all duration-300 group ${
                  hoveredType === 'psychologist' 
                    ? 'border-[#2A6877] bg-gradient-to-r from-[#2A6877]/5 to-transparent shadow-md' 
                    : 'border-gray-200 bg-white hover:border-[#2A6877]/50 hover:bg-gray-50'
                }`}
              >
                <div className="relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    hoveredType === 'psychologist' 
                      ? 'bg-[#2A6877] text-white' 
                      : 'bg-[#2A6877]/10 text-[#2A6877]'
                  } transition-colors duration-300`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                  <motion.div
                    animate={{ 
                      scale: hoveredType === 'psychologist' ? 1.2 : 1,
                      opacity: hoveredType === 'psychologist' ? 1 : 0 
                    }}
                    className="absolute -right-1 -top-1 bg-green-500 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                </div>
                <div className="text-left flex-1">
                  <span className={`block text-lg font-semibold ${
                    hoveredType === 'psychologist' ? 'text-[#2A6877]' : 'text-gray-800 group-hover:text-[#2A6877]'
                  } transition-colors`}>
                    Soy Psicólogo
                  </span>
                  <span className="text-sm text-gray-500">Quiero ofrecer mis servicios</span>
                </div>
                <div className={`${hoveredType === 'psychologist' ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#2A6877]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </motion.button>
            </motion.div>
          </div>
          
          <div className="mt-8 text-center text-xs text-gray-500">
            <p>Al crear una cuenta, aceptas nuestros{' '}
              <Link to="/terminos" className="text-[#2A6877] hover:text-[#235A67] underline">
                Términos y Condiciones
              </Link>{' '}
              y{' '}
              <Link to="/privacidad" className="text-[#2A6877] hover:text-[#235A67] underline">
                Política de Privacidad
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserTypeSelection;