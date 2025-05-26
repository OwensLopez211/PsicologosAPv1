import { Fragment, useState, useEffect, useLayoutEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../../../context/AuthContext';
import toastService from '../../../services/toastService';
import { updateAppointmentStatus, saveAppointmentNotes } from '../../../services/appointmentService';

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

// Add type for confirmation state
interface ConfirmationState {
  isOpen: boolean;
  statusToChangeTo: AppointmentStatus | null;
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
  const { token, setToken, forceTokenSync } = useAuth();
  const [, setTokenSynced] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    isOpen: false,
    statusToChangeTo: null,
  });

  // Asegurar que el token esté siempre disponible - enfoque agresivo para producción
  useLayoutEffect(() => {
    if (isOpen) {
      if (!token) {
        // Si no hay token en el contexto, intentar forzar la sincronización
        console.log('AppointmentDetails: No hay token en contexto, forzando sincronización...');
        
        // Llamar a forceTokenSync pero no usar su valor de retorno directamente
        forceTokenSync();
        
        // Verificar si después de la llamada tenemos token
        const tokenAvailable = !!localStorage.getItem('token');
        setTokenSynced(tokenAvailable);
        
        if (!tokenAvailable) {
          // Si no se pudo sincronizar, mostrar error
          console.error('⚠️ AppointmentDetails: No se pudo sincronizar el token');
          toastService.error('Error de autenticación. Por favor, refresca la página o inicia sesión nuevamente.');
        }
      } else {
        setTokenSynced(true);
      }
    }
  }, [isOpen, token, forceTokenSync]);

  // Función para obtener el token más actualizado para operaciones
  const getAuthToken = (): string | null => {
    // Intentar obtener el token del contexto
    if (token) return token;
    
    // Si no hay token en el contexto, intentar obtenerlo del localStorage
    const localToken = localStorage.getItem('token');
    if (localToken) {
      // Actualizar el contexto con el token encontrado
      setToken(localToken);
      return localToken;
    }
    
    // No hay token disponible
    return null;
  };

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
      getAuthToken();
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

  // Map backend status to display buttons
  const canChangeToStatus = (status: AppointmentStatus): boolean => {
    // Si no hay cita, no se puede cambiar el estado
    if (!appointment) return false;
    
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

  // Función específica para cambiar estado usando token directo y el servicio dedicado
  const changeAppointmentStatus = async (status: AppointmentStatus) => {
    if (!appointment) return;

    // Abrir modal de confirmación
    setConfirmation({
      isOpen: true,
      statusToChangeTo: status,
    });
  };

  // Función que se llama al confirmar el cambio de estado
  const handleConfirmStatusChange = async () => {
    if (!appointment || !confirmation.statusToChangeTo) return;

    // Cerrar modal de confirmación
    setConfirmation({ isOpen: false, statusToChangeTo: null });

    // Obtener token actualizado
    const currentToken = getAuthToken();
    if (!currentToken) {
      toastService.error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
      return;
    }
    
    setIsSaving(true);
    toastService.loading(`Cambiando estado a: ${getStatusDisplay(confirmation.statusToChangeTo)}...`);
    
    try {
      console.log(`⚠️ Cambiando estado de cita ${appointment.id} a ${confirmation.statusToChangeTo} con token directo`);
      
      // Usar el servicio dedicado con token explícito
      await updateAppointmentStatus(
        appointment.id,
        confirmation.statusToChangeTo,
        currentToken
      );
      
      // Actualizar el estado localmente para evitar recargar
      if (onStatusChange) {
        onStatusChange(appointment.id, confirmation.statusToChangeTo);
      }
      
      // Refrescar los datos y cerrar el modal principal
      refreshAppointments();
      onClose(); // Cerrar el modal principal después de confirmar
      
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      // El servicio ya muestra los mensajes de error
    } finally {
      setIsSaving(false);
    }
  };

  // Función para cancelar el cambio de estado
  const handleCancelStatusChange = () => {
    setConfirmation({ isOpen: false, statusToChangeTo: null });
  };

  // Handle notes save with API call
  const handleSaveNotes = async () => {
    if (!appointment) return;
    
    // Obtener token actualizado
    const currentToken = getAuthToken();
    if (!currentToken) {
      toastService.error('No hay token de autenticación disponible. Por favor, inicia sesión nuevamente.');
      return;
    }
    
    setIsSaving(true);
    toastService.loading('Guardando notas...');
    
    try {
      console.log(`⚠️ Guardando notas de cita ${appointment.id} con token directo`);
      
      // Usar el servicio dedicado con token explícito
      await saveAppointmentNotes(
        appointment.id,
        notes,
        currentToken
      );
      
      // Call the parent component's handler if provided
      if (onNotesChange) {
        onNotesChange(appointment.id, notes);
      }
      
      // Refrescar citas
      refreshAppointments();
      
    } catch (error) {
      console.error('Error guardando notas:', error);
      // El servicio ya muestra los mensajes de error
    } finally {
      setIsSaving(false);
    }
  };

  if (!appointment) return null;

  return (
    <>
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
                                  onClick={() => changeAppointmentStatus('CONFIRMED')}
                                  disabled={isSaving}
                                  className={`px-3 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  Confirmada
                                </button>
                              )}
                              
                              {canChangeToStatus('COMPLETED') && (
                                <button
                                  onClick={() => changeAppointmentStatus('COMPLETED')}
                                  disabled={isSaving}
                                  className={`px-3 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  Completada
                                </button>
                              )}
                              
                              {canChangeToStatus('CANCELLED') && (
                                <button
                                  onClick={() => changeAppointmentStatus('CANCELLED')}
                                  disabled={isSaving}
                                  className={`px-3 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  Cancelada
                                </button>
                              )}
                              
                              {canChangeToStatus('NO_SHOW') && (
                                <button
                                  onClick={() => changeAppointmentStatus('NO_SHOW')}
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

      {/* Confirmation Modal */}
      <Transition.Root show={confirmation.isOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={handleCancelStatusChange} style={{ zIndex: 100000 }}>
          <div className="flex items-center justify-center min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
            </Transition.Child>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-sm p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Confirmar cambio de estado
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    ¿Estás seguro que deseas cambiar el estado de la cita a "{getStatusDisplay(confirmation.statusToChangeTo || 'COMPLETED')}"?
                  </p>
                </div>

                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2A6877]"
                    onClick={handleCancelStatusChange}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-[#2A6877] border border-transparent rounded-md hover:bg-[#1F5061] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2A6877]"
                    onClick={handleConfirmStatusChange}
                    disabled={isSaving}
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};

export default AppointmentDetails;