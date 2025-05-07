import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const PsychologistCTA = () => {
  const navigate = useNavigate();
  const [isInView, setIsInView] = useState(false);

  // Performance optimization - use IntersectionObserver instead of whileInView
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById('psychologist-cta-section');
    if (section) observer.observe(section);

    return () => {
      if (section) observer.unobserve(section);
    };
  }, []);

  const handleRegisterClick = () => {
    navigate('/registro', { state: { userType: 'psychologist' } });
  };

  // Animation variants - simplified for better performance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  // SEO-friendly benefits with proper accessibility
  const benefits = [
    {
      text: "Conecte con pacientes que buscan ayuda profesional y están listos para comenzar su proceso terapéutico."
    },
    {
      text: "Sistema de agenda automatizado 24/7. Sus pacientes pueden agendar cuando lo necesiten."
    },
    {
      text: "Plataforma segura y profesional."
    },
  ];

  return (
    <section 
      id="psychologist-cta-section"
      className="relative py-16 sm:py-20 md:py-24 overflow-hidden bg-gradient-to-b from-[#E6F7F2] to-[#C5EAD9]"
      aria-labelledby="psychologist-section-title"
    >
      {/* Modern gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#B4E4D3] to-[#9CD3BE] opacity-80" />
      
      {/* Modern decorative shapes */}
      <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-[#2A6877]/10 rounded-full blur-md transform translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 md:w-64 md:h-64 bg-white/20 rounded-full blur-md transform -translate-x-1/3 translate-y-1/3"></div>
      <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-[#2A6877]/10 rounded-full blur-sm"></div>
      
      <div className="container mx-auto px-6 relative z-10 max-w-6xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16">
          {/* Left side - Image with modern styling */}
          <div className="lg:w-1/2 w-full max-w-lg mx-auto lg:max-w-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm p-1.5 shadow-2xl"
            >
              {/* Glass morphism card effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-white/10 rounded-2xl"></div>
              
              {/* Modern image container with subtle border */}
              <div className="relative rounded-xl overflow-hidden border border-white/20">
                <img 
                  src="https://placehold.co/600x400/2A6877/ffffff?text=Dashboard+Preview"
                  alt="Vista previa del dashboard para psicólogos" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                  width="600"
                  height="400"
                />
                <div 
                  className="absolute inset-0 bg-gradient-to-t from-[#2A6877]/50 to-transparent" 
                  aria-hidden="true"
                />
              </div>
              
              {/* Feature badges - modernized with glass effect */}
              <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg z-20 flex items-center">
                <svg className="w-4 h-4 text-[#2A6877] mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-semibold text-[#2A6877]">100% Seguro</span>
              </div>
              
              <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg z-20 flex items-center">
                <svg className="w-4 h-4 text-[#2A6877] mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-xs font-semibold text-[#2A6877]">Pacientes verificados</span>
              </div>
            </motion.div>
          </div>

          {/* Right side - Content with improved typography and spacing */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="lg:w-1/2 text-center lg:text-left mt-10 lg:mt-0"
          >
            <motion.span 
              variants={itemVariants}
              className="inline-block px-4 py-2 bg-white/30 backdrop-blur-sm rounded-full text-[#2A6877] text-sm font-medium mb-4 shadow-sm"
            >
              Para Psicólogos y Terapeutas
            </motion.span>
            
            <motion.h2 
              id="psychologist-section-title"
              variants={itemVariants}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-gray-800 tracking-tight"
            >
              Ofrezca sus servicios profesionales <span className="text-[#2A6877]">online</span>
            </motion.h2>
            
            <motion.p 
              variants={itemVariants}
              className="text-gray-700 text-base sm:text-lg mb-6 sm:mb-8 max-w-xl"
            >
              Nuestra plataforma le ofrece todas las herramientas necesarias para digitalizar su consulta y 
              llegar a más pacientes sin complicaciones técnicas ni gastos adicionales.
            </motion.p>

            <motion.ul 
              variants={containerVariants}
              className="space-y-3 sm:space-y-5 mb-8 sm:mb-10"
              aria-label="Beneficios para psicólogos"
            >
              {benefits.map((benefit, index) => (
                <motion.li 
                  key={index}
                  variants={itemVariants}
                  className="flex items-center gap-3"
                >
                  <span className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 bg-[#2A6877] rounded-full flex items-center justify-center text-white shadow-md" aria-hidden="true">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <p className="text-gray-700 text-sm sm:text-base text-left">{benefit.text}</p>
                </motion.li>
              ))}
            </motion.ul>

            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5"
            >
              <motion.button 
                onClick={handleRegisterClick}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="relative bg-[#2A6877] hover:bg-[#235A67] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium transition-all shadow-lg w-full sm:w-auto text-center overflow-hidden group"
                aria-label="Comenzar registro gratuito"
              >
                {/* Modern button hover effect */}
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700" aria-hidden="true"></span>
                <span className="relative">Comienza ahora gratis</span>
              </motion.button>
              
              <a 
                href="#como-funciona" 
                className="text-[#2A6877] font-medium flex items-center gap-2 group hover:underline w-full sm:w-auto text-center sm:text-left transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#2A6877] focus:ring-offset-2 rounded-lg px-2 py-1"
                aria-label="Ver más información sobre cómo funciona la plataforma"
              >
                <span>Ver cómo funciona</span>
                <svg className="w-4 h-4 transform transition-transform duration-200 group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </motion.div>
            
            {/* Trust indicators with improved accessibility */}
            <motion.div 
              variants={itemVariants}
              className="mt-6 sm:mt-8 flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-gray-600"
            >
              <div className="flex items-center gap-2 bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <svg className="w-4 h-4 text-[#2A6877]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Datos protegidos</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PsychologistCTA;