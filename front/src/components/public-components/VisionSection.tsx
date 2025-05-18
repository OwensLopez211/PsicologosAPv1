import { motion } from 'framer-motion';

const VisionSection = () => {
  // Animation variants
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
    <section className="py-16 bg-gradient-to-b from-[#f8fdfb] to-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-1/3 left-0 w-72 h-72 bg-[#2A6877] opacity-5 rounded-full transform -translate-x-1/2"></div>
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[#B4E4D3] opacity-10 rounded-full transform translate-x-1/2"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          {/* Header with animated underline */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end mb-12 relative">
            <h2 className="text-3xl font-bold text-[#2A6877] relative">
              Hacia Dónde Vamos
              <motion.div 
                className="hidden sm:block absolute -right-4 bottom-0 h-1 bg-[#2A6877]" 
                initial={{ width: 0 }}
                whileInView={{ width: '30%' }}
                transition={{ duration: 0.8, delay: 0.5 }}
                viewport={{ once: true }}
              ></motion.div>
            </h2>
            <div className="w-14 h-14 rounded-full bg-[#2A6877] bg-opacity-10 flex items-center justify-center mt-4 sm:mt-0 sm:ml-5 shadow-inner">
              <svg className="w-7 h-7 text-[#2A6877]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          {/* Main Vision Statement */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden mb-16 relative"
          >
            {/* Border accent */}
            <div className="absolute top-0 right-0 bottom-0 w-4 bg-gradient-to-b from-[#2A6877] to-[#B4E4D3]"></div>
            
            {/* Content with decorative elements */}
            <div className="p-8 sm:p-10 relative">
              <div className="absolute right-8 top-8 opacity-5">
                <svg className="w-32 h-32 text-[#2A6877]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              </div>
              
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-[#0066FF]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-[#0066FF]">Nuestra Visión</h3>
              </div>
              
              <p className="text-lg text-gray-700 leading-relaxed ml-14">
                Nuestro objetivo es motivar a las generaciones de adultos jóvenes a 
                <span className="text-[#0066FF] font-medium"> construir un futuro mejor</span> para ellos, 
                acorde a sus motivaciones, gustos y expectativas explotando al máximo sus 
                capacidades y aprendiendo herramientas que les ayuden a sobrellevar situaciones 
                estresantes de la vida.
              </p>
            </div>
          </motion.div>
          
          {/* Feature Cards */}
          <motion.div 
            className="grid md:grid-cols-2 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div 
              variants={itemVariants}
              whileHover={{ 
                y: -10, 
                boxShadow: "0 25px 30px -12px rgba(0, 0, 0, 0.15)",
                transition: { type: "spring", stiffness: 300 }
              }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-b-4 border-teal-400 relative overflow-hidden"
            >
              {/* Decorative diagonal line */}
              <div className="absolute -top-10 -right-10 w-20 h-20 bg-teal-50 rotate-45 transform"></div>
              
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-[#B4E4D3] to-teal-400 rounded-full flex items-center justify-center mr-4 shadow-md">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Motivación</h3>
              </div>
              
              <p className="text-gray-600 ml-18 leading-relaxed">
                Inspiramos a los jóvenes adultos a alcanzar su máximo potencial y descubrir sus verdaderas 
                capacidades, proporcionando un entorno de apoyo donde puedan explorar sus fortalezas.
              </p>
              
              {/* Feature highlights */}
              <div className="mt-6 ml-18">
                <div className="flex items-center text-sm text-teal-600 mb-2">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Autodescubrimiento guiado
                </div>
                <div className="flex items-center text-sm text-teal-600">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Objetivos personalizados
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              whileHover={{ 
                y: -10, 
                boxShadow: "0 25px 30px -12px rgba(0, 0, 0, 0.15)",
                transition: { type: "spring", stiffness: 300 }
              }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-b-4 border-blue-400 relative overflow-hidden"
            >
              {/* Decorative diagonal line */}
              <div className="absolute -top-10 -right-10 w-20 h-20 bg-blue-50 rotate-45 transform"></div>
              
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-[#B4E4D3] to-blue-400 rounded-full flex items-center justify-center mr-4 shadow-md">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Herramientas</h3>
              </div>
              
              <p className="text-gray-600 ml-18 leading-relaxed">
                Proporcionamos recursos efectivos para manejar situaciones estresantes y construir resiliencia emocional, 
                equipando a nuestros usuarios con estrategias prácticas para la vida diaria.
              </p>
              
              {/* Feature highlights */}
              <div className="mt-6 ml-18">
                <div className="flex items-center text-sm text-blue-600 mb-2">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Técnicas de autoregulación
                </div>
                <div className="flex items-center text-sm text-blue-600">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Recursos de afrontamiento
                </div>
              </div>
            </motion.div>
            
            {/* Call to action */}
            <motion.div
              className="bg-gradient-to-r from-[#0066FF] to-blue-500 p-8 rounded-2xl shadow-lg text-white md:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">¿Listo para construir tu futuro?</h3>
                  <p className="text-blue-100">Descubre cómo podemos ayudarte a alcanzar tu máximo potencial.</p>
                </div>
                <button className="mt-4 md:mt-0 px-6 py-3 bg-white text-[#0066FF] rounded-lg font-medium hover:bg-blue-50 transition-colors shadow-md">
                  Comenzar ahora
                </button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default VisionSection;