import { motion } from 'framer-motion';

const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: "Busca un Psicólogo",
      description: "Explora nuestro directorio de psicólogos certificados y encuentra el profesional ideal para ti.",
      icon: "🔍"
    },
    {
      number: 2,
      title: "Agenda tu sesión",
      description: "Elige el horario que mejor te acomode y agenda tu sesión de manera simple y rápida.",
      icon: "📅"
    },
    {
      number: 3,
      title: "Inicia tu terapia online",
      description: "Conéctate a tu sesión desde cualquier lugar a través de nuestra plataforma segura.",
      icon: "💻"
    }
  ];

  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-4xl font-serif font-bold text-gray-800 mb-4">
            ¿Cómo funciona Bienestar?
          </h2>
          <p className="text-gray-600 text-lg">
            Comienza tu proceso terapéutico en tres simples pasos
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-[#B4E4D3] via-[#2A6877] to-[#B4E4D3] -translate-y-1/2" />
          
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                <div className="bg-gradient-to-r from-[#2A6877] to-[#235A67] text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                  {step.number}
                </div>
              </div>
              
              <div className="mt-8 text-center space-y-4">
                <span className="text-4xl">{step.icon}</span>
                <h3 className="text-xl font-serif font-semibold text-gray-800">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;