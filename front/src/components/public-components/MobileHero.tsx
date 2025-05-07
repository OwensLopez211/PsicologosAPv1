import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const MobileHero = () => {
  const navigate = useNavigate();

  return (
    <section className="px-4 pt-20 pb-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-6"
      >
        <div className="relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "40%" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute -top-2 left-1/2 transform -translate-x-1/2 h-1 bg-gradient-to-r from-[#2A6877] to-[#B4E4D3]"
            aria-hidden="true"
          />
          <h1 className="text-3xl font-bold leading-tight text-gray-800">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-[#2A6877]">
              El psicólogo online que estabas buscando
            </span>
          </h1>
        </div>

        <p className="text-gray-600 text-lg mx-auto">
          Empieza a sentirte mejor con la ayuda de tu psicólogo en 
          <span className="text-[#2A6877] font-medium"> E-mind</span>
        </p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative w-full h-[250px] rounded-xl overflow-hidden shadow-xl"
        >
          <img
            src="/hero-therapy.svg"
            alt="Sesión de terapia psicológica online"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div 
            className="absolute inset-0 bg-gradient-to-tr from-[#2A6877]/20 to-transparent"
            aria-hidden="true"
          />
        </motion.div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-gray-700 shadow-sm"
          >
            ⚡️ Atención inmediata
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-gray-700 shadow-sm"
          >
            🔒 100% Confidencial
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-gray-700 shadow-sm"
          >
            💻 Sesiones online
          </motion.div>
        </div>

        {/* CTA Button */}
        <motion.button 
          onClick={() => navigate('/especialistas')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-[#2A6877] to-[#235A67] text-white py-3 px-6 rounded-lg font-medium shadow-lg flex items-center justify-center gap-2"
        >
          <span>Agenda con tu psicólogo</span>
          <ArrowRightIcon className="w-5 h-5" />
        </motion.button>

        {/* Remove Trust Indicators section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="pt-4 space-y-2"
        >
        </motion.div>
      </motion.div>
    </section>
  );
};

export default MobileHero;