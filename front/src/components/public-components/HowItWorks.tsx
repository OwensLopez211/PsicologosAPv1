import { motion } from 'framer-motion';

const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: "Busca un Psicólogo",
      description: "Explora nuestro directorio de psicólogos certificados y encuentra el profesional ideal para ti según tus necesidades específicas.",
      icon: (
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
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
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
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
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
        </svg>
      ),
      color: "#2A6877",
      bgGradient: "from-[#B4E4D3]/30 to-[#B4E4D3]/50"
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-24 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#B4E4D3] opacity-10 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#2A6877] opacity-5 rounded-full transform -translate-x-1/2 translate-y-1/2"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <div className="inline-block p-3 bg-[#2A6877] bg-opacity-10 rounded-full mb-6">
            <svg className="w-8 h-8 text-[#2A6877]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            ¿Cómo funciona <span className="text-[#2A6877]">Bienestar</span>?
          </h2>
          
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Comienza tu proceso terapéutico en tres simples pasos diseñados para
            brindarte la mejor experiencia de atención psicológica online.
          </p>
        </motion.div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative"
        >
          {/* Connecting Line with animated gradient */}
          <div className="hidden md:block absolute top-32 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 overflow-hidden">
            <motion.div
              initial={{ x: "-100%" }}
              whileInView={{ x: "100%" }}
              transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
              viewport={{ once: true }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-[#2A6877] to-transparent"
            />
          </div>
          
          {steps.map((step) => (
            <motion.div
              key={step.number}
              variants={itemVariants}
              whileHover={{ 
                y: -10, 
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                transition: { type: "spring", stiffness: 300 }
              }}
              className={`relative bg-gradient-to-br ${step.bgGradient} rounded-2xl p-10 shadow-lg overflow-hidden`}
            >
              {/* Step number */}
              <div className="absolute -top-10 -left-10 w-20 h-20 bg-white rounded-full flex items-center justify-center opacity-10 text-5xl font-bold">
                {step.number}
              </div>
              
              <div className="relative">
                {/* Visible step number with gradient background */}
                <div className="absolute -top-16 left-1/2 -translate-x-1/2">
                  <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold shadow-lg border-4" style={{ borderColor: step.color }}>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2A6877] to-[#235A67]">{step.number}</span>
                  </div>
                </div>
                
                <div className="mt-8 text-center space-y-5">
                  {/* Icon with colored background */}
                  <div className="w-20 h-20 mx-auto rounded-full bg-white flex items-center justify-center shadow-md">
                    <div className="text-[#2A6877]">
                      {step.icon}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-800">
                    {step.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                  
                  {/* Decorative element */}
                  <div className="w-10 h-1 mx-auto rounded-full" style={{ backgroundColor: step.color }}></div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;