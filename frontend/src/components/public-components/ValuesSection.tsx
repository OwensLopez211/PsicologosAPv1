import { motion } from 'framer-motion';

const ValuesSection = () => {
  const values = [
    {
      title: "Empatía",
      description: "Capacidad de comprender las emociones y sentimientos de los demás, estableciendo conexiones auténticas y significativas.",
      icon: (
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 3.22l-.61-.6a5.5 5.5 0 00-7.78 7.77L10 18.78l8.39-8.4a5.5 5.5 0 00-7.78-7.77l-.61.61z"/>
        </svg>
      ),
      color: "#FF6B6B",
      bgGradient: "from-red-50 to-red-100"
    },
    {
      title: "Valentía",
      description: "Afrontar los desafíos con coraje y determinación, transformando obstáculos en oportunidades de crecimiento.",
      icon: (
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
      ),
      color: "#4ECDC4",
      bgGradient: "from-teal-50 to-teal-100"
    },
    {
      title: "Superación",
      description: "Compromiso con el crecimiento y desarrollo continuo, perseverando ante las dificultades con resiliencia y adaptabilidad.",
      icon: (
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
        </svg>
      ),
      color: "#FFD166",
      bgGradient: "from-yellow-50 to-yellow-100"
    }
  ];

  // Variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 }
    }
  };

  return (
    <section className="py-24 bg-gradient-to-b from-white to-[#f8fdfb] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#4ECDC4] opacity-5 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FF6B6B] opacity-5 rounded-full transform -translate-x-1/2 translate-y-1/2"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center mb-20"
        >
          <div className="inline-block p-4 bg-[#0066FF] bg-opacity-10 rounded-full mb-6 shadow-inner">
            <svg className="w-10 h-10 text-[#0066FF]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
              <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-gray-800 mb-6">Lo Que Nos Define</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Nuestros valores básicos son <span className="text-[#FF6B6B] font-medium">empatía</span>, <span className="text-[#4ECDC4] font-medium">valentía</span> y <span className="text-[#FFD166] font-medium">superación personal</span>. 
            Estos principios guían cada aspecto de nuestro trabajo y relaciones, definiendo quiénes somos y cómo servimos a nuestra comunidad.
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {values.map((value, index) => (
            <motion.div 
              key={index}
              variants={itemVariants}
              whileHover={{ 
                y: -15, 
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                transition: { type: "spring", stiffness: 300 }
              }}
              className={`bg-gradient-to-br ${value.bgGradient} rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300`}
            >
              <div className="h-3" style={{ backgroundColor: value.color }}></div>
              <div className="p-8">
                <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center mb-6 mx-auto" 
                     style={{ boxShadow: `0 0 0 8px ${value.color}30` }}>
                  <div style={{ color: value.color }}>
                    {value.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">{value.title}</h3>
                <p className="text-gray-600 text-center leading-relaxed">{value.description}</p>
                
                {/* Decorative element */}
                <div className="w-10 h-1 mx-auto mt-6 rounded-full" style={{ backgroundColor: value.color }}></div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Quote section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto mt-16 text-center"
        >
          <blockquote className="text-lg italic text-gray-600">
            "Nuestros valores no son solo palabras; son los pilares que sostienen cada decisión que tomamos y cada servicio que ofrecemos."
          </blockquote>
        </motion.div>
      </div>
    </section>
  );
};

export default ValuesSection;