import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '../../components/animations/PageTransition';
import toastService from '../../services/toastService';
import { requestPasswordReset } from '../../services/authService';

const RecuperarPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Llamada a la API para solicitar el restablecimiento de contraseña
      const response = await requestPasswordReset(email);
      
      if ('error' in response) {
        if (response.error === 'NETWORK_ERROR') {
          toastService.error('No pudimos conectar con el servidor. Por favor, verifica tu conexión.');
        } else {
          toastService.error('No pudimos procesar tu solicitud. Por favor, intenta nuevamente.');
        }
      } else {
        setRequestSent(true);
        toastService.success('Te hemos enviado un correo con instrucciones para restablecer tu contraseña.');
      }
    } catch (error) {
      console.error('Error al solicitar restablecimiento de contraseña:', error);
      toastService.error('No pudimos procesar tu solicitud. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
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
              Recupera tu contraseña
            </h2>
            <p className="mt-3 text-center text-sm text-gray-600">
              ¿Ya la recordaste?{' '}
              <Link to="/login" className="font-semibold text-[#2A6877] hover:text-[#235A67] underline decoration-2 decoration-[#B4E4D3] underline-offset-2 transition-colors duration-300">
                Inicia sesión aquí
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
            {!requestSent ? (
              <>
                <p className="text-sm text-gray-600 mb-6">
                  Ingresa tu correo electrónico y te enviaremos instrucciones para establecer una nueva contraseña.
                </p>
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="appearance-none block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2A6877] focus:border-transparent transition-all duration-300"
                        placeholder="tu@ejemplo.com"
                      />
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
                          Enviando...
                        </div>
                      ) : (
                        <>
                          <span className="relative z-10">Enviar instrucciones</span>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                          </div>
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-green-100 p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Correo enviado</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Hemos enviado instrucciones para restablecer tu contraseña a <span className="font-medium">{email}</span>. 
                  Por favor, revisa tu bandeja de entrada y sigue las instrucciones.
                </p>
                <p className="text-sm text-gray-500">
                  ¿No recibiste el correo? Revisa tu carpeta de spam o{' '}
                  <button 
                    onClick={() => setRequestSent(false)}
                    className="font-medium text-[#2A6877] hover:text-[#235A67] underline decoration-2 decoration-[#B4E4D3] underline-offset-2 transition-colors"
                  >
                    intenta nuevamente
                  </button>
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-center gap-2">
            <Link 
              to="/login" 
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors duration-300"
            >
              Volver a inicio de sesión
            </Link>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default RecuperarPasswordPage; 