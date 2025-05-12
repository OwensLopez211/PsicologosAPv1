import toast from 'react-hot-toast';

// ID único para todas las notificaciones
const TOAST_ID = 'unique-notification';



// Función para mostrar un toast de éxito

// Función para mostrar un toast de error

// Función para mostrar un toast de carga

// Función para mostrar un toast personalizado

// Función para actualizar un toast existente

// Función para descartar un toast específico

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
  
  info: (message: string) => {
    toast.dismiss();
    return toast(message, { 
      id: TOAST_ID,
      icon: 'ℹ️'
    });
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