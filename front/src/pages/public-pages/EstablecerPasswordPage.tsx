import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { verifyResetToken, resetPassword } from '../../services/authService';
import { motion } from 'framer-motion';
import PageTransition from '../../components/animations/PageTransition';
import toastService from '../../services/toastService';

const EstablecerPasswordPage = () => {
  const { token } = useParams<{ token: string }>();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [resetComplete, setResetComplete] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState('');

  // Verificar token al cargar la página
  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setIsTokenValid(false);
        setIsVerifying(false);
        return;
      }

      try {
        const response = await verifyResetToken(token);
        setIsTokenValid(response.valid);
        if (response.valid && response.email) {
          setUserEmail(response.email);
        }
      } catch (error) {
        console.error('Error al verificar token:', error);
        setIsTokenValid(false);
      } finally {
        setIsVerifying(false);
      }
    };

    checkToken();
  }, [token]);

  // Evaluar fortaleza de la contraseña
  useEffect(() => {
    evaluatePasswordStrength(formData.password);
  }, [formData.password]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (formData.password.length < 8) {
      toastService.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toastService.error('Las contraseñas no coinciden');
      return;
    }

    if (passwordStrength < 3) {
      toastService.info('Te recomendamos usar una contraseña más segura');
      // Seguimos adelante, solo es una advertencia
    }
    
    setIsLoading(true);

    try {
      if (!token || !userEmail) {
        throw new Error('Token o email no disponible');
      }
      
      const response = await resetPassword(token, formData.password);
      
      if ('error' in response) {
        if (response.error === 'INVALID_TOKEN') {
          toastService.error('El enlace ha expirado o no es válido');
        } else {
          toastService.error('No pudimos restablecer tu contraseña. Por favor, intenta nuevamente.');
        }
      } else {
        setResetComplete(true);
        toastService.success('¡Tu contraseña ha sido restablecida con éxito!');
      }
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      toastService.error('Ha ocurrido un error. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Si el token no es válido o el restablecimiento ya se completó
  const renderInvalidTokenOrComplete = () => (
    <div className="text-center py-6">
      <div className="flex justify-center mb-4">
        <div className="rounded-full bg-blue-100 p-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {resetComplete ? '¡Contraseña restablecida!' : 'Enlace no válido'}
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        {resetComplete
          ? 'Tu contraseña ha sido restablecida correctamente. Ya puedes iniciar sesión con tu nueva contraseña.'
          : 'El enlace de restablecimiento ha expirado o no es válido. Por favor, solicita un nuevo enlace de restablecimiento.'}
      </p>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="inline-block"
      >
        <Link
          to={resetComplete ? '/login' : '/recuperar-password'}
          className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-[#2A6877] to-[#235A67] hover:from-[#235A67] hover:to-[#1D4B56] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A6877]"
        >
          {resetComplete ? 'Iniciar sesión' : 'Solicitar nuevo enlace'}
        </Link>
      </motion.div>
    </div>
  );

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
            className="flex flex-col items-center"
          >
            <Link to="/" className="block relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-[#2A6877]/60 to-[#B4E4D3]/60 rounded-full blur-md opacity-20 group-hover:opacity-50 transition duration-700"></div>
              <div className="relative mx-auto h-32 w-32 p-1 rounded-full bg-gradient-to-tr from-white via-[#B4E4D3]/20 to-[#2A6877]/20 shadow-lg flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:shadow-xl">
                <div className="h-full w-full rounded-full bg-white overflow-hidden flex items-center justify-center">
                  <img
                    className="h-[85%] w-[85%] object-contain transform group-hover:scale-105 transition duration-300"
                    src="/logo2.webp"
                    alt="E-mind"
                    width="128"
                    height="128"
                  />
                </div>
              </div>
            </Link>
            <div className="flex flex-col items-center mt-4">
              <span className="text-[#2A6877] text-2xl font-bold leading-tight">E-mind</span>
              <span className="text-gray-500 text-sm leading-tight">Encuentra tu bienestar</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h2 className="mt-8 text-center text-4xl font-bold text-[#2A6877]">
              Nueva contraseña
            </h2>
            <p className="mt-3 text-center text-sm text-gray-600">
              {!resetComplete && "Establece una nueva contraseña segura para tu cuenta"}
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
            {isVerifying ? (
              <div className="flex flex-col items-center justify-center py-6">
                <svg className="animate-spin h-10 w-10 text-[#2A6877]" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="mt-3 text-sm text-gray-600">Verificando enlace...</p>
              </div>
            ) : isTokenValid && !resetComplete ? (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
                    Nueva contraseña
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
                      required
                      value={formData.password}
                      onChange={handleChange}
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
                  
                  {/* Indicador de fortaleza de contraseña */}
                  {formData.password && (
                    <div className="mt-3 space-y-1">
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
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-1">
                    Confirmar contraseña
                  </label>
                  <div className="mt-1 relative group">
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#2A6877]/40 to-[#B4E4D3]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10"></div>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={passwordVisible ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="appearance-none block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2A6877] focus:border-transparent transition-all duration-300"
                      placeholder="••••••••"
                    />
                  </div>
                  
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
                        Guardando...
                      </div>
                    ) : (
                      <>
                        <span className="relative z-10">Establecer nueva contraseña</span>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </div>
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            ) : (
              renderInvalidTokenOrComplete()
            )}
          </div>

          <div className="mt-6 flex justify-center gap-2">
            <Link 
              to="/login" 
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors duration-300"
            >
              Volver a inicio de sesión
            </Link>
            <span className="text-gray-400">•</span>
            <Link 
              to="/ayuda" 
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors duration-300"
            >
              ¿Necesitas ayuda?
            </Link>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default EstablecerPasswordPage; 