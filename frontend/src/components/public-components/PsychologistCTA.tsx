import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const PsychologistCTA = () => {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate('/registro', { state: { userType: 'psychologist' } });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 }
    }
  };

  const benefits = [
    {
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ),
      text: "Conecte con pacientes que buscan ayuda profesional y están listos para comenzar su proceso terapéutico."
    },
    {
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ),
      text: "Sistema de agenda automatizado 24/7. Sus pacientes pueden agendar cuando lo necesiten."
    },
    {
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ),
      text: "Plataforma segura y profesional."
    },

  ];

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Gradient background with subtle pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#B4E4D3] to-[#9CD3BE]">
        <div className="absolute inset-0 opacity-10" 
             style={{ 
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%232A6877' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
               backgroundSize: '150px 150px'
             }}
        ></div>
      </div>

      {/* Decorative shapes */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#2A6877] opacity-10 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full transform -translate-x-1/2 translate-y-1/2"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row items-center justify-between gap-16"
        >
          {/* Left side - Image */}
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 20, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0)" }}
              whileInView={{ 
                opacity: 1, 
                y: 0, 
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)" 
              }}
              whileHover={{ 
                y: -10,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
              }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative rounded-2xl overflow-hidden"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#2A6877] rounded-bl-3xl z-10"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-[#2A6877] rounded-tr-3xl z-10"></div>
              
              <div className="relative z-0 p-3 bg-white rounded-2xl">
                <img 
                  src="https://placehold.co/600x400/2A6877/ffffff?text=Dashboard+Preview"
                  alt="Vista previa del dashboard para psicólogos" 
                  className="w-full h-full object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2A6877]/30 to-transparent rounded-xl" />
              </div>
              
              {/* Feature badges */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute top-5 left-5 bg-white px-3 py-1.5 rounded-full shadow-lg z-20 flex items-center"
              >
                <svg className="w-4 h-4 text-[#2A6877] mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-semibold text-[#2A6877]">100% Seguro</span>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
                className="absolute bottom-5 right-5 bg-white px-3 py-1.5 rounded-full shadow-lg z-20 flex items-center"
              >
                <svg className="w-4 h-4 text-[#2A6877] mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                <span className="text-xs font-semibold text-[#2A6877]">Pacientes verificados</span>
              </motion.div>
            </motion.div>
          </div>

          {/* Right side - Content */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="lg:w-1/2 text-center lg:text-left"
          >
            <motion.span 
              variants={itemVariants}
              className="inline-block px-4 py-2 bg-white/40 backdrop-blur-sm rounded-full text-[#2A6877] text-sm font-medium mb-4 shadow-sm"
            >
              Para Psicólogos y Terapeutas
            </motion.span>
            
            <motion.h2 
              variants={itemVariants}
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-800"
            >
              Expanda su práctica profesional <span className="text-[#2A6877]">online</span>
            </motion.h2>
            
            <motion.p 
              variants={itemVariants}
              className="text-gray-700 text-lg mb-8 max-w-xl"
            >
              Nuestra plataforma le ofrece todas las herramientas necesarias para digitalizar su consulta y 
              llegar a más pacientes sin complicaciones técnicas ni gastos adicionales.
            </motion.p>

            <motion.ul 
              variants={containerVariants}
              className="space-y-5 mb-10"
            >
              {benefits.map((benefit, index) => (
                <motion.li 
                  key={index}
                  variants={itemVariants}
                  className="flex items-start gap-4"
                >
                  <span className="flex-shrink-0 w-7 h-7 bg-[#2A6877] rounded-full flex items-center justify-center text-white mt-0.5 shadow-md">
                    {benefit.icon}
                  </span>
                  <span className="text-gray-700">{benefit.text}</span>
                </motion.li>
              ))}
            </motion.ul>

            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center gap-5"
            >
              <motion.button 
                onClick={handleRegisterClick}
                whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2)" }}
                whileTap={{ scale: 0.98 }}
                className="bg-[#2A6877] text-white px-8 py-4 rounded-lg font-medium hover:bg-[#235A67] transition-all shadow-lg w-full sm:w-auto text-center"
              >
                Comienza ahora gratis
              </motion.button>
              
              <a href="#como-funciona" className="text-[#2A6877] font-medium flex items-center gap-2 group hover:underline w-full sm:w-auto text-center sm:text-left">
                <span>Ver cómo funciona</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </motion.div>
            
            {/* Trust indicators */}
            <motion.div 
              variants={itemVariants}
              className="mt-8 flex flex-wrap justify-center lg:justify-start gap-6 text-xs text-gray-600"
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#2A6877]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Datos protegidos</span>
              </div>

            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default PsychologistCTA;