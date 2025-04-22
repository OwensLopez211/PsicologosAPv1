import toast from 'react-hot-toast';

// Tipos de toast personalizados
type ToastType = 'success' | 'error' | 'loading' | 'custom';

// Opciones para toasts personalizados
interface ToastOptions {
  duration?: number;
  icon?: string | JSX.Element;
  style?: React.CSSProperties;
  className?: string;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

// Función para mostrar un toast de éxito
const showSuccess = (message: string, options?: ToastOptions) => {
  return toast.success(message, options);
};

// Función para mostrar un toast de error
const showError = (message: string, options?: ToastOptions) => {
  return toast.error(message, options);
};

// Función para mostrar un toast de carga
const showLoading = (message: string, options?: ToastOptions) => {
  return toast.loading(message, options);
};

// Función para mostrar un toast personalizado
const showCustom = (message: string, options?: ToastOptions) => {
  return toast(message, options);
};

// Función para actualizar un toast existente
const updateToast = (toastId: string, message: string, type?: ToastType, options?: ToastOptions) => {
  if (type === 'success') {
    toast.success(message, { ...options, id: toastId });
  } else if (type === 'error') {
    toast.error(message, { ...options, id: toastId });
  } else if (type === 'loading') {
    toast.loading(message, { ...options, id: toastId });
  } else {
    toast(message, { ...options, id: toastId });
  }
};

// Función para descartar un toast específico
const dismissToast = (toastId?: string) => {
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    toast.dismiss();
  }
};

// Exportar todas las funciones
const toastService = {
  success: showSuccess,
  error: showError,
  loading: showLoading,
  custom: showCustom,
  update: updateToast,
  dismiss: dismissToast,
  // También exportamos el toast original por si necesitamos acceder a otras funcionalidades
  toast
};

export default toastService;