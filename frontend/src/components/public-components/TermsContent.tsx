import { motion } from 'framer-motion';

const TermsContent = () => {
  const sections = [
    {
      id: 1,
      title: "Aceptación de los Términos",
      content: "Al acceder y utilizar los servicios de Bienestar, aceptas estar legalmente obligado por estos términos y condiciones. Si no estás de acuerdo con alguno de estos términos, no debes utilizar nuestros servicios."
    },
    {
      id: 2,
      title: "Descripción del Servicio",
      content: "Bienestar proporciona una plataforma que conecta a usuarios con profesionales de la salud mental. No somos proveedores directos de servicios de salud mental, sino un medio para facilitar estas conexiones."
    },
    {
      id: 3,
      title: "Elegibilidad",
      content: "Para utilizar nuestros servicios, debes tener al menos 18 años de edad o la mayoría de edad legal en tu jurisdicción, lo que sea mayor. Si eres menor de edad, necesitas el consentimiento de un padre o tutor legal."
    },
    {
      id: 4,
      title: "Cuentas de Usuario",
      content: "Al registrarte, aceptas proporcionar información precisa y completa. Eres responsable de mantener la confidencialidad de tu cuenta y contraseña, y de restringir el acceso a tu computadora."
    },
    {
      id: 5,
      title: "Privacidad",
      content: "Tu privacidad es importante para nosotros. Nuestra Política de Privacidad describe cómo recopilamos, utilizamos y protegemos tu información personal."
    },
    {
      id: 6,
      title: "Limitación de Responsabilidad",
      content: "Bienestar no será responsable por daños directos, indirectos, incidentales, especiales o consecuentes que resulten del uso o la imposibilidad de usar nuestros servicios."
    },
    {
      id: 7,
      title: "Modificaciones a los Términos",
      content: "Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en nuestra plataforma."
    },
    {
      id: 8,
      title: "Ley Aplicable",
      content: "Estos términos se regirán e interpretarán de acuerdo con las leyes de Chile, sin tener en cuenta sus disposiciones sobre conflictos de leyes."
    },
    {
      id: 9,
      title: "Contacto",
      content: "Si tienes preguntas sobre estos términos, por favor contáctanos a través de nuestro formulario de contacto o enviando un correo electrónico a info@bienestar.cl."
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
      <div className="space-y-8">
        {sections.map((section, index) => (
          <motion.div 
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0"
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-[#2A6877] bg-opacity-10 flex items-center justify-center mr-4 flex-shrink-0">
                <span className="text-[#2A6877] font-semibold">{section.id}</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800">{section.title}</h2>
            </div>
            <div className="pl-14">
              <p className="text-gray-600 leading-relaxed">{section.content}</p>
            </div>
          </motion.div>
        ))}
        
        <div className="mt-12 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Última actualización: {new Date().toLocaleDateString()}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-[#2A6877] text-white rounded-md text-sm font-medium hover:bg-[#235A67] transition-colors"
              onClick={() => window.print()}
            >
              Imprimir términos
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsContent;