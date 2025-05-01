import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import DaySelector from './appointmentModal/DaySelector';
import PaymentSelector from './appointmentModal/PaymentSelector';
import PaymentConfirmationModal from './appointmentModal/PaymentConfirmationModal';
import { 
  DaySlot, 
  formatTime, 
  formatDate 
} from './scheduleUtils';
import AppointmentService from '../../services/appointmentService';
import { toast } from 'react-hot-toast';

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
  
  // Estado para el precio de la sesión
  const [sessionPrice, setSessionPrice] = useState<number | null>(null);
  
  // Estado para citas pendientes de pago
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0);
  const [pendingPaymentsChecked, setPendingPaymentsChecked] = useState(false);
  const MAX_PENDING_PAYMENTS = 2; // Máximo número de citas pendientes permitidas
  
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
      fetchSessionPrice();
      checkPendingPayments();
    } else {
      setError('ID del psicólogo no disponible. Por favor, recargue la página.');
    }
  }, [psychologistId]);
  
  // Función para verificar cuántas citas pendientes de pago tiene el cliente
  const checkPendingPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('Usuario no autenticado, no se verifican pagos pendientes');
        return;
      }
      
      const response = await axios.get('/api/appointments/pending-payments-count/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.count !== undefined) {
        setPendingPaymentsCount(response.data.count);
      }
      
      setPendingPaymentsChecked(true);
    } catch (error) {
      console.error('Error al verificar pagos pendientes:', error);
    }
  };

  // Función para obtener el precio de la sesión
  const fetchSessionPrice = async () => {
    try {
      const response = await axios.get(`/api/pricing/psychologist-prices/psychologist/${psychologistId}/`);
      if (response.data && response.data.price !== undefined) {
        setSessionPrice(response.data.price);
      }
    } catch (error) {
      console.error('Error al obtener el precio de la sesión:', error);
    }
  };

  // Function to fetch available time slots using the service
  const fetchAvailableTimeSlots = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Usar el servicio actualizado para obtener los horarios disponibles
      const availableDaysData = await AppointmentService.getAvailableTimeSlots(psychologistId);
      
      console.log('Días disponibles después del filtrado:', availableDaysData);
      
      // Verificar si el día 30 de abril está en los días disponibles
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      console.log('Fecha de mañana:', tomorrowStr);
      
      // Si es 29 de abril, verificar específicamente si falta el 30 de abril
      if (today.getDate() === 29 && today.getMonth() === 3) { // Abril es el mes 3 (0-indexado)
        const april30 = '2025-04-30'; // Asumiendo que estamos en 2025 basado en fechas previas
        console.log('Verificando específicamente si está disponible el 30 de abril');
        
        const has30April = availableDaysData.some(day => day.date === april30);
        console.log('¿30 de abril disponible?', has30April);
        
        // Si no está el 30 de abril pero debería estar (es un día laboral), lo agregamos manualmente
        if (!has30April) {
          console.log('Intentando recuperar manualmente el día 30 de abril');
          
          try {
            // Obtener configuración actualizada que incluya el 30 de abril
            const updatedData = await AppointmentService.getAvailableTimeSlots(
              psychologistId,
              true // Forzar recarga ignorando caché
            );
            
            if (updatedData.length > availableDaysData.length) {
              console.log('Se obtuvo una configuración actualizada con más días disponibles');
              setAvailableDays(updatedData);
              
              // Si tenemos días disponibles, seleccionar el primero por defecto
              if (updatedData.length > 0) {
                setSelectedDate(updatedData[0].date);
              }
              setLoading(false);
              return;
            }
          } catch (innerErr) {
            console.error('Error al intentar recuperar el 30 de abril:', innerErr);
          }
        }
      }
      
      setAvailableDays(availableDaysData);
      
      // Si tenemos días disponibles, seleccionar el primero por defecto
      if (availableDaysData.length > 0) {
        setSelectedDate(availableDaysData[0].date);
      } else {
        setError('No hay horarios disponibles para este psicólogo en los próximos días.');
      }
    } catch (err: any) {
      console.error('Error al obtener los horarios disponibles:', err);
      
      // Manejar diferentes tipos de errores
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
    // Verificar si tiene demasiadas citas pendientes de pago
    if (pendingPaymentsCount >= MAX_PENDING_PAYMENTS) {
      toast.error(
        `Tienes ${pendingPaymentsCount} citas pendientes de pago. Por favor, completa el pago de tus citas actuales antes de agendar una nueva.`,
        { duration: 6000 }
      );
      return;
    }
    
    // Store the selected slot
    setSelectedSlot({date, startTime, endTime});
    
    // Show payment options
    setShowPaymentOptions(true);
    
    // Mostrar advertencia si tiene al menos una cita pendiente
    if (pendingPaymentsCount > 0) {
      toast(
        `Tienes ${pendingPaymentsCount} ${pendingPaymentsCount === 1 ? 'cita pendiente' : 'citas pendientes'} de pago. Recuerda completar todos los pagos para mantener tus reservas.`,
        { 
          duration: 5000,
          icon: '⚠️',
          className: 'bg-yellow-100 text-yellow-800 border border-yellow-300'
        }
      );
    }
  };
  
  // Function to handle payment method selection
  const handlePaymentMethodSelection = (methodId: string) => {
    // Only allow selection of enabled payment methods
    const method = paymentMethods.find(m => m.id === methodId);
    if (method && !method.disabled) {
      setSelectedPaymentMethod(methodId);
    }
  };
  
  // Estados para el modal de confirmación de pago
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState<any>(null);
  const [bankInfo, setBankInfo] = useState<any>(null);
  const [adminBankInfo, setAdminBankInfo] = useState<any>(null);
  const [isFirstAppointment, setIsFirstAppointment] = useState(false);
  
  // Function to process the appointment
  const handleProcessAppointment = async () => {
    if (!selectedSlot || !selectedPaymentMethod) {
      return;
    }
    
    // Verificar nuevamente las citas pendientes de pago
    await checkPendingPayments();
    if (pendingPaymentsCount >= MAX_PENDING_PAYMENTS) {
      toast.error(
        `Tienes ${pendingPaymentsCount} citas pendientes de pago. Por favor, completa el pago de tus citas actuales antes de agendar una nueva.`,
        { duration: 6000 }
      );
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
      
      // Asegurarnos de que la fecha se envía correctamente sin modificaciones por zona horaria
      console.log('Selected date before sending:', selectedSlot.date);
      
      // Create appointment data
      const appointmentData = {
        psychologist: psychologistId,
        date: selectedSlot.date, // Usar la fecha exactamente como viene del selector
        start_time: selectedSlot.startTime,
        end_time: selectedSlot.endTime,
        payment_method: selectedPaymentMethod,
        client_notes: '' // Add empty client notes if needed
      };
      
      console.log('Sending appointment data:', appointmentData);
      
      // Send appointment request to the API
      const response = await axios.post(
        '/api/appointments/',
        appointmentData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Guardar la cita creada
      setCreatedAppointment(response.data);
      
      // Verificar si es la primera cita entre este psicólogo y cliente
      setIsFirstAppointment(response.data.is_first_appointment || false);
      
      // Obtener información bancaria del psicólogo
      try {
        const psychologistResponse = await axios.get(
          `/api/profiles/psychologist-profiles/${psychologistId}/`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Extraer información bancaria
        const psychData = psychologistResponse.data;
        setBankInfo({
          bankName: psychData.bank_name || 'No especificado',
          accountNumber: psychData.bank_account_number || 'No especificado',
          accountType: psychData.bank_account_type_display || 'No especificado',
          accountOwner: psychData.bank_account_owner || psychData.first_name + ' ' + psychData.last_name,
          ownerRut: psychData.bank_account_owner_rut || psychData.rut || 'No especificado',
          ownerEmail: psychData.bank_account_owner_email || psychData.email || 'No especificado'
        });
        
        // Si es la primera cita, obtener información bancaria del administrador
        if (response.data.is_first_appointment) {
          try {
            const adminResponse = await axios.get(
              '/api/profiles/admin-profiles/me/bank-info/',
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            
            const adminData = adminResponse.data;
            setAdminBankInfo({
              bankName: adminData.bank_name || 'No especificado',
              accountNumber: adminData.bank_account_number || 'No especificado',
              accountType: adminData.bank_account_type_display || 'No especificado',
              accountOwner: adminData.bank_account_owner || 'Administración',
              ownerRut: adminData.bank_account_owner_rut || 'No especificado',
              ownerEmail: adminData.bank_account_owner_email || 'No especificado'
            });
          } catch (err) {
            console.error('Error obteniendo información bancaria del administrador:', err);
            // Si falla, usamos información predeterminada
            setAdminBankInfo({
              bankName: 'Banco Estado',
              accountNumber: '00000000000',
              accountType: 'Cuenta Corriente',
              accountOwner: 'Administración PsicologosAPP',
              ownerRut: '00.000.000-0',
              ownerEmail: 'admin@psicologosapp.cl'
            });
          }
        }
      } catch (err) {
        console.error('Error obteniendo información bancaria:', err);
        // Si falla, continuamos con información bancaria vacía
        setBankInfo({
          bankName: 'No disponible',
          accountNumber: 'No disponible',
          accountType: 'No disponible',
          accountOwner: 'No disponible',
          ownerRut: 'No disponible',
          ownerEmail: 'No disponible'
        });
      }
      
      // Actualizar contador de citas pendientes
      setPendingPaymentsCount(prevCount => prevCount + 1);
      
      // Mostrar el modal de confirmación de pago
      setShowPaymentConfirmation(true);
      
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
  
  // Función para cerrar el modal de confirmación de pago
  const handleClosePaymentConfirmation = () => {
    setShowPaymentConfirmation(false);
    onClose(); // Cerrar el modal principal
  };
  
  // Function to go back to slot selection
  const handleBackToSlots = () => {
    setShowPaymentOptions(false);
    setSelectedPaymentMethod(null);
  };

  return (
    <AnimatePresence>
      {/* Modal principal */}
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
            ) : pendingPaymentsChecked && pendingPaymentsCount >= MAX_PENDING_PAYMENTS ? (
              <div className="bg-red-50 text-red-700 p-4 rounded-md m-6">
                <div className="flex items-start">
                  <svg className="h-5 w-5 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="font-medium">Tienes demasiadas citas pendientes de pago</h3>
                    <p className="mt-1">Por favor, completa el pago de tus citas actuales antes de agendar una nueva cita. Puedes hacerlo desde la sección "Mis Citas" en tu panel de usuario.</p>
                    <button 
                      className="mt-3 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      onClick={() => window.location.href = '/dashboard/appointments'}
                    >
                      Ir a Mis Citas
                    </button>
                  </div>
                </div>
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
                sessionPrice={sessionPrice !== null ? sessionPrice : undefined}
              />
            ) : availableDays.length === 0 ? (
              <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md m-6">
                No hay horarios disponibles en los próximos 30 días.
              </div>
            ) : (
              <>
                {pendingPaymentsChecked && pendingPaymentsCount > 0 && (
                  <div className="bg-yellow-50 p-4 rounded-md m-6 border border-yellow-200">
                    <div className="flex items-start">
                      <svg className="h-5 w-5 mr-2 mt-0.5 text-yellow-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <h3 className="font-medium text-yellow-800">Tienes {pendingPaymentsCount} {pendingPaymentsCount === 1 ? 'cita pendiente' : 'citas pendientes'} de pago</h3>
                        <p className="mt-1 text-yellow-700">Te recordamos que es importante mantener tus citas al día para garantizar tu atención. Puedes completar tus pagos desde la sección "Mis Citas".</p>
                      </div>
                    </div>
                  </div>
                )}
              <DaySelector
                availableDays={availableDays}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                onSlotSelect={handleSlotSelection}
                formatDate={formatDate}
                formatTime={formatTime}
              />
              </>
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
      
      {/* Modal de confirmación de pago */}
      {showPaymentConfirmation && createdAppointment && (
        <PaymentConfirmationModal
          appointment={createdAppointment}
          bankInfo={bankInfo}
          adminBankInfo={adminBankInfo}
          psychologistName={psychologistName}
          onClose={handleClosePaymentConfirmation}
          formatDate={formatDate}
          formatTime={formatTime}
          isFirstAppointment={isFirstAppointment}
          sessionPrice={sessionPrice !== null ? sessionPrice : undefined}
        />
      )}
    </AnimatePresence>
  );
};

export default AppointmentModal;