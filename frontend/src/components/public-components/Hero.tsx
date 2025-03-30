import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const Hero = () => {
  const navigate = useNavigate();

  const handleSpecialistsClick = () => {
    navigate('/especialistas');
  };

  return (
    <section 
      className="container mx-auto px-6 py-12 md:py-20"
      aria-label="Sección principal"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-left space-y-8"
        >
          <div className="relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "40%" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="absolute -top-2 left-0 h-1 bg-gradient-to-r from-[#2A6877] to-[#B4E4D3]"
              aria-hidden="true"
            />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-800">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-[#2A6877]">
                El psicólogo online que estabas buscando
              </span>
            </h1>
          </div>
          
          <h2 className="text-xl md:text-2xl font-semibold text-gray-700 relative pl-6 border-l-4 border-[#B4E4D3]">
            Empieza a sentirte mejor con la ayuda de tu psicólogo en 
            <span className="text-[#2A6877]"> Bienestar</span>
          </h2>
          
          <div className="space-y-4 relative">
            <div 
              className="absolute -left-4 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#2A6877]/0 via-[#2A6877]/20 to-[#2A6877]/0"
              aria-hidden="true"
            />
            <p className="text-gray-600 text-lg leading-relaxed pl-6">
              Bienestar es un <span className="font-medium text-[#2A6877]">servicio de psicología online</span> que encuentra
              el profesional más adecuado a tus necesidades entre una amplia variedad de
              psicólogos y psicólogas.
            </p>
            
            <p className="text-gray-600 text-lg leading-relaxed pl-6">
              Facilitamos el acceso a terapia psicológica de calidad en todo Chile.
            </p>
          </div>

          <motion.button 
            onClick={handleSpecialistsClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-12 bg-gradient-to-r from-[#2A6877] to-[#235A67] text-white px-8 py-4 rounded-lg hover:from-[#235A67] hover:to-[#2A6877] transition-all flex items-center gap-3 text-lg font-medium shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#2A6877] focus:ring-offset-2"
            aria-label="Agendar cita con psicólogo"
          >
            <span>Agenda con tu psicólogo</span>
            <ArrowRightIcon className="w-5 h-5" aria-hidden="true" />
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-2xl">
            <img
              src="/hero-therapy.svg"
              alt="Sesión de terapia psicológica online"
              className="w-full h-full object-cover"
              loading="eager"
              width="600"
              height="500"
            />
            <div 
              className="absolute inset-0 bg-gradient-to-tr from-[#2A6877]/20 to-transparent"
              aria-hidden="true"
            />
          </div>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-4 -right-4 bg-white p-4 rounded-lg shadow-lg"
            role="presentation"
          >
            <span className="text-[#2A6877] font-bold">100% Online</span>
          </motion.div>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-4 -left-4 bg-white p-4 rounded-lg shadow-lg"
            role="presentation"
          >
            <span className="text-[#2A6877] font-bold">Profesionales Certificados</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;