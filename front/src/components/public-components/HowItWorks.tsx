import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const HowItWorks = () => {
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

    const section = document.getElementById('how-it-works-section');
    if (section) observer.observe(section);

    return () => {
      if (section) observer.unobserve(section);
    };
  }, []);

  const steps = [
    {
      number: 1,
      title: "Busca un Psicólogo",
      description: "Explora nuestro directorio de psicólogos certificados y encuentra el profesional ideal para ti según tus necesidades específicas.",
      icon: (
        <svg className="w-8 h-8 md:w-10 md:h-10" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" />
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z" clipRule="evenodd" />
        </svg>
      ),
      color: "#2A6877",
      bgGradient: "from-[#B4E4D3]/10 to-[#B4E4D3]/30"
    },
    {
      number: 2,
      title: "Agenda tu sesión",
      description: "Elige el horario que mejor se adapte a tu rutina y agenda tu sesión de manera simple, rápida y sin complicaciones.",
      icon: (
        <svg className="w-8 h-8 md:w-10 md:h-10" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      ),
      color: "#2A6877",
      bgGradient: "from-[#B4E4D3]/20 to-[#B4E4D3]/40"
    },
    {
      number: 3,
      title: "Inicia tu terapia online",
      description: "Conéctate a tu sesión desde cualquier lugar a través de nuestra plataforma segura, confidencial y fácil de usar.",
      icon: (
        <svg className="w-8 h-8 md:w-10 md:h-10" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
        </svg>
      ),
      color: "#2A6877",
      bgGradient: "from-[#B4E4D3]/30 to-[#B4E4D3]/50"
    }
  ];

  // Animation variants - optimized for performance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 12,
        duration: 0.4
      }
    }
  };

  return (
    <section 
      id="how-it-works-section"
      className="bg-gradient-to-b from-white to-gray-50 py-16 sm:py-20 md:py-24 relative overflow-hidden"
      aria-labelledby="how-it-works-title"
    >
      {/* Modern gradient background with subtle patterns */}
      <div className="absolute inset-0 bg-white">
        <div className="absolute top-0 right-0 w-72 h-72 md:w-96 md:h-96 bg-[#B4E4D3] opacity-10 rounded-full transform translate-x-1/3 -translate-y-1/3 blur-md"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 md:w-64 md:h-64 bg-[#2A6877] opacity-5 rounded-full transform -translate-x-1/3 translate-y-1/3 blur-md"></div>
        <div className="absolute top-1/3 left-2/3 w-32 h-32 bg-[#B4E4D3] opacity-10 rounded-full blur-lg"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 md:mb-20"
        >
          <div className="inline-block p-3 bg-[#2A6877] bg-opacity-10 rounded-full mb-4 sm:mb-6">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#2A6877]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
          </div>
          
          <h2 
            id="how-it-works-title"
            className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4 sm:mb-6 tracking-tight"
          >
            ¿Cómo funciona <span className="text-[#2A6877]">E-mind</span>?
          </h2>
          
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            Comienza tu proceso terapéutico en tres simples pasos diseñados para
            brindarte la mejor experiencia de atención psicológica online.
          </p>
        </motion.div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 relative"
        >
          {/* Connecting Line with animated gradient - improved for accessibility */}
          <div className="hidden md:block absolute top-32 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 overflow-hidden" aria-hidden="true">
            <motion.div
              initial={{ x: "-100%" }}
              animate={isInView ? { x: "100%" } : { x: "-100%" }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.3 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-[#2A6877] to-transparent"
            />
          </div>
          
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              variants={itemVariants}
              whileHover={{ 
                y: -8, 
                boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                transition: { type: "spring", stiffness: 300 }
              }}
              className={`relative bg-white bg-gradient-to-br ${step.bgGradient} backdrop-blur-sm rounded-2xl p-6 sm:p-8 md:p-10 shadow-lg overflow-hidden border border-white/50`}
              aria-labelledby={`step-${step.number}-title`}
            >
              {/* Step number decorative background element */}
              <div className="absolute -top-10 -left-10 w-20 h-20 bg-white rounded-full flex items-center justify-center opacity-10 text-5xl font-bold" aria-hidden="true">
                {step.number}
              </div>
              
              <div className="relative">
                {/* Step number circle - improved visual styling */}
                <div className="absolute -top-14 md:-top-16 left-1/2 -translate-x-1/2">
                  <div className="bg-white w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-lg md:text-xl font-bold shadow-lg border-4 transition-transform duration-300" style={{ borderColor: step.color }}>
                    <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#2A6877] to-[#235A67]">{step.number}</span>
                  </div>
                </div>
                
                <div className="mt-8 text-center space-y-4 sm:space-y-5">
                  {/* Icon with glass effect background */}
                  <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 mx-auto rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md border border-white/50">
                    <div className="text-[#2A6877]">
                      {step.icon}
                    </div>
                  </div>
                  
                  <h3 
                    id={`step-${step.number}-title`}
                    className="text-xl sm:text-2xl font-bold text-gray-800"
                  >
                    {step.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    {step.description}
                  </p>
                  
                  {/* Decorative element - subtle animation on hover */}
                  <motion.div 
                    className="w-10 h-1 mx-auto rounded-full"
                    style={{ backgroundColor: step.color }}
                    whileHover={{ width: 40, transition: { duration: 0.3 } }}
                    aria-hidden="true"
                  ></motion.div>
                </div>
              </div>
              
              {/* Progress indicator for mobile only */}
              {index < steps.length - 1 && (
                <div className="md:hidden flex justify-center mt-8" aria-hidden="true">
                  <svg className="w-6 h-6 text-[#2A6877] opacity-50" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L10 14.586l5.293-5.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;