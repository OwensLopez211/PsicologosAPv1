import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// Preload the hero image
const preloadHeroImage = () => {
  const img = new Image();
  img.src = "/Psychologist-bro.svg";
};

// Feature items con animación similar al Hero principal
const featureItems = [
  { text: "Sesiones flexibles", icon: "💻", delay: 0.3 },
  { text: "Psicólogos certificados", icon: "🔒", delay: 0.4 },
  { text: "Precios accesibles", icon: "💸", delay: 0.5 }
];

const MobileHero = () => {
  const navigate = useNavigate();
  const heroImgRef = useRef<HTMLImageElement | null>(null);
  const [, setIsLoaded] = useState(false);

  // Preload the hero image on component mount
  useEffect(() => {
    preloadHeroImage();
    
    // Mark image as loaded once it's visible in DOM
    if (heroImgRef.current && heroImgRef.current.complete) {
      setIsLoaded(true);
    }
  }, []);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const handleButtonClick = () => {
    navigate('/especialistas');
  };

  // Animation variants similar to Hero
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <section 
      className="relative px-4 pt-16 pb-8 overflow-hidden bg-white"
      aria-labelledby="hero-heading"
    >
      {/* Decorative backgrounds - más similares al Hero */}
      <div 
        className="absolute top-0 right-0 w-48 h-48 bg-[#B4E4D3] opacity-10 rounded-full -z-10 transform translate-x-1/3 -translate-y-1/4"
        aria-hidden="true"
      />
      <div 
        className="absolute bottom-0 left-0 w-56 h-56 bg-[#2A6877] opacity-5 rounded-full -z-10 transform -translate-x-1/3 translate-y-1/4"
        aria-hidden="true"
      />
      
      {/* Main hero image - optimized for LCP con sombra y estilo similar al Hero */}
      <div className="relative w-full h-[250px] xs:h-[280px] sm:h-[320px] rounded-2xl overflow-hidden z-10 shadow-xl mb-6">
        <div className="absolute top-4 right-4 w-full h-full rounded-2xl bg-[#B4E4D3]/30 -z-10 transform rotate-3"></div>
        <img
          ref={heroImgRef}
          src="/Psychologist-bro.svg"
          alt="Sesión de terapia psicológica online"
          className="w-full h-full object-cover"
          width="600"
          height="300"
          fetchPriority="high"
          onLoad={handleImageLoad}
          style={{
            aspectRatio: '2/1',
            backgroundColor: '#f8f9fa'
          }}
        />
        
        {/* Gradient overlay similar al Hero */}
        <div 
          className="absolute inset-0 bg-gradient-to-tr from-[#2A6877]/30 to-transparent"
          aria-hidden="true"
        />

        {/* Floating elements similar al Hero */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-4 right-4 bg-white p-2.5 rounded-lg shadow-lg border-l-3 border-[#2A6877]"
          role="presentation"
        >
          <div className="flex items-center">
            <svg className="w-4 h-4 text-[#2A6877] mr-1.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            <span className="text-[#2A6877] font-bold text-xs">100% Online</span>
          </div>
        </motion.div>
      </div>

      {/* Text content con animaciones como en Hero */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="text-center space-y-5 px-4 z-20 relative"
      >
        <div className="relative">
          <div
            className="absolute -top-2 left-1/2 h-1 bg-gradient-to-r from-[#2A6877] to-[#B4E4D3] rounded-full"
            style={{ width: '40%', transform: 'translateX(-50%)' }}
            aria-hidden="true"
          />
          <h1 
            id="hero-heading"
            className="text-2xl xs:text-3xl font-bold leading-tight text-gray-800"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-[#2A6877]">
              El psicoterapeuta online que estabas buscando
            </span>
          </h1>
        </div>

        <motion.p 
          variants={fadeInUp}
          className="text-gray-600 text-base xs:text-lg mx-auto leading-tight"
        >
          Empieza a sentirte mejor con la ayuda de tu psicoterapeuta en
          <span className="text-[#2A6877] font-medium"> E-mind</span>
        </motion.p>

        {/* Feature pills con animaciones como en Hero */}
        <motion.div 
          variants={fadeInUp} 
          className="flex flex-wrap justify-center gap-2 py-2"
        >
          {featureItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: item.delay }}
              className="bg-[#2A6877]/10 px-3 py-1.5 rounded-full flex items-center text-xs xs:text-sm font-medium text-[#2A6877]"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#2A6877] mr-2"></div>
              {item.text}
            </motion.div>
          ))}
        </motion.div>

        {/* Optimized CTA Button con animación como en Hero */}
        <motion.button 
          onClick={handleButtonClick}
          className="w-full bg-gradient-to-r from-[#2A6877] to-[#235A67] text-white py-3 px-6 rounded-lg font-medium shadow-md flex items-center justify-center gap-2 text-base xs:text-lg mt-2 transition-all"
          whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -5px rgba(42, 104, 119, 0.4)" }}
          whileTap={{ scale: 0.97 }}
          aria-label="Agenda con tu psicólogo"
        >
          <span>Agenda con tu psicólogo</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="w-5 h-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M14 5l7 7m0 0l-7 7m7-7H3" 
            />
          </svg>
        </motion.button>
      </motion.div>
    </section>
  );
};

export default MobileHero;