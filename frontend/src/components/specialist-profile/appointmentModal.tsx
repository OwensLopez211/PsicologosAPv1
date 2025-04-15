import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import DaySelector from './appointmentModal/DaySelector';
import PaymentSelector from './appointmentModal/PaymentSelector';
import { 
  DaySlot, 
  formatTime, 
  formatDate 
} from './scheduleUtils';
import AppointmentService, { ExistingAppointment } from '../../services/AppointmentService';

interface AppointmentModalProps {
  psychologistId: number;
  psychologistName: string;
  onClose: () => void;
}

// Payment method interface
interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  disabled?: boolean;
  disabledMessage?: string;
}

const AppointmentModal: FC<AppointmentModalProps> = ({
  psychologistId,
  psychologistName,
  onClose
}) => {
  const [loading, setLoading] = useState(false);
  const [availableDays, setAvailableDays] = useState<DaySlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // States for payment flow
  const [selectedSlot, setSelectedSlot] = useState<{date: string, startTime: string, endTime: string} | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  
  // Available payment methods
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'credit_card',
      name: 'Tarjeta de Crédito/Débito',
      icon: 'credit-card',
      description: 'Pago seguro con tarjeta de crédito o débito',
      disabled: true,
      disabledMessage: 'Próximamente disponible'
    },
    {
      id: 'transfer',
      name: 'Transferencia Bancaria',
      icon: 'bank',
      description: 'Transferencia directa a la cuenta del especialista'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: 'paypal',
      description: 'Pago rápido y seguro con PayPal',
      disabled: true,
      disabledMessage: 'Próximamente disponible'
    }
  ];

  // Fetch available slots when modal opens
  useEffect(() => {
    if (psychologistId) {
      fetchAvailableTimeSlots();
    } else {
      setError('ID del psicólogo no disponible. Por favor, recargue la página.');
    }
  }, [psychologistId]);

  // Function to fetch available time slots using the service
  const fetchAvailableTimeSlots = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const availableDaysData = await AppointmentService.getAvailableTimeSlots(psychologistId);
      
      console.log('Available days after filtering:', availableDaysData);
      
      setAvailableDays(availableDaysData);
      
      // If we have available days, select the first one by default
      if (availableDaysData.length > 0) {
        setSelectedDate(availableDaysData[0].date);
      }
    } catch (err: any) {
      console.error('Error fetching available time slots:', err);
      
      // Handle different error types
      if (err.response) {
        if (err.response.status === 401) {
          setError('Sesión expirada. Por favor, inicie sesión nuevamente.');
        } else if (err.response.status === 404) {
          setError('No se encontró el horario del psicólogo.');
        } else {
          setError(`Error: ${err.response.data?.detail || 'No se pudieron cargar los horarios disponibles.'}`);
        }
      } else if (err.request) {
        setError('No se pudo conectar con el servidor. Verifique su conexión a internet.');
      } else {
        setError(err.message || 'Ocurrió un error al procesar su solicitud.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to handle slot selection
  const handleSlotSelection = (date: string, startTime: string, endTime: string) => {
    // Store the selected slot
    setSelectedSlot({date, startTime, endTime});
    
    // Show payment options
    setShowPaymentOptions(true);
  };
  
  // Function to handle payment method selection
  const handlePaymentMethodSelection = (methodId: string) => {
    // Only allow selection of enabled payment methods
    const method = paymentMethods.find(m => m.id === methodId);
    if (method && !method.disabled) {
      setSelectedPaymentMethod(methodId);
    }
  };
  
  // Function to process the appointment
  const handleProcessAppointment = async () => {
    if (!selectedSlot || !selectedPaymentMethod) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Get the authentication token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Debe iniciar sesión para agendar una cita.');
        setLoading(false);
        return;
      }
      
      // Create appointment data
      const appointmentData = {
        psychologist: psychologistId,
        date: selectedSlot.date,
        start_time: selectedSlot.startTime,
        end_time: selectedSlot.endTime,
        payment_method: selectedPaymentMethod,
        client_notes: '' // Add empty client notes if needed
      };
      
      // Send appointment request to the API
      await axios.post(
        '/api/appointments/',
        appointmentData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Close the modal and show success message
      onClose();
      
      // Show a success notification
      alert('¡Cita agendada con éxito! Recibirás un correo con los detalles.');
      
    } catch (err: any) {
      console.error('Error creating appointment:', err);
      
      if (err.response) {
        // Check for unique constraint error
        if (err.response.data?.non_field_errors && 
            err.response.data.non_field_errors.includes("Los campos psychologist, date, start_time deben formar un conjunto único.")) {
          setError('Este horario ya ha sido reservado. Por favor, seleccione otro horario disponible.');
          // Refresh the available slots to reflect the latest bookings
          fetchAvailableTimeSlots();
        } else {
          setError(`Error: ${err.response.data?.detail || err.response.data?.message || 
                   (err.response.data?.non_field_errors ? err.response.data.non_field_errors[0] : 'No se pudo agendar la cita.')}`);
        }
      } else if (err.request) {
        setError('No se pudo conectar con el servidor. Verifique su conexión a internet.');
      } else {
        setError('Ocurrió un error al procesar su solicitud.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Function to go back to slot selection
  const handleBackToSlots = () => {
    setShowPaymentOptions(false);
    setSelectedPaymentMethod(null);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800">
              {showPaymentOptions 
                ? "Método de pago" 
                : `Agendar consulta con ${psychologistName}`}
            </h2>
            <p className="text-gray-600 mt-1">
              {showPaymentOptions 
                ? "Seleccione un método de pago para completar su reserva" 
                : "Seleccione un día y horario disponible"}
            </p>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2A6877]"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-700 p-4 rounded-md m-6">
                {error}
              </div>
            ) : showPaymentOptions ? (
              <PaymentSelector
                paymentMethods={paymentMethods}
                selectedPaymentMethod={selectedPaymentMethod}
                onPaymentMethodSelect={handlePaymentMethodSelection}
                selectedSlot={selectedSlot}
                psychologistName={psychologistName}
                formatDate={formatDate}
                formatTime={formatTime}
              />
            ) : availableDays.length === 0 ? (
              <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md m-6">
                No hay horarios disponibles en los próximos 14 días.
              </div>
            ) : (
              <DaySelector
                availableDays={availableDays}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                onSlotSelect={handleSlotSelection}
                formatDate={formatDate}
                formatTime={formatTime}
              />
            )}
          </div>

          <div className="p-6 border-t border-gray-200 flex justify-between">
            {showPaymentOptions ? (
              <>
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  onClick={handleBackToSlots}
                >
                  Volver
                </button>
                <button
                  className={`px-6 py-2 bg-[#2A6877] text-white rounded-md transition-colors ${
                    selectedPaymentMethod ? 'hover:bg-[#235A67]' : 'opacity-50 cursor-not-allowed'
                  }`}
                  onClick={handleProcessAppointment}
                  disabled={!selectedPaymentMethod}
                >
                  Confirmar y Pagar
                </button>
              </>
            ) : (
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors ml-auto"
                onClick={onClose}
              >
                Cancelar
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AppointmentModal;