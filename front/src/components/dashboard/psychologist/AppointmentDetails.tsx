import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import axios from 'axios';

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
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Update notes when appointment changes
  useEffect(() => {
    if (appointment) {
      setNotes(appointment.psychologist_notes || '');
    }
  }, [appointment]);

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

  // Handle status change with API call
  const handleStatusChange = async (status: AppointmentStatus) => {
    if (!appointment) return;
    
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      await axios.patch(`/api/appointments/${appointment.id}/update-status/`, {
        status
      });
      
      // Call the parent component's handler if provided
      if (onStatusChange) {
        onStatusChange(appointment.id, status);
      }
      
      setSuccessMessage('Estado actualizado correctamente');
      refreshAppointments();
    } catch (err) {
      console.error('Error updating appointment status:', err);
      setError('Error al actualizar el estado. Inténtalo de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle notes save with API call
  const handleSaveNotes = async () => {
    if (!appointment) return;
    
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      await axios.patch(`/api/appointments/${appointment.id}/add-notes/`, {
        psychologist_notes: notes
      });
      
      // Call the parent component's handler if provided
      if (onNotesChange) {
        onNotesChange(appointment.id, notes);
      }
      
      setSuccessMessage('Notas guardadas correctamente');
      refreshAppointments();
    } catch (err) {
      console.error('Error saving appointment notes:', err);
      setError('Error al guardar las notas. Inténtalo de nuevo.');
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
      <Dialog as="div" className="fixed inset-0 overflow-hidden z-50" onClose={onClose}>
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

          <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex sm:pl-16">
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
                  
                  {/* Status messages */}
                  {error && (
                    <div className="mx-4 mb-4 p-2 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}
                  
                  {successMessage && (
                    <div className="mx-4 mb-4 p-2 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-600">{successMessage}</p>
                    </div>
                  )}
                  
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