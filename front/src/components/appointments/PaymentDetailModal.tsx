import { useState, useEffect } from 'react';
import { XMarkIcon, CheckCircleIcon, ArrowDownTrayIcon, InformationCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
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
  const [isVerifying] = useState<boolean>(false);
  const [showVerifyConfirmation, setShowVerifyConfirmation] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [isFirstApp, setIsFirstApp] = useState<boolean>(propIsFirst);
  const [activeTab, setActiveTab] = useState<'info' | 'proof'>('info');
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
      toast.loading('Descargando comprobante...', {
        id: 'download-toast',
        style: {
          background: '#2A6877',
          color: 'white',
        }
      });
      
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
        toast.success('Comprobante descargado', { id: 'download-toast' });
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
        toast.success('Comprobante descargado', { id: 'download-toast' });
      }
    } catch (error) {
      console.error('Error al descargar el comprobante:', error);
      toast.error('Error al descargar el comprobante', { id: 'download-toast' });
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
      <div className="flex items-center justify-center min-h-screen px-2 pt-16 pb-2 text-center sm:p-0">
        {/* Overlay - Capa de fondo oscurecida */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        {/* Modal - Contenedor principal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full max-h-[90vh] relative">
          {/* Header del modal con título y botón de cierre */}
          <div className="bg-[#2A6877] px-4 py-3 sm:px-6 text-white flex items-center justify-between sticky top-0 z-10">
            <div className="flex flex-col">
              <h3 className="text-base font-medium leading-6">
                Detalles del pago
              </h3>
              <p className="text-xs text-white/80 mt-0.5">
                {formatDate(appointment.date)} • {formatTime(appointment.start_time)}-{formatTime(appointment.end_time)}
              </p>
            </div>
            <button
              type="button"
              className="rounded-md text-white/80 hover:text-white focus:outline-none"
              onClick={onClose}
            >
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Navegación por pestañas para móviles */}
          <div className="flex border-b border-gray-200 sticky top-[51px] bg-white z-10">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 px-4 py-2.5 text-sm font-medium ${
                activeTab === 'info' 
                ? 'text-[#2A6877] border-b-2 border-[#2A6877]' 
                : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Información
            </button>
            <button
              onClick={() => setActiveTab('proof')}
              className={`flex-1 px-4 py-2.5 text-sm font-medium ${
                activeTab === 'proof' 
                ? 'text-[#2A6877] border-b-2 border-[#2A6877]' 
                : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Comprobante
            </button>
          </div>

          {/* Contenido con scroll */}
          <div className="overflow-y-auto px-0 max-h-[calc(90vh-120px)]">
            {/* Panel de Información */}
            {activeTab === 'info' && (
              <div className="p-4 space-y-4">
                {/* Tarjeta del cliente */}
                <div className="bg-gray-50 p-3 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-gray-800">Cliente</h4>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {appointment.status_display}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    {appointment.client_data?.profile_image ? (
                      <img
                        className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm"
                        src={appointment.client_data.profile_image}
                        alt={appointment.client_data?.name || 'Cliente'}
                      />
                    ) : (
                      <AvatarInitials 
                        name={appointment.client_data?.name || 'Cliente'} 
                        className="border-2 border-white shadow-sm"
                        size="sm"
                      />
                    )}
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{appointment.client_data?.name}</p>
                      <p className="text-xs text-gray-500">{appointment.client_data?.email}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 space-y-1 text-xs">
                    {appointment.client_data?.phone && (
                      <p className="flex justify-between">
                        <span className="text-gray-500">Teléfono:</span>
                        <span className="font-medium text-gray-800">{appointment.client_data.phone}</span>
                      </p>
                    )}
                    {appointment.client_notes && (
                      <div className="pt-1">
                        <p className="text-gray-500 mb-1">Notas del cliente:</p>
                        <p className="text-gray-800 bg-white p-2 rounded-md text-xs">{appointment.client_notes}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Detalles del pago */}
                <div className="bg-gray-50 p-3 rounded-lg shadow-sm">
                  <h4 className="text-sm font-medium text-gray-800 mb-2">Información del pago</h4>
                  
                  <div className="space-y-1.5 text-xs">
                    <p className="flex justify-between">
                      <span className="text-gray-500">Monto:</span>
                      <span className="font-medium text-gray-800">${appointment.payment_amount?.toLocaleString() || 0}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500">Método:</span>
                      <span className="font-medium text-gray-800">{appointment.payment_detail?.payment_method || 'No especificado'}</span>
                    </p>
                    {appointment.payment_detail?.transaction_id && (
                      <p className="flex justify-between">
                        <span className="text-gray-500">ID transacción:</span>
                        <span className="font-medium text-gray-800">{appointment.payment_detail.transaction_id}</span>
                      </p>
                    )}
                    {appointment.payment_detail?.payment_date && (
                      <p className="flex justify-between">
                        <span className="text-gray-500">Fecha de pago:</span>
                        <span className="font-medium text-gray-800">{formatDate(appointment.payment_detail.payment_date)}</span>
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Información del psicólogo (solo para admin) */}
                {user?.user_type === 'admin' && (
                  <div className="bg-gray-50 p-3 rounded-lg shadow-sm">
                    <h4 className="text-sm font-medium text-gray-800 mb-2">Psicólogo asignado</h4>
                    <div className="flex items-center">
                      {appointment.psychologist_data?.profile_image ? (
                        <img
                          className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm"
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
                      </div>
                    </div>
                  </div>
                )}

                {/* Notas para la verificación */}
                {appointment.status === 'PAYMENT_UPLOADED' && (
                  <div className="bg-gray-50 p-3 rounded-lg shadow-sm">
                    <h4 className="text-sm font-medium text-gray-800 mb-2">Notas para la verificación</h4>
                    <textarea
                      rows={2}
                      className="shadow-sm focus:ring-[#2A6877] focus:border-[#2A6877] block w-full text-sm border-gray-300 rounded-md"
                      placeholder="Añadir notas sobre la verificación..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                )}
                
                {/* Primera cita - Advertencia para psicólogos */}
                {appointment.status === 'PAYMENT_UPLOADED' && isPsychologist && isFirstApp && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="flex">
                      <InformationCircleIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      <div className="ml-2">
                        <p className="text-xs text-blue-600">
                          Esta es la primera cita con este cliente. Solo un administrador puede verificar el pago para la primera cita.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Panel de Comprobante */}
            {activeTab === 'proof' && (
              <div className="p-4 space-y-4">
                {appointment.payment_proof_url ? (
                  <div className="space-y-4">
                    {/* Contenedor de imagen con manejo de errores */}
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-200 border border-gray-300">
                      {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#2A6877]"></div>
                        </div>
                      ) : imageError ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-gray-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-center text-xs">El formato del archivo no es compatible para previsualización.</p>
                        </div>
                      ) : previewUrl && (
                        <embed
                          src={previewUrl}
                          type="application/pdf"
                          className="absolute inset-0 w-full h-full"
                          style={{ 
                            border: 'none', 
                            minHeight: '200px',
                            overflow: 'hidden'
                          }}
                        />
                      )}
                    </div>
                    
                    {/* Botón para descargar */}
                    <div className="flex justify-center">
                      <button
                        onClick={handleDownload}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#2A6877] hover:bg-[#2A6877]/90 shadow-sm"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                        Descargar comprobante
                      </button>
                    </div>
                    
                    {/* Información del archivo */}
                    <div className="mt-2 text-xs text-gray-500 bg-gray-100 p-2 rounded">
                      <p className="font-medium mb-1">Nombre del archivo:</p>
                      <p className="truncate">{appointment.payment_proof_url.split('/').pop() || 'Archivo de comprobante'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>No se ha subido ningún comprobante de pago.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Barra de acciones fija en la parte inferior */}
          <div className="border-t border-gray-200 px-4 py-3 bg-gray-50 sticky bottom-0 left-0 right-0 z-10">
            <div className="flex flex-col sm:flex-row-reverse sm:space-x-reverse sm:space-x-2">
              {appointment.status === 'PAYMENT_UPLOADED' && canVerify && (
                <button
                  type="button"
                  className="w-full mb-2 sm:mb-0 sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2A6877] hover:bg-[#2A6877]/90 focus:outline-none"
                  onClick={handleVerifyConfirmationOpen}
                  disabled={isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Verificar Pago
                    </>
                  )}
                </button>
              )}
              
              {appointment.status === 'PAYMENT_VERIFIED' && (
                <button
                  type="button"
                  className="w-full mb-2 sm:mb-0 sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                  onClick={handleConfirmationOpen}
                >
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Confirmar Cita
                </button>
              )}
              
              <button
                type="button"
                className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                onClick={onClose}
              >
                Cerrar
              </button>
            </div>
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
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 mt-16 sm:mt-0">
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
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#2A6877] text-sm font-medium text-white hover:bg-[#2A6877]/90 focus:outline-none sm:col-start-2"
                  onClick={handleVerifyConfirmed}
                >
                  Sí, verificar pago
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:col-start-1"
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
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 mt-16 sm:mt-0">
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
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-sm font-medium text-white hover:bg-green-700 focus:outline-none sm:col-start-2"
                  onClick={handleConfirmAppointmentConfirmed}
                >
                  Sí, confirmar cita
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:col-start-1"
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