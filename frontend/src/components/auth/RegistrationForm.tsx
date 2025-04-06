// src/components/auth/RegistrationForm.tsx
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
    <div className="min-h-screen bg-gradient-to-br from-[#B4E4D3] via-white to-[#B4E4D3]/30 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <Link to="/" className="block relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#2A6877] to-[#B4E4D3] rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <img
            className="relative mx-auto h-24 w-24 rounded-xl shadow-lg transform group-hover:scale-105 transition duration-300"
            src="/logo.jpeg"
            alt="Bienestar"
          />
        </Link>
        <h2 className="mt-6 text-center text-4xl font-bold text-[#2A6877]">
          {userType === 'patient' ? 'Registro de Paciente' : 'Registro de Psicólogo'}
        </h2>
        <button 
          onClick={onChangeUserType}
          className="mt-3 text-center text-sm text-[#2A6877] hover:text-[#235A67] block mx-auto underline decoration-2 decoration-[#B4E4D3] underline-offset-2"
        >
          Cambiar tipo de cuenta
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white/80 backdrop-blur-sm py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
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

            <FormField
              id="confirmPassword"
              label="Confirmar contraseña"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
            />

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
                  className="text-[#2A6877] hover:text-[#235A67] font-medium underline"
                >
                  términos y condiciones
                </button>
              </label>
            </div>

            <SubmitButton isLoading={isLoading} text="Crear cuenta" loadingText="Creando cuenta..." />
          </form>
        </div>
      </motion.div>

      {/* Using the reusable TermsPopup component */}
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