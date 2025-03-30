import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const PsychologistCTA = () => {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate('/registro', { state: { userType: 'psychologist' } });
  };

  return (
    <section className="bg-gradient-to-br from-[#B4E4D3] to-[#9CD3BE] py-20">
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-center justify-between gap-12"
        >
          {/* Left side - Image */}
          <div className="md:w-1/2">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative rounded-2xl overflow-hidden shadow-2xl"
            >
              <img 
                src="https://placehold.co/600x400/2A6877/ffffff?text=Dashboard+Preview"
                alt="Vista previa del dashboard para psicólogos" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2A6877]/20 to-transparent" />
            </motion.div>
          </div>

          {/* Right side - Content */}
          <div className="md:w-1/2 text-center md:text-left">
            <span className="inline-block px-4 py-2 bg-white/30 backdrop-blur-sm rounded-full text-[#2A6877] text-sm font-medium mb-4">
              Para Psicólogos
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-gray-800">
              Expanda su práctica profesional online
            </h2>

            <ul className="space-y-6 mb-8">
              <motion.li 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex items-start gap-3"
              >
                <span className="flex-shrink-0 w-6 h-6 bg-[#2A6877] rounded-full flex items-center justify-center text-white">✓</span>
                <span className="text-gray-700">Conecte con pacientes que buscan ayuda profesional y están listos para comenzar su proceso terapéutico.</span>
              </motion.li>
              <motion.li 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex items-start gap-3"
              >
                <span className="flex-shrink-0 w-6 h-6 bg-[#2A6877] rounded-full flex items-center justify-center text-white">✓</span>
                <span className="text-gray-700">Sistema de agenda automatizado 24/7. Sus pacientes pueden agendar cuando lo necesiten.</span>
              </motion.li>
              <motion.li 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="flex items-start gap-3"
              >
                <span className="flex-shrink-0 w-6 h-6 bg-[#2A6877] rounded-full flex items-center justify-center text-white">✓</span>
                <span className="text-gray-700">Plataforma segura y profesional para realizar sus sesiones online.</span>
              </motion.li>
            </ul>

            <motion.button 
              onClick={handleRegisterClick}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-[#2A6877] text-white px-8 py-4 rounded-lg font-medium hover:bg-[#235A67] transition-all shadow-lg"
            >
              Comienza ahora
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PsychologistCTA;