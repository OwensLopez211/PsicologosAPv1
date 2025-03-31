// src/components/auth/UserTypeSelection.tsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

type UserType = 'patient' | 'psychologist' | null;

interface UserTypeSelectionProps {
  onSelectUserType: (type: UserType) => void;
}

const UserTypeSelection = ({ onSelectUserType }: UserTypeSelectionProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#B4E4D3] via-white to-[#B4E4D3]/30 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <Link to="/" className="block relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#2A6877] to-[#B4E4D3] rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <img
            className="relative mx-auto h-24 w-24 rounded-xl shadow-lg transform group-hover:scale-105 transition duration-300"
            src="/logo.jpeg"
            alt="Bienestar"
          />
        </Link>
        <h2 className="mt-6 text-center text-4xl font-bold text-[#2A6877]">Crear una cuenta</h2>
        <p className="mt-3 text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="font-semibold text-[#2A6877] hover:text-[#235A67] underline decoration-2 decoration-[#B4E4D3] underline-offset-2">
            Inicia sesión aquí
          </Link>
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white/80 backdrop-blur-sm py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          <h3 className="text-xl font-semibold text-gray-800 mb-8 text-center">
            ¿Cómo deseas utilizar Bienestar?
          </h3>
          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectUserType('patient')}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white rounded-xl border-2 border-gray-200 hover:border-[#2A6877] hover:bg-gray-50 transition-all duration-300 group"
            >
              <span className="text-2xl">👤</span>
              <div className="text-left">
                <span className="block text-lg font-semibold text-gray-800 group-hover:text-[#2A6877]">Soy Paciente</span>
                <span className="text-sm text-gray-500">Busco ayuda profesional</span>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectUserType('psychologist')}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white rounded-xl border-2 border-gray-200 hover:border-[#2A6877] hover:bg-gray-50 transition-all duration-300 group"
            >
              <span className="text-2xl">👨‍⚕️</span>
              <div className="text-left">
                <span className="block text-lg font-semibold text-gray-800 group-hover:text-[#2A6877]">Soy Psicólogo</span>
                <span className="text-sm text-gray-500">Quiero ofrecer mis servicios</span>
              </div>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserTypeSelection;