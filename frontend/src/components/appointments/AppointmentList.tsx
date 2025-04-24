import { useState } from 'react';
import { AppointmentData } from '../../services/appointmentPaymentService';
import { ClockIcon, CurrencyDollarIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import PaymentDetailModal from './PaymentDetailModal';

interface AppointmentListProps {
  appointments: AppointmentData[];
  isLoading: boolean;
  error: Error | null;
  onVerifyPayment: (appointmentId: number) => void;
  onConfirmAppointment: (appointmentId: number) => void;
}

const AppointmentList = ({ appointments, isLoading, error, onVerifyPayment, onConfirmAppointment }: AppointmentListProps) => {
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null);

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
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
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
          {appointments.map((appointment) => (
            <li key={appointment.id} className="group hover:bg-gray-50">
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <img
                        className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                        src={appointment.client_data.profile_image || 'https://via.placeholder.com/150'}
                        alt={appointment.client_data.name}
                      />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-[#2A6877]">
                        {appointment.client_data.name}
                      </p>
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
                      <span className="font-medium">${appointment.payment_amount.toLocaleString()}</span>
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
                    
                    {appointment.status === 'PAYMENT_UPLOADED' && (
                      <button
                        onClick={() => onVerifyPayment(appointment.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-[#2A6877] hover:bg-[#2A6877]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A6877]"
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Verificar Pago
                      </button>
                    )}
                    
                    {appointment.status === 'PAYMENT_VERIFIED' && (
                      <button
                        onClick={() => onConfirmAppointment(appointment.id)}
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
          ))}
        </ul>
      </div>

      {selectedAppointment && (
        <PaymentDetailModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onVerifyPayment={() => {
            onVerifyPayment(selectedAppointment.id);
            setSelectedAppointment(null);
          }}
          onConfirmAppointment={() => {
            onConfirmAppointment(selectedAppointment.id);
            setSelectedAppointment(null);
          }}
        />
      )}
    </div>
  );
};

export default AppointmentList; 