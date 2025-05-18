import { motion } from 'framer-motion';

const MissionSection = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-[#f8fdfb]">
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center mb-8 gap-4">
            <div className="w-14 h-14 rounded-full bg-[#2A6877]/10 flex items-center justify-center">
              <svg className="w-7 h-7 text-[#2A6877]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-[#2A6877]">Nuestro Propósito</h2>
          </div>
          
          {/* Main Description Box */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-12 border-l-4 border-[#2A6877] relative overflow-hidden"
          >
            {/* Decorative Element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#B4E4D3] bg-opacity-20 rounded-bl-full"></div>
            
            <p className="text-lg text-gray-700 leading-relaxed relative z-10">
               E-mind surge como una iniciativa para beneficiar el acceso a la salud mental, desestigmatizar la atención psicológica en nuestra sociedad, y contribuir al desarrollo profesional de terapeutas emergentes en el campo de la psicología.
            </p>
          </motion.div>
          
          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#B4E4D3] rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-[#2A6877]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[#2A6877]">Accesibilidad</h3>
              </div>
              <p className="text-gray-600 ml-16">
                Promovemos el acceso universal a servicios psicológicos de calidad, 
                eliminando barreras económicas y sociales que limitan la atención en salud mental.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#B4E4D3] rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-[#2A6877]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[#2A6877]">Desarrollo Profesional</h3>
              </div>
              <p className="text-gray-600 ml-16">
                Fomentamos el crecimiento de profesionales en psicología, proporcionando un entorno 
                estructurado para adquirir experiencia clínica y perfeccionar sus competencias terapéuticas.
              </p>
            </motion.div>
            
            {/* Additional Feature Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 md:col-span-2"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#B4E4D3] rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-[#2A6877]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L15 10.274z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[#2A6877]">Desestigmatización</h3>
              </div>
              <p className="text-gray-600 ml-16">
                Trabajamos activamente para cambiar la percepción social sobre la salud mental, 
                normalizando la atención psicológica y educando a la comunidad sobre su importancia.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MissionSection;