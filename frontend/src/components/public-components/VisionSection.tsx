import { motion } from 'framer-motion';

const VisionSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-[#f8fdfb] to-white">
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-end mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Hacia Dónde Vamos</h2>
            <div className="w-12 h-12 rounded-full bg-[#0066FF] bg-opacity-10 flex items-center justify-center ml-4">
              <svg className="w-6 h-6 text-[#0066FF]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 border-r-4 border-[#0066FF]">
            <p className="text-lg text-gray-700 leading-relaxed">
              Nuestro objetivo es motivar a las generaciones de adultos jóvenes a construir un futuro mejor 
              para ellos, acorde a sus motivaciones, gustos y expectativas explotando al máximo sus 
              capacidades y aprendiendo herramientas que les ayuden a sobrellevar situaciones 
              estresantes de la vida.
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
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Motivación</h3>
              </div>
              <p className="text-gray-600 pl-13">Inspiramos a los jóvenes adultos a alcanzar su máximo potencial y descubrir sus verdaderas capacidades.</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-[#B4E4D3] rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-[#2A6877]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Herramientas</h3>
              </div>
              <p className="text-gray-600 pl-13">Proporcionamos recursos efectivos para manejar situaciones estresantes y construir resiliencia emocional.</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default VisionSection;