import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '../../components/public-components/PageTransition';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { register } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

type UserType = 'patient' | 'psychologist' | null;

const RegisterPage = () => {
  const location = useLocation();
  const [userType, setUserType] = useState<UserType>(location.state?.userType || null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false
  });
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!formData.terms) {
        toast.error('Debe aceptar los términos y condiciones');
        setIsLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error('Las contraseñas no coinciden');
        setIsLoading(false);
        return;
      }

      // Split name into first_name and last_name
      const nameParts = formData.name.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');

      const registerData = {
        email: formData.email.trim(),
        username: formData.email.trim(),
        password: formData.password,
        password2: formData.confirmPassword,
        user_type: userType === 'patient' ? 'client' : 'psychologist',  // Changed to lowercase
        first_name: firstName,
        last_name: lastName || ' '
      };

      const response = await register({
        ...registerData,
        user_type: registerData.user_type as "psychologist" | "client" | "admin"
      });
      setUser({
        ...response.user,
        user_type: response.user.user_type.toLowerCase() as "psychologist" | "client" | "admin"
      });
      toast.success('Registro exitoso');
      navigate(userType === 'patient' ? '/dashboard' : '/psicologo/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      // Only show the email exists error
      if (error.response?.data?.errors?.email?.[0]?.includes('existe') || 
          error.response?.data?.errors?.username?.[0]?.includes('existe')) {
        toast.error('Este correo electrónico ya está registrado');
      }
      // Silently handle other errors without showing toast
    } finally {
      setIsLoading(false);
    }
  };

  if (!userType) {
    return (
      <PageTransition>
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
            <h2 className="mt-6 text-center text-4xl font-bold text-[#2A6877]">Crear una cuenta</h2>
            <p className="mt-3 text-center text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="font-semibold text-[#2A6877] hover:text-[#235A67] underline decoration-2 decoration-[#B4E4D3] underline-offset-2">
                Inicia sesión aquí
              </Link>
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
          >
            <div className="bg-white/80 backdrop-blur-sm py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
              <h3 className="text-xl font-semibold text-gray-800 mb-8 text-center">
                ¿Cómo deseas utilizar Bienestar?
              </h3>
              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setUserType('patient')}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white rounded-xl border-2 border-gray-200 hover:border-[#2A6877] hover:bg-gray-50 transition-all duration-300 group"
                >
                  <span className="text-2xl">👤</span>
                  <div className="text-left">
                    <span className="block text-lg font-semibold text-gray-800 group-hover:text-[#2A6877]">Soy Paciente</span>
                    <span className="text-sm text-gray-500">Busco ayuda profesional</span>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setUserType('psychologist')}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white rounded-xl border-2 border-gray-200 hover:border-[#2A6877] hover:bg-gray-50 transition-all duration-300 group"
                >
                  <span className="text-2xl">👨‍⚕️</span>
                  <div className="text-left">
                    <span className="block text-lg font-semibold text-gray-800 group-hover:text-[#2A6877]">Soy Psicólogo</span>
                    <span className="text-sm text-gray-500">Quiero ofrecer mis servicios</span>
                  </div>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
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
            onClick={() => setUserType(null)}
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
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nombre completo
                </label>
                <div className="mt-1 relative">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2A6877] focus:border-transparent transition-all duration-300"
                    placeholder="Tu nombre completo"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Correo electrónico
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#2A6877] focus:border-[#2A6877]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#2A6877] focus:border-[#2A6877]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar contraseña
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#2A6877] focus:border-[#2A6877]"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  checked={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
                  className="h-4 w-4 text-[#2A6877] focus:ring-[#2A6877] border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                  Acepto los{' '}
                  <Link to="/terminos" className="text-[#2A6877] hover:text-[#235A67]">
                    términos y condiciones
                  </Link>
                </label>
              </div>

              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-[#2A6877] to-[#235A67] hover:from-[#235A67] hover:to-[#1D4B56] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A6877] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creando cuenta...
                    </div>
                  ) : (
                    'Crear cuenta'
                  )}
                </button>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default RegisterPage;