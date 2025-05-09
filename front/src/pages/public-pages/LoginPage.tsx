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
      <div className="min-h-screen bg-gradient-to-br from-[#B4E4D3]/70 via-white to-[#B4E4D3]/30 flex flex-col justify-center py-4 sm:py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-24 sm:w-32 h-24 sm:h-32 rounded-full bg-[#2A6877]/10 blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-32 sm:w-40 h-32 sm:h-40 rounded-full bg-[#B4E4D3]/20 blur-3xl"></div>
          <div className="absolute top-1/3 right-1/4 w-16 sm:w-24 h-16 sm:h-24 rounded-full bg-[#2A6877]/5 blur-2xl"></div>
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
                className="relative mx-auto h-16 w-16 sm:h-24 sm:w-24 rounded-xl shadow-lg transform group-hover:scale-105 transition duration-300"
                src="/logo.jpeg"
                alt="E-mind"
              />
            </Link>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h2 className="mt-3 sm:mt-8 text-center text-2xl sm:text-4xl font-bold text-[#2A6877]">
              Bienvenido de nuevo
            </h2>
            <p className="mt-1 sm:mt-3 text-center text-xs sm:text-sm text-gray-600">
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
          className="mt-3 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
        >
          <div className="bg-white/90 backdrop-blur-md py-4 sm:py-8 px-4 sm:px-6 shadow-xl rounded-2xl sm:px-10 border border-white/50">
            <form className="space-y-3 sm:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-0.5 sm:mb-1">
                  Correo electrónico
                </label>
                <div className="mt-0.5 sm:mt-1 relative group">
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#2A6877]/40 to-[#B4E4D3]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10"></div>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
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
                    className="appearance-none block w-full pl-9 sm:pl-10 pr-4 py-1.5 sm:py-3 border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2A6877] focus:border-transparent transition-all duration-300 text-sm"
                    placeholder="tu@ejemplo.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-0.5 sm:mb-1">
                  Contraseña
                </label>
                <div className="mt-0.5 sm:mt-1 relative group">
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#2A6877]/40 to-[#B4E4D3]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10"></div>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
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
                    className="appearance-none block w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-1.5 sm:py-3 border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2A6877] focus:border-transparent transition-all duration-300 text-sm"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button" 
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {passwordVisible ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
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
                      className="h-3 w-3 sm:h-4 sm:w-4 text-[#2A6877] focus:ring-[#2A6877] border-gray-300 rounded transition-colors duration-200 cursor-pointer"
                    />
                    <span className="absolute -inset-0.5 bg-[#2A6877]/10 rounded-sm opacity-0 peer-checked:opacity-100 transition-opacity duration-300"></span>
                  </div>
                  <label htmlFor="remember" className="ml-2 block text-xs sm:text-sm text-gray-700 cursor-pointer">
                    Recordarme
                  </label>
                </div>

                <div className="text-xs sm:text-sm">
                  <Link to="/recuperar-password" className="font-medium text-[#2A6877] hover:text-[#235A67] underline decoration-2 decoration-[#B4E4D3] underline-offset-2 transition-colors duration-300">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </div>

              <div className="mt-2 sm:mt-4">
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="relative w-full flex justify-center py-1.5 sm:py-3 px-4 border border-transparent rounded-xl shadow-lg text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#2A6877] to-[#235A67] hover:from-[#235A67] hover:to-[#1D4B56] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A6877] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Iniciando sesión...
                    </div>
                  ) : (
                    <>
                      <span className="relative z-10">Iniciar sesión</span>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </div>

          <p className="mt-2 sm:mt-5 text-center text-[10px] sm:text-xs text-gray-500">
            Al iniciar sesión, aceptas nuestros <Link to="/terminos" className="underline hover:text-gray-700 transition-colors">Términos y Condiciones</Link> y <Link to="/privacidad" className="underline hover:text-gray-700 transition-colors">Política de Privacidad</Link>.
          </p>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default LoginPage;