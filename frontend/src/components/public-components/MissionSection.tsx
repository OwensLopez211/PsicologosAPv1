import { motion } from 'framer-motion';

const MissionSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-[#f8fdfb]">
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 rounded-full bg-[#FF0000] bg-opacity-10 flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-[#FF0000]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Nuestro Propósito</h2>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 border-l-4 border-[#FF0000]">
            <p className="text-lg text-gray-700 leading-relaxed">
              Bienestar surge como una iniciativa integral para democratizar el acceso a la salud mental, 
              desestigmatizar la atención psicológica en nuestra sociedad, y contribuir al desarrollo 
              profesional de terapeutas emergentes en el campo de la psicología.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-[#B4E4D3] rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-[#2A6877]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Accesibilidad</h3>
              </div>
              <p className="text-gray-600 pl-13">Promovemos el acceso universal a servicios psicológicos de calidad, eliminando barreras económicas y sociales que limitan la atención en salud mental.</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-[#B4E4D3] rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-[#2A6877]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Desarrollo Profesional</h3>
              </div>
              <p className="text-gray-600 pl-13">Fomentamos el crecimiento de profesionales en psicología, proporcionando un entorno estructurado para adquirir experiencia clínica y perfeccionar sus competencias terapéuticas.</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MissionSection;