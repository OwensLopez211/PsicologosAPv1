import { useState, useEffect } from 'react';
import { XMarkIcon, CheckCircleIcon, ArrowDownTrayIcon, LockClosedIcon, InformationCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { AppointmentData, isFirstAppointment } from '../../services/appointmentPaymentService';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import AvatarInitials from '../common/AvatarInitials';
import { useAuth } from '../../context/AuthContext';

interface PaymentDetailModalProps {
  appointment: AppointmentData;
  onClose: () => void;
  onVerifyPayment: () => void;
  onConfirmAppointment: () => void;
  isFirstAppointment?: boolean;
}

const PaymentDetailModal = ({ 
  appointment, 
  onClose, 
  onVerifyPayment, 
  onConfirmAppointment,
  isFirstAppointment: propIsFirst = false
}: PaymentDetailModalProps) => {
  const [notes, setNotes] = useState<string>('');
  const [imageError, setImageError] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showVerifyConfirmation, setShowVerifyConfirmation] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [isFirstApp, setIsFirstApp] = useState<boolean>(propIsFirst);
  const { user } = useAuth();
  const isPsychologist = user?.user_type === 'psychologist';
  const canVerify = !(isPsychologist && isFirstApp);

  // Función para formatear fecha: 2023-12-15 -> 15 dic 2023
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    // Para fechas con formato YYYY-MM-DD
    if (dateString.includes('-') && dateString.length <= 10) {
      const parts = dateString.split('-');
      if (parts.length !== 3) return dateString;
      
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const day = parseInt(parts[2]);
      
      const date = new Date(Date.UTC(year, month, day));
      
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC'
      });
    }
    
    // Para fechas en otros formatos o con hora incluida
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

  // Cargar la vista previa del comprobante al montar el componente
  useEffect(() => {
    if (appointment.id && appointment.payment_proof_url) {
      loadPreview();
    }
  }, [appointment.id, appointment.payment_proof_url]);

  // Efecto para verificar si es primera cita cuando se monta el componente
  useEffect(() => {
    const checkIfFirstAppointment = async () => {
      try {
        if (appointment.id) {
          const isFirst = await isFirstAppointment(appointment.id);
          setIsFirstApp(isFirst);
        }
      } catch (error) {
        console.error('Error al verificar si es primera cita:', error);
        // Si hay error, asumimos que es primera cita para evitar que psicólogos verifiquen
        setIsFirstApp(true);
      }
    };
    
    // Si no se proporcionó valor desde props, verificar con el backend
    if (!propIsFirst) {
      checkIfFirstAppointment();
    }
  }, [appointment.id, propIsFirst]);

  // Función para cargar la vista previa del comprobante
  const loadPreview = async () => {
    if (!appointment.id) return;
    
    setLoading(true);
    setImageError(false);
    
    try {
      // Obtener el token de autenticación
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }
      
      // Usar el servicio api en lugar de fetch para aprovechar la configuración de baseURL
      try {
        const response = await api.get(`/appointments/${appointment.id}/download-payment-proof/`, {
          params: { view: true },
          responseType: 'blob'
        });
        
        // Crear una URL temporal para el blob
        const url = window.URL.createObjectURL(response.data);
        setPreviewUrl(url);
      } catch (apiError) {
        console.error('Error en la llamada API:', apiError);
        // Intentar con fetch como alternativa
        const response = await fetch(`/appointments/${appointment.id}/download-payment-proof/?view=true`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error al cargar la vista previa: ${response.status} ${response.statusText}`);
      }
      
      // Obtener el blob de la respuesta
      const blob = await response.blob();
      
      // Crear una URL temporal para el blob
      const url = window.URL.createObjectURL(blob);
      setPreviewUrl(url);
      }
    } catch (error) {
      console.error('Error al cargar la vista previa:', error);
      setImageError(true);
    } finally {
      setLoading(false);
    }
  };

  // Función para descargar el comprobante de pago
  const handleDownload = async () => {
    if (!appointment.id) return;
    
    try {
      // Mostrar cargando
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 bg-[#2A6877] text-white px-4 py-2 rounded-md shadow-lg z-50';
      toast.textContent = 'Descargando comprobante...';
      document.body.appendChild(toast);
      
      try {
        // Usar el servicio api para descargar
        const response = await api.get(`/appointments/${appointment.id}/download-payment-proof/`, {
          responseType: 'blob'
        });
        
        // Crear un enlace de descarga temporal
        const url = window.URL.createObjectURL(response.data);
        const a = document.createElement('a');
        
        // Obtener el nombre del archivo de los headers o usar uno predeterminado
        let filename = 'comprobante.pdf';
        const contentDisposition = response.headers['content-disposition'];
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1];
          }
        }
        
        a.href = url;
        a.download = filename;
        a.click();
        
        // Liberar recursos
        window.URL.revokeObjectURL(url);
      } catch (apiError) {
        console.error('Error en la llamada API de descarga:', apiError);
        // Intentar con fetch como alternativa
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }
      
        const response = await fetch(`/appointments/${appointment.id}/download-payment-proof/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error al descargar: ${response.status} ${response.statusText}`);
      }
      
      // Obtener el blob de la respuesta
      const blob = await response.blob();
      
      // Crear un enlace de descarga temporal
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      
      // Obtener el nombre del archivo del Content-Disposition o usar uno predeterminado
      let filename = 'comprobante.pdf';
      const contentDisposition = response.headers.get('Content-Disposition');
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      
      a.href = url;
      a.download = filename;
      a.click();
      
      // Liberar recursos
      window.URL.revokeObjectURL(url);
      }
      
      // Eliminar notificación después de un tiempo
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 3000);
    } catch (error) {
      console.error('Error al descargar el comprobante:', error);
      alert('Error al descargar el comprobante. Inténtalo nuevamente.');
    }
  };

  // Función para verificar el pago y cambiar estado a CONFIRMED directamente
  const handleVerifyPayment = async () => {
    if (!appointment.id) return;
    
    // Si es un psicólogo y es la primera cita, no permitir verificar
    if (user?.user_type === 'psychologist' && isFirstApp) {
      toast.error('No puedes verificar la primera cita con un cliente. Solo un administrador puede hacerlo.', { id: 'verify-error' });
      return;
    }
    
    setIsVerifying(true);
    
    try {
      // Evitar envíos duplicados
      const lockKey = `verifying_appointment_${appointment.id}`;
      if (localStorage.getItem(lockKey) === 'true') {
        console.log('Evitando solicitud duplicada para la verificación:', appointment.id);
        return;
      }
      
      localStorage.setItem(lockKey, 'true');
      
      // Usar toast en lugar de toastService
      toast.loading('Verificando pago...', { id: 'unique-notification' });
      
      // Cambiar directamente a CONFIRMED
      const response = await api.patch(`/appointments/${appointment.id}/update-payment-status/`, {
        status: 'CONFIRMED',  // Cambiamos directamente a CONFIRMED en lugar de PAYMENT_VERIFIED
        notes: notes || undefined
      });
      
      toast.success('Pago verificado y cita confirmada correctamente', { id: 'unique-notification' });
      
      // Llamar al callback para actualizar la UI
      onVerifyPayment();
      
      // Cerrar el modal
      onClose();
      
      // Liberar el bloqueo
      localStorage.removeItem(lockKey);
    } catch (error) {
      console.error('Error al verificar el pago:', error);
      toast.error('Error al verificar el pago. Por favor, inténtalo nuevamente.', { id: 'unique-notification' });
      
      // Liberar el bloqueo en caso de error
      const lockKey = `verifying_appointment_${appointment.id}`;
      localStorage.removeItem(lockKey);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyConfirmationOpen = () => {
    // Si es un psicólogo y es la primera cita, no permitir verificar
    if (user?.user_type === 'psychologist' && isFirstApp) {
      toast.error('No puedes verificar la primera cita con un cliente. Solo un administrador puede hacerlo.', { id: 'verify-error' });
      return;
    }
    
    setShowVerifyConfirmation(true);
  };

  const handleConfirmationOpen = () => {
    setShowConfirmationDialog(true);
  };

  const handleVerifyConfirmed = () => {
    setShowVerifyConfirmation(false);
    onVerifyPayment();
  };

  const handleConfirmAppointmentConfirmed = () => {
    setShowConfirmationDialog(false);
    onConfirmAppointment();
  };

  const handleCancelDialog = () => {
    setShowVerifyConfirmation(false);
    setShowConfirmationDialog(false);
  };

  // Limpieza de recursos al desmontar el componente
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
          {/* Header con botón de cierre */}
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A6877]"
              onClick={onClose}
            >
              <span className="sr-only">Cerrar</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Título */}
          <div className="sm:flex sm:items-start mb-4">
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Detalles del pago
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Cita con {appointment.client_data?.name} para el {formatDate(appointment.date)} de {formatTime(appointment.start_time)} a {formatTime(appointment.end_time)}
              </p>
            </div>
          </div>

          {/* Contenido */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información del cliente */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Información del cliente</h4>
              
              <div className="flex items-center mb-4">
                {appointment.client_data?.profile_image ? (
                <img
                  className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                    src={appointment.client_data.profile_image}
                    alt={appointment.client_data?.name || 'Cliente'}
                />
                ) : (
                  <AvatarInitials 
                    name={appointment.client_data?.name || 'Cliente'} 
                    className="border-2 border-gray-200" 
                  />
                )}
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{appointment.client_data?.name}</p>
                  <p className="text-xs text-gray-500">{appointment.client_data?.email}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Teléfono:</span> {appointment.client_data?.phone || 'No disponible'}</p>
                <p><span className="font-medium">Notas del cliente:</span> {appointment.client_notes || 'Sin notas'}</p>
              </div>
            </div>

            {/* Detalles del pago */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Información del pago</h4>
              
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Estado:</span> <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">{appointment.status_display}</span></p>
                <p><span className="font-medium">Monto:</span> ${appointment.payment_amount?.toLocaleString() || 0}</p>
                <p><span className="font-medium">Método de pago:</span> {appointment.payment_detail?.payment_method || 'No especificado'}</p>
                {appointment.payment_detail?.transaction_id && (
                  <p><span className="font-medium">ID de transacción:</span> {appointment.payment_detail.transaction_id}</p>
                )}
                {appointment.payment_detail?.payment_date && (
                  <p><span className="font-medium">Fecha de pago:</span> {formatDate(appointment.payment_detail.payment_date)}</p>
                )}
              </div>
            </div>

            {/* Comprobante de pago - Versión mejorada */}
            <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Comprobante de pago</h4>
              
              {appointment.payment_proof_url ? (
                <div className="flex flex-col space-y-4">
                  {/* Contenedor de imagen con manejo de errores */}
                  <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-gray-200 border border-gray-300">
                    {loading ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#2A6877]"></div>
                        <span className="sr-only">Cargando...</span>
                      </div>
                    ) : imageError ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-center mb-2">No se puede mostrar la previsualización del comprobante.</p>
                        <p className="text-sm">El formato del archivo no es compatible para previsualización.</p>
                        <p className="text-sm mt-1">Utiliza el botón de descarga para ver el archivo completo.</p>
                      </div>
                    ) : previewUrl && (
                      <div className="absolute inset-0 w-full h-full bg-white">
                        <embed
                          src={previewUrl}
                          type="application/pdf"
                          className="absolute inset-0 w-full h-full"
                          style={{ 
                            border: 'none', 
                            minHeight: '300px', 
                            display: 'block',
                            overflow: 'hidden',
                            width: '100%',
                            height: '100%'
                          }}
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Botón para descargar */}
                  <div className="flex justify-center">
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center px-4 py-2 border border-[#2A6877] shadow-sm text-sm font-medium rounded-md text-white bg-[#2A6877] hover:bg-[#2A6877]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A6877]"
                    >
                      <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                      Descargar comprobante
                    </button>
                  </div>
                  
                  {/* Información del archivo */}
                  <div className="mt-2 text-xs text-gray-500 bg-gray-100 p-2 rounded break-all">
                    <p className="font-medium mb-1">Información del comprobante:</p>
                    <div className="space-y-1">
                      <p><span className="font-medium">Nombre del archivo:</span> {appointment.payment_proof_url.split('/').pop() || 'Archivo de comprobante'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No se ha subido ningún comprobante de pago.
                </div>
              )}
            </div>

            {/* Notas para la verificación */}
            {appointment.status === 'PAYMENT_UPLOADED' && (
              <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Notas para la verificación</h4>
                <textarea
                  rows={3}
                  className="shadow-sm focus:ring-[#2A6877] focus:border-[#2A6877] block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Añade notas sobre la verificación del pago..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            )}

            {/* Información del psicólogo (solo para admin) */}
            {user?.user_type === 'admin' && (
              <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded-md">
                <h4 className="text-md font-medium text-gray-900 mb-2">Información del psicólogo</h4>
                <div className="flex items-center">
                  {appointment.psychologist_data?.profile_image ? (
                    <img
                      className="h-10 w-10 rounded-full object-cover border border-gray-200"
                      src={appointment.psychologist_data.profile_image}
                      alt={appointment.psychologist_data?.name || 'Psicólogo'}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-[#2A6877] flex items-center justify-center text-white">
                      {appointment.psychologist_data?.name?.charAt(0) || 'P'}
                    </div>
                  )}
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {appointment.psychologist_data?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {appointment.psychologist_data?.professional_title || 'Psicólogo'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {appointment.psychologist_data?.email}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
            {appointment.status === 'PAYMENT_UPLOADED' && canVerify && (
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#2A6877] text-base font-medium text-white hover:bg-[#2A6877]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A6877] sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleVerifyConfirmationOpen}
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <>
                    <div className="animate-spin h-5 w-5 mr-2 border-t-2 border-b-2 border-white rounded-full" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Verificar Pago
                  </>
                )}
              </button>
            )}
            
            {appointment.status === 'PAYMENT_UPLOADED' && isPsychologist && isFirstApp && (
              <div className="w-full sm:w-auto bg-gray-100 rounded-md p-3 text-sm text-gray-700 flex items-start mb-3 sm:mb-0 sm:ml-3">
                <InformationCircleIcon className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0" />
                <span>
                  Esta es la primera cita con este cliente. Solo un administrador puede verificar el pago para la primera cita.
                </span>
              </div>
            )}
            
            {appointment.status === 'PAYMENT_VERIFIED' && (
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={handleConfirmationOpen}
              >
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Confirmar Cita
              </button>
            )}
            
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A6877] sm:mt-0 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

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

export default PaymentDetailModal; 