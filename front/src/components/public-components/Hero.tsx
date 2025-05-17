import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

const Hero = () => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);

  // Precarga la imagen del héroe
  useEffect(() => {
    const img = new Image();
    img.src = '/Psychologist-bro.svg';
    img.onload = () => setImageLoaded(true);
  }, []);

  const handleSpecialistsClick = () => {
    navigate('/especialistas');
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const featureItems = [
    { text: "Sesiones flexibles", delay: 0.3 },
    { text: "Psicólogos certificados", delay: 0.4 },
    { text: "Precios accesibles", delay: 0.5 }
  ];

  return (
    <section 
      className="container mx-auto px-6 py-16 md:py-24 relative overflow-hidden"
      aria-label="Sección principal"
    >
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#B4E4D3] opacity-10 rounded-full transform translate-x-1/2 -translate-y-1/4"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#2A6877] opacity-5 rounded-full transform -translate-x-1/3 translate-y-1/4"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
        {/* Contenido principal - Imagen del héroe optimizada para LCP */}
        <div className="relative order-1 md:order-2">
          <div className="absolute top-8 right-8 w-full h-full rounded-2xl bg-[#B4E4D3]/30 -z-10 transform rotate-3"></div>
          <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-2xl">
            {/* Imagen optimizada con formato WebP como alternativa cuando esté disponible */}
            <picture>
              <source srcSet="/Psychologist-bro.webp" type="image/webp" />
              <img
                src="/Psychologist-bro.svg"
                alt="Sesión de terapia psicológica online"
                className="w-full h-full object-cover"
                loading="eager"
                fetchPriority="high"
                width="600"
                height="500"
                decoding="async"
                style={{ 
                  contentVisibility: 'auto',
                  containIntrinsicSize: '600px 500px',
                }}
              />
            </picture>
            <div 
              className="absolute inset-0 bg-gradient-to-tr from-[#2A6877]/30 to-transparent"
              aria-hidden="true"
            />
          </div>
          
          {/* Floating elements - lazy loaded ya que no son parte del LCP */}
          {imageLoaded && (
            <>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 bg-white p-4 rounded-lg shadow-lg border-l-4 border-[#2A6877]"
                role="presentation"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-[#2A6877] mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#2A6877] font-bold">100% Online</span>
                </div>
              </motion.div>
              
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg border-l-4 border-[#2A6877]"
                role="presentation"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-[#2A6877] mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#2A6877] font-bold">Profesionales Certificados</span>
                </div>
              </motion.div>
              
              {/* Trust badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                className="absolute top-1/2 left-0 transform -translate-x-1/3 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hidden lg:block"
              >
                <div className="w-16 h-16 rounded-full bg-[#B4E4D3]/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#2A6877]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
                  </svg>
                </div>
              </motion.div>
            </>
          )}
        </div>

        {/* Texto Hero */}
        <div className="text-left space-y-8 order-2 md:order-1">
          <div className="relative">
            <div
              className="absolute -top-2 left-0 h-1 bg-gradient-to-r from-[#2A6877] to-[#B4E4D3]"
              style={{ width: '40%' }}
              aria-hidden="true"
            />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-800">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-[#2A6877]">
                El psicoterapeuta online que estabas buscando
              </span>
            </h1>
          </div>
          {/* El resto de los elementos sí pueden tener animación */}
          <motion.h2 
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="text-xl md:text-2xl font-semibold text-gray-700 relative pl-6 border-l-4 border-[#B4E4D3]"
          >
            Empieza a sentirte mejor con la ayuda de tu psicoterapeuta en 
            <span className="text-[#2A6877]"> E-mind</span>
          </motion.h2>
          <motion.div 
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="space-y-4 relative"
          >
            <div 
              className="absolute -left-4 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#2A6877]/0 via-[#2A6877]/20 to-[#2A6877]/0"
              aria-hidden="true"
            />
            <p className="text-gray-600 text-lg leading-relaxed pl-6">
              E-mind es un <span className="font-medium text-[#2A6877]">servicio de psicoterapia online</span> que encuentra
              el profesional más adecuado a tus necesidades entre una amplia variedad de
              psicólogos y psicólogas.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed pl-6">
              Facilitamos el acceso a terapia psicológica de calidad en todo Chile.
            </p>
          </motion.div>
          {/* Feature Pills */}
          <motion.div 
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap gap-3 pl-6"
          >
            {featureItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: item.delay }}
                className="bg-[#2A6877]/10 px-4 py-2 rounded-full flex items-center"
              >
                <div className="w-2 h-2 rounded-full bg-[#2A6877] mr-2"></div>
                <span className="text-sm font-medium text-[#2A6877]">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
          <motion.button 
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            onClick={handleSpecialistsClick}
            whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(42, 104, 119, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            className="mt-8 bg-gradient-to-r from-[#2A6877] to-[#235A67] text-white px-8 py-4 rounded-lg hover:from-[#235A67] hover:to-[#2A6877] transition-all flex items-center gap-3 text-lg font-medium shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#2A6877] focus:ring-offset-2"
            aria-label="Agendar cita con psicólogo"
          >
            <span>Agenda con tu psicólogo</span>
            <ArrowRightIcon className="w-5 h-5" aria-hidden="true" />
          </motion.button>
        </div>
      </div>

      {/* Curved divider at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute bottom-0 w-full h-24 text-white fill-current transform -translate-y-3">
          <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default Hero;