import { useState, useEffect } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowPathIcon,
  DocumentMagnifyingGlassIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Definir interfaces
interface PaymentDetail {
  id: number;
  appointment: number;
  payment_proof: string;
  uploaded_at: string;
  verified: boolean;
  verified_by?: number;
  verified_at?: string;
}

interface Appointment {
  id: number;
  psychologist_name: string;
  client_name: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  status_display: string;
  payment_amount: string;
  payment_proof?: string;
  payment_detail?: PaymentDetail;
}

const PaymentVerificationPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'verified'>('pending');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [processingSuccess, setProcessingSuccess] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  // Fetch appointments with payment proofs
  const fetchAppointments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get('/api/appointments/pending-payments/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setAppointments(response.data);
      filterAppointments(response.data, activeFilter);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('No pudimos cargar las citas pendientes de verificación. Por favor, intenta de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter appointments based on selected filter
  const filterAppointments = (appointments: Appointment[], filter: 'all' | 'pending' | 'verified') => {
    let filtered;
    
    switch (filter) {
      case 'pending':
        filtered = appointments.filter(app => 
          app.status === 'PAYMENT_UPLOADED' && !app.payment_detail?.verified
        );
        break;
      case 'verified':
        filtered = appointments.filter(app => 
          app.payment_detail?.verified || app.status === 'PAYMENT_VERIFIED' || app.status === 'CONFIRMED'
        );
        break;
      default:
        filtered = [...appointments];
    }
    
    setFilteredAppointments(filtered);
  };

  // Handle filter change
  const handleFilterChange = (filter: 'all' | 'pending' | 'verified') => {
    setActiveFilter(filter);
    filterAppointments(appointments, filter);
  };

  // Handle appointment click
  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setAdminNotes('');
    setIsModalOpen(true);
    setProcessingSuccess(false);
    setProcessingError(null);
  };

  // Handle verify payment
  const handleVerifyPayment = async (verified: boolean) => {
    if (!selectedAppointment) return;
    
    setIsProcessing(true);
    setProcessingError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      await axios.post(`/api/appointments/${selectedAppointment.id}/verify-payment/`, {
        verified,
        admin_notes: adminNotes
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setProcessingSuccess(true);
      fetchAppointments(); // Refresh appointments
      
      // Close modal after a short delay
      setTimeout(() => {
        setIsModalOpen(false);
      }, 1500);
    } catch (err) {
      console.error('Error verifying payment:', err);
      setProcessingError('No pudimos procesar la verificación. Por favor, intenta de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'dd/MM/yyyy', { locale: es });
  };

  // Format time
  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // Extract HH:MM from HH:MM:SS
  };

  // Fetch appointments on component mount
  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verificación de Pagos</h1>
        <p className="text-gray-600">Gestiona los pagos de citas que requieren verificación</p>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => handleFilterChange('pending')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeFilter === 'pending'
              ? 'bg-[#2A6877] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pendientes
        </button>
        <button
          onClick={() => handleFilterChange('verified')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeFilter === 'verified'
              ? 'bg-[#2A6877] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Verificados
        </button>
        <button
          onClick={() => handleFilterChange('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeFilter === 'all'
              ? 'bg-[#2A6877] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todos
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          <p className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            {error}
          </p>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <ArrowPathIcon className="h-8 w-8 text-gray-400 animate-spin" />
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No hay pagos {activeFilter === 'pending' ? 'pendientes de verificación' : activeFilter === 'verified' ? 'verificados' : ''} en este momento.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Psicólogo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha y Hora
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{appointment.client_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{appointment.psychologist_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(appointment.date)} {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${appointment.payment_amount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${appointment.status === 'PAYMENT_UPLOADED' ? 'bg-yellow-100 text-yellow-800' : 
                        appointment.status === 'PAYMENT_VERIFIED' || appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 
                        'bg-gray-100 text-gray-800'}`}>
                      {appointment.status_display}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleAppointmentClick(appointment)}
                      className="text-[#2A6877] hover:text-[#1d4b56] flex items-center"
                    >
                      <DocumentMagnifyingGlassIcon className="h-5 w-5 mr-1" />
                      Ver comprobante
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for payment verification */}
      {isModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Verificación de Pago</h2>
              
              <div className="mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Cliente</p>
                    <p className="font-medium">{selectedAppointment.client_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Psicólogo</p>
                    <p className="font-medium">{selectedAppointment.psychologist_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fecha y Hora</p>
                    <p className="font-medium">
                      {formatDate(selectedAppointment.date)} {formatTime(selectedAppointment.start_time)} - {formatTime(selectedAppointment.end_time)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Monto</p>
                    <p className="font-medium">${selectedAppointment.payment_amount}</p>
                  </div>
                </div>
              </div>
              
              {/* Payment proof */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Comprobante de Pago</h3>
                {selectedAppointment.payment_proof ? (
                  <div className="border rounded-lg overflow-hidden">
                    {selectedAppointment.payment_proof.endsWith('.pdf') ? (
                      <div className="p-4 bg-gray-50 text-center">
                        <a 
                          href={selectedAppointment.payment_proof} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#2A6877] hover:text-[#1d4b56] font-medium"
                        >
                          Ver PDF del comprobante
                        </a>
                      </div>
                    ) : (
                      <img 
                        src={selectedAppointment.payment_proof} 
                        alt="Comprobante de pago" 
                        className="w-full h-auto max-h-80 object-contain"
                      />
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No hay comprobante disponible</p>
                )}
              </div>
              
              {/* Admin notes */}
              <div className="mb-6">
                <label htmlFor="admin-notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notas administrativas
                </label>
                <textarea
                  id="admin-notes"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2A6877] focus:border-[#2A6877]"
                  placeholder="Añade notas sobre la verificación del pago..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  disabled={isProcessing || processingSuccess}
                ></textarea>
              </div>
              
              {/* Processing error */}
              {processingError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                  {processingError}
                </div>
              )}
              
              {/* Processing success */}
              {processingSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm flex items-center">
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Pago procesado correctamente
                </div>
              )}
              
              {/* Action buttons */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  disabled={isProcessing}
                >
                  Cancelar
                </button>
                
                {!processingSuccess && selectedAppointment.status === 'PAYMENT_UPLOADED' && (
                  <>
                    <button
                      onClick={() => handleVerifyPayment(false)}
                      className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none flex items-center"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <XCircleIcon className="h-4 w-4 mr-1" />
                      )}
                      Rechazar
                    </button>
                    
                    <button
                      onClick={() => handleVerifyPayment(true)}
                      className="px-4 py-2 border border-green-500 rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none flex items-center"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                      )}
                      Aprobar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentVerificationPage;