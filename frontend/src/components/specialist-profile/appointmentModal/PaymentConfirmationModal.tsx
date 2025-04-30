import { FC, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface BankInfo {
  bankName: string;
  accountNumber: string;
  accountType: string;
  accountOwner: string;
  ownerRut: string;
  ownerEmail: string;
  isAdmin?: boolean;
}

interface PaymentConfirmationModalProps {
  appointment: any;
  bankInfo: BankInfo;
  adminBankInfo?: BankInfo; // Información bancaria del administrador
  psychologistName: string;
  onClose: () => void;
  formatDate: (dateStr: string) => string;
  formatTime: (timeStr: string) => string;
  isFirstAppointment: boolean;
  sessionPrice?: number; // Añadido precio de la sesión
}

const PaymentConfirmationModal: FC<PaymentConfirmationModalProps> = ({
  appointment,
  bankInfo,
  adminBankInfo,
  psychologistName,
  onClose,
  formatDate,
  formatTime,
  isFirstAppointment,
  sessionPrice
}) => {
  const navigate = useNavigate();
  const [hasConfirmedAppointments, setHasConfirmedAppointments] = useState(false);
  const [checkingAppointments, setCheckingAppointments] = useState(true);
  const [displayBankInfo, setDisplayBankInfo] = useState<BankInfo | null>(null);
  
  // Función personalizada para formatear la fecha correctamente
  const correctFormatDate = (dateStr: string) => {
    // Crear una fecha a partir del string pero sin conversión de zona horaria
    const date = new Date(dateStr + 'T12:00:00');
    
    // Obtener el día correcto
    const day = date.getDate();
    const month = date.toLocaleString('es-CL', { month: 'long' });
    const year = date.getFullYear();
    
    // Formatear la fecha correctamente
    return `${day} de ${month} de ${year}`;
  };
  
  // Formatear el precio para mostrarlo en pesos chilenos
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(price);
  };
  
  // Verificar si existen citas completadas con este psicólogo
  useEffect(() => {
    const checkConfirmedAppointments = async () => {
      try {
        setCheckingAppointments(true);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No se encontró token de autenticación');
        }
        
        // Obtener el ID del psicólogo de la cita actual
        const psychologistId = appointment.psychologist;
        
        // Consultar si hay citas completadas con este psicólogo
        // Nota: Ajustamos la URL para usar el endpoint correcto
        const response = await axios.get(
          `/api/appointments/has-confirmed-appointments/${psychologistId}/`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Actualizar el estado según la respuesta
        const hasConfirmed = response.data.has_confirmed_appointments || false;
        setHasConfirmedAppointments(hasConfirmed);
        
        // Actualizar la información bancaria a mostrar inmediatamente después de verificar las citas
        updateBankInfoDisplay(hasConfirmed);
      } catch (err) {
        console.error('Error verificando citas completadas:', err);
        // Si hay un error, asumimos que no hay citas completadas
        setHasConfirmedAppointments(false);
        // Y mostramos los datos del administrador
        updateBankInfoDisplay(false);
      } finally {
        setCheckingAppointments(false);
      }
    };
    
    // Función para actualizar la información bancaria a mostrar
    const updateBankInfoDisplay = (hasConfirmed: boolean) => {
      // Si no hay citas completadas o es la primera cita, mostrar datos del admin
      if (!hasConfirmed || isFirstAppointment) {
        if (adminBankInfo) {
          setDisplayBankInfo(adminBankInfo);
        } else {
          // Si no tenemos los datos del admin, intentamos obtenerlos
          fetchAdminBankInfo();
        }
      } else {
        // Si hay citas completadas, mostrar datos del psicólogo
        setDisplayBankInfo(bankInfo);
      }
    };
    
    // Función para obtener la información bancaria del administrador
    const fetchAdminBankInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No se encontró token de autenticación');
        }
        
        const response = await axios.get(
          '/api/profiles/bank-info/',
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        const adminData = response.data;
        const adminBankData = {
          bankName: adminData.bank_name || 'No especificado',
          accountNumber: adminData.bank_account_number || 'No especificado',
          accountType: adminData.bank_account_type || 'No especificado',
          accountOwner: adminData.bank_account_owner || 'Administración',
          ownerRut: adminData.bank_account_owner_rut || 'No especificado',
          ownerEmail: adminData.bank_account_owner_email || 'No especificado',
          isAdmin: true
        };
        
        // Actualizar el estado con la información bancaria del admin
        setDisplayBankInfo(adminBankData);
      } catch (err) {
        console.error('Error obteniendo información bancaria del administrador:', err);
        // Si hay un error, usamos la información del psicólogo como fallback
        setDisplayBankInfo(bankInfo);
      }
    };
    
    checkConfirmedAppointments();
  }, [appointment, adminBankInfo, bankInfo, isFirstAppointment]);
  
  // Efecto para establecer un valor predeterminado para displayBankInfo si no se ha establecido
  useEffect(() => {
    if (!displayBankInfo && !checkingAppointments) {
      // Si no tenemos información bancaria para mostrar después de verificar,
      // usamos la información del administrador si está disponible, o la del psicólogo como fallback
      if ((!hasConfirmedAppointments || isFirstAppointment) && adminBankInfo) {
        setDisplayBankInfo(adminBankInfo);
      } else {
        setDisplayBankInfo(bankInfo);
      }
    }
  }, [displayBankInfo, checkingAppointments, hasConfirmedAppointments, isFirstAppointment, adminBankInfo, bankInfo]);
  
  // Función para redireccionar a la página de citas
  const handleGoToAppointments = () => {
    navigate('/dashboard/appointments');
    onClose();
  };
  
  // Determinar qué información bancaria mostrar para el renderizado
  const bankInfoToDisplay = displayBankInfo || ((!hasConfirmedAppointments || isFirstAppointment) && adminBankInfo ? adminBankInfo : bankInfo);
  
  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800">
            Información de Pago
          </h2>
          <p className="text-gray-600 mt-1">
            Complete su pago y luego suba el comprobante desde su panel de citas
          </p>
        </div>
        
        <div className="p-6">
          {/* Resumen de la cita */}
          <div className="mb-6 bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Resumen de la cita</h3>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Fecha:</span> {correctFormatDate(appointment.date)}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Hora:</span> {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Especialista:</span> {psychologistName}
            </p>
            {sessionPrice && (
              <p className="text-sm text-gray-700">
                <span className="font-medium">Valor:</span> {formatPrice(sessionPrice)}
              </p>
            )}
          </div>
          
          {/* Información sobre primera cita o sin citas completadas */}
          {(!hasConfirmedAppointments || isFirstAppointment) && (
            <div className="mb-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="h-5 w-5 text-yellow-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Información importante</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    {isFirstAppointment ? (
                      <>
                        <p>Esta es su primera cita con este especialista. Por políticas de la plataforma, el pago de esta primera sesión debe realizarse a la cuenta de administración que se muestra a continuación.</p>
                        <p className="mt-2">Para futuras sesiones, los pagos se realizarán directamente a la cuenta del especialista.</p>
                      </>
                    ) : (
                      <p>Como no tiene citas completadas con este especialista, el pago debe realizarse a la cuenta de administración que se muestra a continuación.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Información bancaria */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">
              Datos para transferencia 
              {(!hasConfirmedAppointments || isFirstAppointment) ? ' (Administración)' : ' (Especialista)'}
            </h3>
            {checkingAppointments ? (
              <div className="flex justify-center items-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2A6877]"></div>
                <span className="ml-3 text-gray-600">Verificando información...</span>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-500">Banco</p>
                    <p className="font-medium">{bankInfoToDisplay.bankName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tipo de cuenta</p>
                    <p className="font-medium">{bankInfoToDisplay.accountType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Número de cuenta</p>
                    <p className="font-medium">{bankInfoToDisplay.accountNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Titular</p>
                    <p className="font-medium">{bankInfoToDisplay.accountOwner}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">RUT</p>
                    <p className="font-medium">{bankInfoToDisplay.ownerRut}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{bankInfoToDisplay.ownerEmail}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Instrucciones para subir comprobante */}
          <div className="mb-6 bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Instrucciones para completar el pago</h3>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
              <li>Realice la transferencia a la cuenta bancaria indicada arriba.</li>
              <li>Guarde el comprobante de pago (captura de pantalla o PDF).</li>
              <li>Vaya a su panel de citas para subir el comprobante.</li>
              <li>Una vez verificado el pago, su cita quedará confirmada.</li>
            </ol>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-between">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            onClick={onClose}
          >
            Cerrar
          </button>
          <button
            className="px-6 py-2 bg-[#2A6877] text-white rounded-md hover:bg-[#235A67] transition-colors flex items-center"
            onClick={handleGoToAppointments}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Ir a Mis Citas
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PaymentConfirmationModal;