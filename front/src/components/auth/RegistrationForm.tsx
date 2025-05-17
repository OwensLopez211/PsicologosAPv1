import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import FormField from './FormField';
import SubmitButton from './SubmitButton';
import TermsPopup from '../public-components/TermsPopup';

type UserType = 'patient' | 'psychologist' | null;

interface RegistrationFormProps {
  userType: UserType;
  onSubmit: (formData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    phoneNumber: string;
    terms: boolean;
  }) => void;
  onChangeUserType: () => void;
  isLoading: boolean;
}

const RegistrationForm = ({ 
  userType, 
  onSubmit, 
  onChangeUserType, 
  isLoading 
}: RegistrationFormProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    terms: false
  });
  const [showTerms, setShowTerms] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    // Actualizar los datos del formulario
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Si estamos modificando la contraseña, evaluar su fortaleza
    if (name === 'password') {
      evaluatePasswordStrength(value);
    }
  };

  const evaluatePasswordStrength = (password: string) => {
    let strength = 0;
    let feedback = '';
    
    if (password.length >= 8) {
      strength += 1;
    }
    
    if (/[A-Z]/.test(password)) {
      strength += 1;
    }
    
    if (/[0-9]/.test(password)) {
      strength += 1;
    }
    
    if (/[^A-Za-z0-9]/.test(password)) {
      strength += 1;
    }
    
    // Feedback basado en la fortaleza
    if (strength === 0) {
      feedback = 'Muy débil';
    } else if (strength === 1) {
      feedback = 'Débil';
    } else if (strength === 2) {
      feedback = 'Moderada';
    } else if (strength === 3) {
      feedback = 'Buena';
    } else {
      feedback = 'Excelente';
    }
    
    setPasswordStrength(strength);
    setPasswordFeedback(feedback);
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0: return 'bg-red-500';
      case 1: return 'bg-red-400';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-green-400';
      case 4: return 'bg-green-500';
      default: return 'bg-gray-200';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 1) {
      setCurrentStep(2);
    } else {
      onSubmit(formData);
    }
  };

  const goBack = () => {
    setCurrentStep(1);
  };

  const openTermsPopup = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowTerms(true);
  };

  const closeTermsPopup = () => {
    setShowTerms(false);
  };

  const acceptTerms = () => {
    setFormData({
      ...formData,
      terms: true
    });
    setShowTerms(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#B4E4D3]/70 via-white to-[#B4E4D3]/30 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-[#2A6877]/10 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-[#B4E4D3]/20 blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 rounded-full bg-[#2A6877]/5 blur-2xl"></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <Link to="/" className="block relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#2A6877] to-[#B4E4D3] rounded-lg blur opacity-25 group-hover:opacity-60 transition duration-700"></div>
          <img
            className="relative mx-auto h-24 w-24 rounded-xl shadow-lg transform group-hover:scale-105 transition duration-300"
            src="logo2.webp"
            alt="E-mind"
          />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold text-[#2A6877]">
          {userType === 'patient' ? 'Registro de Paciente' : 'Registro de Psicólogo'}
        </h2>
        
        {/* Pasos de registro */}
        <div className="mt-4 flex justify-center space-x-2">
          <div className={`w-24 h-1 rounded-full ${currentStep === 1 ? 'bg-[#2A6877]' : 'bg-[#B4E4D3]'}`}></div>
          <div className={`w-24 h-1 rounded-full ${currentStep === 2 ? 'bg-[#2A6877]' : 'bg-[#B4E4D3]'}`}></div>
        </div>
        
        <button 
          onClick={onChangeUserType}
          className="mt-3 text-center text-sm text-[#2A6877] hover:text-[#235A67] block mx-auto underline decoration-2 decoration-[#B4E4D3] underline-offset-2 transition-colors"
        >
          Cambiar tipo de cuenta
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-white/90 backdrop-blur-md py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-white/50">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {currentStep === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-medium text-gray-700 border-b border-gray-200 pb-2">
                    Información personal
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      id="firstName"
                      label="Nombres"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Tus nombres"
                    />

                    <FormField
                      id="lastName"
                      label="Apellidos"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Tus apellidos"
                    />
                  </div>

                  <FormField
                    id="email"
                    label="Correo electrónico"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@correo.com"
                  />
                  
                  <FormField
                    id="phoneNumber"
                    label="Número de teléfono"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="+56 9 1234 5678"
                  />

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      type="submit"
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-gradient-to-r from-[#2A6877] to-[#235A67] hover:from-[#235A67] hover:to-[#1D4B56] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A6877] transition-all duration-300"
                    >
                      Continuar
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-medium text-gray-700 border-b border-gray-200 pb-2">
                    Datos de acceso
                  </h3>
                  
                  <div className="space-y-4">
                    <FormField
                      id="password"
                      label="Contraseña"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Mínimo 8 caracteres"
                      isPassword={true}
                    />
                    
                    {/* Indicador de fortaleza de contraseña */}
                    {formData.password && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`${getPasswordStrengthColor()} h-2 rounded-full transition-all duration-300`} 
                              style={{ width: `${passwordStrength * 25}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-xs text-gray-500 w-20 text-right">{passwordFeedback}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                          <div className={`flex items-center ${/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}`}>
                            <span className={`mr-1 ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                              {/[A-Z]/.test(formData.password) ? '✓' : '○'}
                            </span>
                            Mayúscula
                          </div>
                          <div className={`flex items-center ${/[0-9]/.test(formData.password) ? 'text-green-600' : ''}`}>
                            <span className={`mr-1 ${/[0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                              {/[0-9]/.test(formData.password) ? '✓' : '○'}
                            </span>
                            Número
                          </div>
                          <div className={`flex items-center ${/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-600' : ''}`}>
                            <span className={`mr-1 ${/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                              {/[^A-Za-z0-9]/.test(formData.password) ? '✓' : '○'}
                            </span>
                            Símbolo
                          </div>
                          <div className={`flex items-center ${formData.password.length >= 8 ? 'text-green-600' : ''}`}>
                            <span className={`mr-1 ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                              {formData.password.length >= 8 ? '✓' : '○'}
                            </span>
                            8+ caracteres
                          </div>
                        </div>
                      </div>
                    )}

                    <FormField
                      id="confirmPassword"
                      label="Confirmar contraseña"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repite tu contraseña"
                    />
                    
                    {/* Error de coincidencia de contraseñas */}
                    {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Las contraseñas no coinciden
                      </p>
                    )}
                  </div>

                  <div className="flex items-center">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      required
                      checked={formData.terms}
                      onChange={handleChange}
                      className="h-4 w-4 text-[#2A6877] focus:ring-[#2A6877] border-gray-300 rounded"
                    />
                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                      Acepto los{' '}
                      <button 
                        onClick={openTermsPopup}
                        className="text-[#2A6877] hover:text-[#235A67] font-medium underline decoration-2 decoration-[#B4E4D3] underline-offset-2 transition-colors"
                      >
                        términos y condiciones
                      </button>
                    </label>
                  </div>

                  <div className="flex space-x-4">
                    <motion.button
                      type="button"
                      onClick={goBack}
                      className="w-1/3 flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A6877] transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                      Atrás
                    </motion.button>
                    <motion.div
                      className="w-2/3"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <SubmitButton isLoading={isLoading} text="Crear cuenta" loadingText="Creando cuenta..." />
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="font-medium text-[#2A6877] hover:text-[#235A67] underline decoration-2 decoration-[#B4E4D3] underline-offset-2 transition-colors">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
      
      {/* Terms Popup */}
      <AnimatePresence>
        <TermsPopup 
          isOpen={showTerms}
          onClose={closeTermsPopup}
          onAccept={acceptTerms}
        />
      </AnimatePresence>
    </div>
  );
};

export default RegistrationForm;