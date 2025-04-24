import toast from 'react-hot-toast';

// ID único para todas las notificaciones
const TOAST_ID = 'unique-notification';

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

const toastService = {
  success: (message: string) => {
    // Antes de mostrar un nuevo toast, eliminar cualquier toast existente
    toast.dismiss();
    return toast.success(message, { id: TOAST_ID });
  },
  
  error: (message: string) => {
    toast.dismiss();
    return toast.error(message, { id: TOAST_ID });
  },
  
  loading: (message: string) => {
    toast.dismiss();
    return toast.loading(message, { id: TOAST_ID });
  },
  
  custom: (message: string) => {
    toast.dismiss();
    return toast.custom(message, { id: TOAST_ID });
  },
  
  // Método para eliminar todas las notificaciones
  dismissAll: () => {
    toast.dismiss();
  },
  
  // También exportamos el toast original por si necesitamos acceder a otras funcionalidades
  toast
};

export default toastService;