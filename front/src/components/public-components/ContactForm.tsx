import { useState, FormEvent, useEffect } from 'react';

// URL del backend basada en el entorno
const API_URL = import.meta.env.VITE_API_URL || 'https://emindapp.cl';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    mensaje: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Validación de correo electrónico
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    setEmailError(isValid ? null : 'Por favor, ingresa un correo electrónico válido');
    return isValid;
  };

  // Validar cuando cambia el correo
  useEffect(() => {
    if (formData.correo) {
      validateEmail(formData.correo);
    }
  }, [formData.correo]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validaciones antes de enviar
    if (!validateEmail(formData.correo)) {
      return;
    }

    if (formData.nombre.trim().length < 2) {
      setError('Por favor, ingresa un nombre válido');
      return;
    }

    if (formData.mensaje.trim().length < 10) {
      setError('El mensaje debe tener al menos 10 caracteres');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    // Deshabilitar el botón para evitar múltiples envíos
    setSubmitDisabled(true);
    
    try {
      // Usar la URL configurada
      const response = await fetch(`${API_URL}/contacto/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      // Obtener la respuesta como JSON para manejar errores del servidor
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Hubo un problema al enviar el mensaje');
      }
      
      // Respuesta exitosa
      setIsSuccess(true);
      // Limpiar el formulario después del éxito
      setFormData({
        nombre: '',
        correo: '',
        mensaje: ''
      });
      
      // Resetear el estado de éxito después de 5 segundos
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
      
    } catch (err) {
      console.error('Error en formulario de contacto:', err);
      setError(err instanceof Error ? err.message : 'Error al enviar el mensaje');
    } finally {
      setIsLoading(false);
      
      // Habilitar el botón después de 3 segundos para evitar spam
      setTimeout(() => {
        setSubmitDisabled(false);
      }, 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold mb-2 text-gray-800">Envíanos un mensaje</h2>
        <p className="text-gray-600">¿Tienes preguntas o algún comentario? ¡Contáctanos!</p>
      </div>

      {isSuccess ? (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
          <p className="font-medium">¡Mensaje enviado con éxito!</p>
          <p className="text-sm">Nos pondremos en contacto contigo a la brevedad.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#2A6877] focus:border-[#2A6877] outline-none transition-all duration-200"
              placeholder="Ingresa tu nombre"
              required
              minLength={2}
              disabled={isLoading || submitDisabled}
            />
          </div>

          <div>
            <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-1">
              Correo
            </label>
            <input
              type="email"
              id="correo"
              value={formData.correo}
              onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
              className={`w-full px-4 py-2 border rounded-md outline-none transition-all duration-200 ${
                emailError ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : 'border-gray-300 focus:ring-[#2A6877] focus:border-[#2A6877]'
              }`}
              placeholder="Ingresa tu correo electrónico"
              required
              disabled={isLoading || submitDisabled}
            />
            {emailError && (
              <p className="mt-1 text-xs text-red-500">{emailError}</p>
            )}
          </div>

          <div>
            <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 mb-1">
              Mensaje
            </label>
            <textarea
              id="mensaje"
              value={formData.mensaje}
              onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#2A6877] focus:border-[#2A6877] outline-none transition-all duration-200 resize-none"
              placeholder="Escribe tu mensaje"
              required
              minLength={10}
              disabled={isLoading || submitDisabled}
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.mensaje.length < 10 
                ? `Mínimo 10 caracteres (${formData.mensaje.length}/10)` 
                : `Caracteres: ${formData.mensaje.length}`}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="flex justify-center pt-2">
            <button
              type="submit"
              className={`bg-[#2A6877] text-white px-8 py-3 rounded-md hover:bg-[#235A67] transition-colors shadow-md ${
                (isLoading || submitDisabled) ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              disabled={isLoading || submitDisabled || !!emailError}
            >
              {isLoading ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ContactForm;