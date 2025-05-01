import { useState, useEffect } from 'react';
import { AppointmentData, isFirstAppointment } from '../../services/appointmentPaymentService';
import { ClockIcon, CurrencyDollarIcon, CheckCircleIcon, ExclamationCircleIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import PaymentDetailModal from './PaymentDetailModal';
import AvatarInitials from '../common/AvatarInitials';
import { useAuth } from '../../context/AuthContext';

interface AppointmentListProps {
  appointments: AppointmentData[];
  isLoading: boolean;
  error: Error | null;
  onVerifyPayment: (appointmentId: number) => void;
  onConfirmAppointment: (appointmentId: number) => void;
}

const AppointmentList = ({ appointments, isLoading, error, onVerifyPayment, onConfirmAppointment }: AppointmentListProps) => {
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null);
  const [firstAppointments, setFirstAppointments] = useState<{[key: string]: boolean}>({});
  const [showVerifyConfirmation, setShowVerifyConfirmation] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [appointmentToAction, setAppointmentToAction] = useState<number | null>(null);
  const [, setCheckingFirstAppointment] = useState<boolean>(false);
  const { user } = useAuth();
  
  // Reemplazar el efecto existente con este nuevo que usa el backend
  useEffect(() => {
    const checkIfFirstAppointments = async () => {
      setCheckingFirstAppointment(true);
      const firstAppts: {[key: string]: boolean} = {};
      
      // Verificar cada cita usando el endpoint del backend
      for (const appointment of appointments) {
        try {
          const isFirst = await isFirstAppointment(appointment.id);
          if (isFirst) {
            firstAppts[appointment.id] = true;
            console.log(`Cita ${appointment.id} es primera cita según el backend`);
          }
        } catch (error) {
          console.error(`Error al verificar cita ${appointment.id}:`, error);
        }
      }
      
      setFirstAppointments(firstAppts);
      setCheckingFirstAppointment(false);
    };
    
    if (appointments.length > 0) {
      checkIfFirstAppointments();
    }
  }, [appointments]);

  const handleVerifyConfirmationOpen = (appointmentId: number) => {
    setAppointmentToAction(appointmentId);
    setShowVerifyConfirmation(true);
  };

  const handleConfirmationOpen = (appointmentId: number) => {
    setAppointmentToAction(appointmentId);
    setShowConfirmationDialog(true);
  };

  const handleVerifyConfirmed = () => {
    if (appointmentToAction) {
      onVerifyPayment(appointmentToAction);
      setShowVerifyConfirmation(false);
      setAppointmentToAction(null);
    }
  };

  const handleConfirmAppointmentConfirmed = () => {
    if (appointmentToAction) {
      onConfirmAppointment(appointmentToAction);
      setShowConfirmationDialog(false);
      setAppointmentToAction(null);
    }
  };

  const handleCancelDialog = () => {
    setShowVerifyConfirmation(false);
    setShowConfirmationDialog(false);
    setAppointmentToAction(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2A6877]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error al cargar las citas
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm text-center">
        <p className="text-gray-500">No hay citas pendientes de verificación.</p>
      </div>
    );
  }

  // Función para formatear fecha: 2023-12-15 -> 15 dic 2023
  const formatDate = (dateString: string) => {
    // Crear la fecha sin conversión de zona horaria
    const parts = dateString.split('-');
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // Los meses en JavaScript van de 0 a 11
    const day = parseInt(parts[2]);
    
    const date = new Date(year, month, day);
    
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC' // Usar UTC para evitar cambios por zona horaria
    });
  };

  // Función para formatear hora: 14:00:00 -> 14:00
  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  // Función para obtener el color del badge según el estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAYMENT_UPLOADED':
        return 'bg-yellow-100 text-yellow-800';
      case 'PAYMENT_VERIFIED':
        return 'bg-green-100 text-green-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="overflow-hidden bg-white shadow-sm rounded-lg">
        <ul className="divide-y divide-gray-200">
          {appointments.map((appointment) => {
            const isFirstAppointment = firstAppointments[appointment.id] || false;
            const isPsychologist = user?.user_type === 'psychologist';
            const canVerify = !(isPsychologist && isFirstAppointment);
            
            // Añadir un pequeño log para depuración
            console.log(`Renderizando cita ${appointment.id}, es primera: ${isFirstAppointment}`);
            
            return (
              <li key={appointment.id} className="group hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {appointment.client_data?.profile_image ? (
                          <img
                            className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                            src={appointment.client_data.profile_image}
                            alt={appointment.client_data?.name || 'Imagen del cliente'}
                          />
                        ) : (
                          <AvatarInitials 
                            name={appointment.client_data?.name || 'Cliente'} 
                            className="border-2 border-gray-200" 
                          />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-[#2A6877]">
                            {appointment.client_data?.name}
                          </p>
                          {isFirstAppointment && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              Primera cita
                            </span>
                          )}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <ClockIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          <span>
                            {formatDate(appointment.date)} • {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status_display}
                      </span>
                      <div className="mt-2 flex items-center text-sm text-gray-700">
                        <CurrencyDollarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-500" />
                        <span className="font-medium">${appointment.payment_amount ? appointment.payment_amount.toLocaleString() : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 sm:flex sm:justify-between">
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p className="line-clamp-1">
                        {appointment.client_notes || 'Sin notas del cliente'}
                      </p>
                    </div>
                    <div className="mt-2 flex space-x-2 sm:mt-0">
                      <button
                        onClick={() => setSelectedAppointment(appointment)}
                        className="inline-flex items-center px-3 py-1.5 border border-[#2A6877] text-xs font-medium rounded-md text-[#2A6877] bg-white hover:bg-[#2A6877]/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A6877]"
                      >
                        Ver detalles
                      </button>
                      
                      {appointment.status === 'PAYMENT_UPLOADED' && canVerify && (
                        <button
                          onClick={() => handleVerifyConfirmationOpen(appointment.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-[#2A6877] hover:bg-[#2A6877]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A6877]"
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Verificar Pago
                        </button>
                      )}
                      
                      {appointment.status === 'PAYMENT_UPLOADED' && isPsychologist && isFirstAppointment && (
                        <div className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-500">
                          <LockClosedIcon className="h-4 w-4 mr-1" />
                          Requiere validación de admin
                        </div>
                      )}
                      
                      {appointment.status === 'PAYMENT_VERIFIED' && (
                        <button
                          onClick={() => handleConfirmationOpen(appointment.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Confirmar Cita
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {selectedAppointment && (
        <PaymentDetailModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onVerifyPayment={() => {
            handleVerifyConfirmationOpen(selectedAppointment.id);
            setSelectedAppointment(null);
          }}
          onConfirmAppointment={() => {
            handleConfirmationOpen(selectedAppointment.id);
            setSelectedAppointment(null);
          }}
          isFirstAppointment={firstAppointments[selectedAppointment.id] || false}
        />
      )}

      {/* Modal de confirmación para verificar pago */}
      {showVerifyConfirmation && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                  <ExclamationCircleIcon className="h-6 w-6 text-yellow-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Confirmar verificación de pago</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      ¿Estás seguro que deseas verificar este pago? Esta acción confirmará que has revisado y validado el comprobante de pago.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#2A6877] text-base font-medium text-white hover:bg-[#2A6877]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A6877] sm:col-start-2 sm:text-sm"
                  onClick={handleVerifyConfirmed}
                >
                  Sí, verificar pago
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A6877] sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={handleCancelDialog}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para confirmar cita */}
      {showConfirmationDialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Confirmar cita</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      ¿Estás seguro que deseas confirmar esta cita? Se notificará al cliente y al psicólogo que la cita ha sido confirmada.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:col-start-2 sm:text-sm"
                  onClick={handleConfirmAppointmentConfirmed}
                >
                  Sí, confirmar cita
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={handleCancelDialog}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentList; 
