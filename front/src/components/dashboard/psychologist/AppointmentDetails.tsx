import { Fragment, useState, useEffect, useLayoutEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import toastService from '../../../services/toastService';

// Define appointment status types to match backend
type AppointmentStatus = 'PENDING_PAYMENT' | 'PAYMENT_UPLOADED' | 'PAYMENT_VERIFIED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

// Define appointment interface to match backend
interface Appointment {
  id: number;
  client_name: string; // From serializer method field
  date: string; // Backend sends date as string
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  psychologist_notes?: string;
  client_notes?: string;
  status_display: string; // From serializer method field
}

interface AppointmentDetailsProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (id: number, status: AppointmentStatus) => void;
  onNotesChange?: (id: number, notes: string) => void;
  refreshAppointments: () => void;
}

const AppointmentDetails = ({ 
  appointment, 
  isOpen, 
  onClose,
  onStatusChange,
  onNotesChange,
  refreshAppointments
}: AppointmentDetailsProps) => {
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { user, token, setToken, refreshUserSession } = useAuth();

  // Función para sincronizar el token desde localStorage
  const syncTokenFromLocalStorage = () => {
    const localStorageToken = localStorage.getItem('token');
    if (localStorageToken && localStorageToken !== token) {
      console.log('Sincronizando token desde localStorage en AppointmentDetails');
      setToken(localStorageToken);
      return true;
    }
    return false;
  };

  // useLayoutEffect se ejecuta siempre antes de que el componente se pinte en pantalla
  useLayoutEffect(() => {
    syncTokenFromLocalStorage();
  }, []);

  // Sincronizar el token inmediatamente cuando el componente se monta o se abre
  useEffect(() => {
    if (isOpen) {
      syncTokenFromLocalStorage();
    }
  }, [isOpen]);
  
  // Log de debugging y segunda verificación de token
  useEffect(() => {
    console.log('Usuario actual:', user);
    console.log('¿Es psicólogo?:', user?.user_type === 'psychologist');
    console.log('Token disponible:', token ? 'Sí' : 'No');
    
    // Verificar si hay discrepancia entre token en localStorage y en el contexto
    syncTokenFromLocalStorage();
  }, [user, token]);

  // Update notes when appointment changes
  useEffect(() => {
    if (appointment) {
      setNotes(appointment.psychologist_notes || '');
    }
  }, [appointment]);

  // Control body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Disable scrolling on body when modal is open
      document.body.style.overflow = 'hidden';
      
      // Sincronizar token cuando se abre el modal
      syncTokenFromLocalStorage();
    } else {
      // Re-enable scrolling when modal is closed
      document.body.style.overflow = '';
    }
    
    // Cleanup function to ensure scrolling is re-enabled
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Get status color
  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'PENDING_PAYMENT':
      case 'PAYMENT_UPLOADED':
        return 'bg-yellow-100 text-yellow-800';
      case 'PAYMENT_VERIFIED':
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
      case 'NO_SHOW':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para mostrar el texto del estado de forma legible
  const getStatusDisplay = (status: AppointmentStatus): string => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return 'Pendiente de pago';
      case 'PAYMENT_UPLOADED':
        return 'Pago subido';
      case 'PAYMENT_VERIFIED':
        return 'Pago verificado';
      case 'CONFIRMED':
        return 'Confirmada';
      case 'COMPLETED':
        return 'Completada';
      case 'CANCELLED':
        return 'Cancelada';
      case 'NO_SHOW':
        return 'No asistió';
      default:
        return status;
    }
  };

  // Handle status change with API call
  const handleStatusChange = async (status: AppointmentStatus) => {
    if (!appointment) return;
    
    // Sincronizar token antes de la operación
    syncTokenFromLocalStorage();
    
    setIsSaving(true);
    
    // Mostrar toast de carga
    toastService.loading('Actualizando estado...');
    
    try {
      // Asegurar que tenemos el token más reciente del localStorage
      const currentToken = localStorage.getItem('token');
      if (!currentToken) {
        toastService.error('No hay token de autenticación disponible. Por favor, inicia sesión nuevamente.');
        return;
      }
      
      // Sincronizar con el contexto si es necesario
      if (currentToken !== token) {
        console.log('Actualizando token en contexto antes de cambiar estado');
        setToken(currentToken);
      }
      
      console.log('Enviando actualización de estado:', {
        appointmentId: appointment.id,
        nuevoEstado: status,
        estadoActual: appointment.status,
        tokenDisponible: !!currentToken
      });
      
      // Configuración manual con el token
      const config = {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        }
      };
      
      // No necesitamos pasar config porque el interceptor de api ya agrega los headers
      const response = await api.patch(
        `/appointments/${appointment.id}/update-status/`, 
        { status },
        config // Usar la configuración manual con el token
      );
      
      console.log('Respuesta actualización:', response.data);
      
      // Call the parent component's handler if provided
      if (onStatusChange) {
        onStatusChange(appointment.id, status);
      }
      
      // Mostrar notificación de éxito con toast
      toastService.success(`Estado actualizado a: ${getStatusDisplay(status)}`);
      refreshAppointments();
    } catch (err: any) {
      console.error('Error completo al actualizar estado:', err);
      
      // Si recibimos un 401, intentar refrescar el token
      if (err.response && err.response.status === 401) {
        try {
          const refreshed = await refreshUserSession();
          if (refreshed) {
            // Intentar nuevamente la petición con el token actualizado
            handleStatusChange(status);
            return;
          }
        } catch (refreshError) {
          console.error('Error al refrescar token:', refreshError);
        }
      }
      
      // Mostrar error con toast
      let errorMsg = 'Error al actualizar el estado. Inténtalo de nuevo.';
      if (err.response && err.response.data?.detail) {
        errorMsg = `Error: ${err.response.data.detail}`;
      }
      toastService.error(errorMsg);
      
      // Mostrar información más detallada del error en consola
      if (err.response) {
        console.error('Detalles del error:', {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Handle notes save with API call
  const handleSaveNotes = async () => {
    if (!appointment) return;
    
    // Sincronizar token antes de la operación
    syncTokenFromLocalStorage();
    
    setIsSaving(true);
    
    // Mostrar toast de carga
    toastService.loading('Guardando notas...');
    
    try {
      // Asegurar que tenemos el token más reciente del localStorage
      const currentToken = localStorage.getItem('token');
      if (!currentToken) {
        toastService.error('No hay token de autenticación disponible. Por favor, inicia sesión nuevamente.');
        return;
      }
      
      // Sincronizar con el contexto si es necesario
      if (currentToken !== token) {
        console.log('Actualizando token en contexto antes de guardar notas');
        setToken(currentToken);
      }
      
      console.log('Guardando notas para cita:', appointment.id);
      
      // Configuración manual con el token
      const config = {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        }
      };
      
      // No necesitamos pasar config porque el interceptor de api ya agrega los headers
      const response = await api.patch(
        `/appointments/${appointment.id}/add-notes/`,
        { psychologist_notes: notes },
        config // Usar la configuración manual con el token
      );
      
      console.log('Respuesta guardado de notas:', response.data);
      
      // Call the parent component's handler if provided
      if (onNotesChange) {
        onNotesChange(appointment.id, notes);
      }
      
      // Mostrar notificación de éxito con toast
      toastService.success('Notas guardadas correctamente');
      refreshAppointments();
    } catch (err: any) {
      console.error('Error completo al guardar notas:', err);
      
      // Si recibimos un 401, intentar refrescar el token
      if (err.response && err.response.status === 401) {
        try {
          const refreshed = await refreshUserSession();
          if (refreshed) {
            // Intentar nuevamente la petición con el token actualizado
            handleSaveNotes();
            return;
          }
        } catch (refreshError) {
          console.error('Error al refrescar token:', refreshError);
        }
      }
      
      // Mostrar error con toast
      let errorMsg = 'Error al guardar las notas. Inténtalo de nuevo.';
      if (err.response && err.response.data?.detail) {
        errorMsg = `Error: ${err.response.data.detail}`;
      }
      toastService.error(errorMsg);
      
      // Mostrar información más detallada del error en consola
      if (err.response) {
        console.error('Detalles del error:', {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!appointment) return null;

  // Map backend status to display buttons
  const canChangeToStatus = (status: AppointmentStatus): boolean => {
    // Only allow changing status if current status is PAYMENT_VERIFIED or CONFIRMED
    if (appointment.status !== 'PAYMENT_VERIFIED' && appointment.status !== 'CONFIRMED') {
      return false;
    }
    
    // Define allowed transitions
    const allowedTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
      'PAYMENT_VERIFIED': ['CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
      'CONFIRMED': ['COMPLETED', 'CANCELLED', 'NO_SHOW'],
      'PENDING_PAYMENT': [],
      'PAYMENT_UPLOADED': [],
      'COMPLETED': [],
      'CANCELLED': [],
      'NO_SHOW': []
    };
    
    return allowedTransitions[appointment.status].includes(status);
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog 
        as="div" 
        className="fixed inset-0 overflow-hidden"
        style={{ zIndex: 99999 }} 
        onClose={onClose}
      >
        <div className="absolute inset-0 overflow-hidden">
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex sm:pl-16" style={{ zIndex: 99999 }}>
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-300"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-300"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className="relative w-screen max-w-md">
                <div className="h-full flex flex-col bg-white shadow-xl overflow-y-auto">
                  <div className="px-4 py-6 sm:px-6">
                    <div className="flex items-start justify-between">
                      <Dialog.Title className="text-lg font-medium text-gray-900">
                        Detalles de la Cita
                      </Dialog.Title>
                      <div className="ml-3 h-7 flex items-center">
                        <button
                          type="button"
                          className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                          onClick={onClose}
                        >
                          <span className="sr-only">Cerrar panel</span>
                          <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 px-4 sm:px-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Paciente</h3>
                        <p className="mt-1 text-lg font-medium text-gray-900">{appointment.client_name}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Fecha y Hora</h3>
                        <p className="mt-1 text-base text-gray-900">
                          {format(new Date(appointment.date), "EEEE d 'de' MMMM, yyyy", { locale: es })}
                        </p>
                        <p className="text-base text-gray-900">
                          {appointment.start_time} - {appointment.end_time}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Estado</h3>
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {appointment.status_display}
                          </span>
                        </div>
                      </div>
                      
                      {/* Only show status change options if allowed */}
                      {(appointment.status === 'PAYMENT_VERIFIED' || appointment.status === 'CONFIRMED') && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Cambiar Estado</h3>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {canChangeToStatus('CONFIRMED') && (
                              <button
                                onClick={() => handleStatusChange('CONFIRMED')}
                                disabled={isSaving}
                                className={`px-3 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                Confirmada
                              </button>
                            )}
                            
                            {canChangeToStatus('COMPLETED') && (
                              <button
                                onClick={() => handleStatusChange('COMPLETED')}
                                disabled={isSaving}
                                className={`px-3 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                Completada
                              </button>
                            )}
                            
                            {canChangeToStatus('CANCELLED') && (
                              <button
                                onClick={() => handleStatusChange('CANCELLED')}
                                disabled={isSaving}
                                className={`px-3 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                Cancelada
                              </button>
                            )}
                            
                            {canChangeToStatus('NO_SHOW') && (
                              <button
                                onClick={() => handleStatusChange('NO_SHOW')}
                                disabled={isSaving}
                                className={`px-3 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                No Asistió
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Client notes (read-only) */}
                      {appointment.client_notes && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Notas del Paciente</h3>
                          <div className="mt-1 p-2 bg-gray-50 rounded-md text-sm text-gray-700">
                            {appointment.client_notes}
                          </div>
                        </div>
                      )}
                      
                      {/* Psychologist notes (editable) */}
                      <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-500">
                          Notas del Psicólogo
                        </label>
                        <div className="mt-1">
                          <textarea
                            id="notes"
                            name="notes"
                            rows={4}
                            className="shadow-sm focus:ring-[#2A6877] focus:border-[#2A6877] block w-full sm:text-sm border-gray-300 rounded-md"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            disabled={isSaving}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 px-4 py-4 flex justify-end border-t border-gray-200">
                    <button
                      type="button"
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A6877]"
                      onClick={onClose}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="ml-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#2A6877] hover:bg-[#235A67] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A6877]"
                      onClick={handleSaveNotes}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Guardando...' : 'Guardar Notas'}
                    </button>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default AppointmentDetails;