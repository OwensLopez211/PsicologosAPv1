import { Toaster } from 'react-hot-toast';

const ToastProvider = () => {
  return (
    <Toaster
      position="top-center"
      gutter={12}
      containerStyle={{
        top: 80, // Aumentado de 40 a 80 para mover las notificaciones más abajo
        zIndex: 9999,
      }}
      toastOptions={{
        // Estilo por defecto para todos los toasts
        style: {
          background: '#FFFFFF',
          color: '#444444',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
          fontSize: '14px',
          fontWeight: '500',
          maxWidth: '380px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
        },
        // Duración por defecto
        duration: 5000,
        
        // Estilos específicos para cada tipo de toast
        success: {
          style: {
            background: 'rgba(235, 250, 242, 0.95)',
            border: '1px solid #2A6877',
            color: '#2A6877',
          },
          icon: (
            <div className="bg-[#2A6877] bg-opacity-15 p-2 rounded-full">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 text-[#2A6877]" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
          ),
        },
        
        error: {
          style: {
            background: 'rgba(254, 226, 226, 0.95)',
            border: '1px solid #DC2626',
            color: '#B91C1C',
          },
          icon: (
            <div className="bg-red-100 p-2 rounded-full">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 text-red-600" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
          ),
        },
        
        loading: {
          style: {
            background: 'rgba(236, 244, 255, 0.95)',
            border: '1px solid #3B82F6',
            color: '#1E40AF',
          },
          icon: (
            <div className="bg-blue-100 p-2 rounded-full">
              <svg 
                className="animate-spin h-5 w-5 text-blue-600" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                ></circle>
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          ),
        },
        
        // Configuración para toast de información
        custom: {
          style: {
            background: 'rgba(237, 242, 247, 0.95)',
            border: '1px solid #4A5568',
            color: '#2D3748',
          },
          icon: (
            <div className="bg-gray-200 p-2 rounded-full">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 text-gray-600" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
          ),
        },
      }}
    />
  );
};

export default ToastProvider;