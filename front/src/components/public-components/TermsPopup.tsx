import { motion } from 'framer-motion';

interface TermsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

const TermsPopup = ({ isOpen, onClose, onAccept }: TermsPopupProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col"
      >
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Términos y Condiciones</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-grow">
          <div className="prose prose-sm max-w-none">
            <h4>1. Aceptación de los Términos</h4>
            <p>
              Al acceder y utilizar los servicios de Bienestar, aceptas estar legalmente obligado por estos términos y condiciones. 
              Si no estás de acuerdo con alguno de estos términos, no debes utilizar nuestros servicios.
            </p>
            
            <h4>2. Descripción del Servicio</h4>
            <p>
              Bienestar proporciona una plataforma que conecta a usuarios con profesionales de la salud mental. 
              No somos proveedores directos de servicios de salud mental, sino un medio para facilitar estas conexiones.
            </p>
            
            <h4>3. Elegibilidad</h4>
            <p>
              Para utilizar nuestros servicios, debes tener al menos 18 años de edad o la mayoría de edad legal en tu jurisdicción, 
              lo que sea mayor. Si eres menor de edad, necesitas el consentimiento de un padre o tutor legal.
            </p>
            
            <h4>4. Cuentas de Usuario</h4>
            <p>
              Al registrarte, aceptas proporcionar información precisa y completa. Eres responsable de mantener 
              la confidencialidad de tu cuenta y contraseña, y de restringir el acceso a tu computadora.
            </p>
            
            <h4>5. Privacidad</h4>
            <p>
              Tu privacidad es importante para nosotros. Nuestra Política de Privacidad describe cómo recopilamos, 
              utilizamos y protegemos tu información personal.
            </p>
            
            <p className="text-sm text-gray-500 mt-4">
              Última actualización: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={onAccept}
            className="px-4 py-2 bg-[#2A6877] text-white rounded-md hover:bg-[#235A67] transition-colors"
          >
            Aceptar términos
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default TermsPopup;