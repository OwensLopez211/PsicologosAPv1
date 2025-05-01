import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { login } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import PageTransition from '../../components/animations/PageTransition';
import { motion } from 'framer-motion';
import toastService from '../../services/toastService';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Verificar si hay mensaje de expiración en la URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const expired = params.get('expired');
    if (expired === 'true') {
      toastService.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
    }
  }, [location]);

  // Cargar email recordado
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail, remember: true }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if ('error' in result) {
        // Usar toastService aquí
        switch (result.error) {
          case 'INVALID_CREDENTIALS':
            toastService.error('Correo o contraseña incorrectos. Por favor verifica tus credenciales.');
            break;
          // Manejar otros errores...
        }
      } else {
      // Gestionar "recordarme"
      if (formData.remember) {
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      // Normalizar el tipo de usuario
        const normalizedUserType = result.user.user_type.toLowerCase() as 'client' | 'psychologist' | 'admin';
      
      setUser({
          ...result.user,
        user_type: normalizedUserType
      });
      // Mostrar mensaje de bienvenida
      toastService.success(`¡Bienvenido de nuevo, ${result.user.first_name || 'Usuario'}!`);
      
      // Navegar según el tipo de usuario
      switch (normalizedUserType) {
        case 'client':
          navigate('/dashboard');
          break;
        case 'psychologist':
          navigate('/psicologo/dashboard');
          break;
        case 'admin':
          navigate('/admin/dashboard');
          break;
        default:
            console.error('Unknown user type:', result.user.user_type);
            toastService.error('Error en el tipo de usuario');
        }
      }
    } catch (err) {
      console.error('Unexpected login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-[#B4E4D3]/70 via-white to-[#B4E4D3]/30 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-[#2A6877]/10 blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-[#B4E4D3]/20 blur-3xl"></div>
          <div className="absolute top-1/3 right-1/4 w-24 h-24 rounded-full bg-[#2A6877]/5 blur-2xl"></div>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
          >
            <Link to="/" className="block relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#2A6877] to-[#B4E4D3] rounded-lg blur opacity-25 group-hover:opacity-60 transition duration-700"></div>
              <img
                className="relative mx-auto h-24 w-24 rounded-xl shadow-lg transform group-hover:scale-105 transition duration-300"
                src="/logo.jpeg"
                alt="Bienestar"
              />
            </Link>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h2 className="mt-8 text-center text-4xl font-bold text-[#2A6877]">
              Bienvenido de nuevo
            </h2>
            <p className="mt-3 text-center text-sm text-gray-600">
              ¿No tienes una cuenta?{' '}
              <Link to="/registro" className="font-semibold text-[#2A6877] hover:text-[#235A67] underline decoration-2 decoration-[#B4E4D3] underline-offset-2 transition-colors duration-300">
                Regístrate aquí
              </Link>
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
        >
          <div className="bg-white/90 backdrop-blur-md py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-white/50">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <div className="mt-1 relative group">
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#2A6877]/40 to-[#B4E4D3]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10"></div>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="appearance-none block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2A6877] focus:border-transparent transition-all duration-300"
                    placeholder="tu@ejemplo.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
                  Contraseña
                </label>
                <div className="mt-1 relative group">
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#2A6877]/40 to-[#B4E4D3]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10"></div>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={passwordVisible ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2A6877] focus:border-transparent transition-all duration-300"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button" 
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {passwordVisible ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="relative">
                    <input
                      id="remember"
                      name="remember"
                      type="checkbox"
                      checked={formData.remember}
                      onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                      className="h-4 w-4 text-[#2A6877] focus:ring-[#2A6877] border-gray-300 rounded transition-colors duration-200 cursor-pointer"
                    />
                    <span className="absolute -inset-0.5 bg-[#2A6877]/10 rounded-sm opacity-0 peer-checked:opacity-100 transition-opacity duration-300"></span>
                  </div>
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                    Recordarme
                  </label>
                </div>

                <div className="text-sm">
                  <Link to="/recuperar-password" className="font-medium text-[#2A6877] hover:text-[#235A67] underline decoration-2 decoration-[#B4E4D3] underline-offset-2 transition-colors duration-300">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </div>

              <div>
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="relative w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-[#2A6877] to-[#235A67] hover:from-[#235A67] hover:to-[#1D4B56] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A6877] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Iniciando sesión...
                    </div>
                  ) : (
                    <>
                      <span className="relative z-10">Iniciar sesión</span>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </>
                  )}
                </motion.button>
              </div>
            </form>

            {/* <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-col items-center">
                <p className="text-sm text-gray-500 mb-4">O continúa con</p>
                <div className="flex space-x-4">
                  <motion.button
                    type="button"
                    className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md hover:shadow-lg border border-gray-200 text-gray-700 transition-all duration-300"
                    whileHover={{ y: -2, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.477 2 2 6.477 2 12C2 16.991 5.657 21.128 10.438 21.879V14.89H7.898V12H10.438V9.797C10.438 7.291 11.93 5.907 14.215 5.907C15.309 5.907 16.453 6.102 16.453 6.102V8.562H15.193C13.95 8.562 13.563 9.333 13.563 10.124V12H16.336L15.893 14.89H13.563V21.879C18.343 21.129 22 16.99 22 12C22 6.477 17.523 2 12 2Z" fill="#1877F2"/>
                    </svg>
                  </motion.button>
                  <motion.button
                    type="button"
                    className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md hover:shadow-lg border border-gray-200 text-gray-700 transition-all duration-300"
                    whileHover={{ y: -2, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#FBC02D"/>
                      <path d="M3.15302 7.3455L6.43851 9.755C7.32752 7.554 9.48052 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C8.15902 2 4.82802 4.1685 3.15302 7.3455Z" fill="#E53935"/>
                      <path d="M12 22C14.583 22 16.93 21.0115 18.7045 19.404L15.6095 16.785C14.5718 17.5742 13.3037 18.001 12 18C9.39897 18 7.19047 16.3415 6.35847 14.027L3.09747 16.5395C4.75247 19.778 8.11347 22 12 22Z" fill="#4CAF50"/>
                      <path d="M21.8055 10.0415H21V10H12V14H17.6515C17.2571 15.1082 16.5467 16.0766 15.608 16.7855L15.6095 16.7845L18.7045 19.4035C18.4855 19.6025 22 17 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#1565C0"/>
                    </svg>
                  </motion.button>
                  <motion.button
                    type="button"
                    className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md hover:shadow-lg border border-gray-200 text-gray-700 transition-all duration-300"
                    whileHover={{ y: -2, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.05 20.28C16.07 21.23 15.01 21.04 13.99 20.63C12.91 20.21 11.92 20.19 10.78 20.63C9.32 21.22 8.6 20.99 7.74 20.28C2.2 14.58 2.97 6.04 9.21 5.76C10.78 5.84 11.81 6.52 12.66 6.56C13.93 6.36 15.14 5.66 16.57 5.77C18.38 5.91 19.72 6.67 20.58 8.03C17.24 10.19 17.91 14.52 20.89 15.77C20.22 17.4 19.35 19.01 17.05 20.29L17.05 20.28ZM12.54 5.69C12.35 3.44 14.13 1.56 16.27 1.35C16.59 3.93 14.16 5.95 12.54 5.69Z" fill="black"/>
                    </svg>
                  </motion.button>
                </div>
              </div>
            </div> */}
          </div>

          <p className="mt-5 text-center text-xs text-gray-500">
            Al iniciar sesión, aceptas nuestros <Link to="/terminos" className="underline hover:text-gray-700 transition-colors">Términos y Condiciones</Link> y <Link to="/privacidad" className="underline hover:text-gray-700 transition-colors">Política de Privacidad</Link>.
          </p>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default LoginPage;