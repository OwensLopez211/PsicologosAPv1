import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import axios from 'axios';
import { 
  CalendarIcon, 
  ClockIcon, 
  UserIcon, 
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  CreditCardIcon,
  BuildingLibraryIcon
} from '@heroicons/react/24/outline';

// Define appointment status types to match backend
type AppointmentStatus = 'PENDING_PAYMENT' | 'PAYMENT_UPLOADED' | 'PAYMENT_VERIFIED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

// Define appointment interface
interface Appointment {
  id: number;
  psychologist_name: string;
  date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  status_display: string;
  client_notes?: string;
  psychologist_notes?: string;
  payment_proof?: string;
  meeting_link?: string;
  psychologist_id?: number;
  payment_amount?: number;
}

const ClientAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isLoadingBankInfo, setIsLoadingBankInfo] = useState(false);
  const [isFirstAppointment, setIsFirstAppointment] = useState(true);
  const [bankInfo, setBankInfo] = useState({
    bankName: '',
    accountNumber: '',
    accountType: '',
    accountOwner: '',
    ownerRut: '',
    ownerEmail: '',
    isAdmin: true
  });
  
// Remove unused import since user is not being used

  // Fetch appointments from API
  const fetchAppointments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      // Use client-appointments endpoint instead of client-appointments
      const response = await axios.get('/api/appointments/client-appointments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Verificar la estructura de la respuesta
      console.log('API Response:', response.data);
      
      // Si la respuesta contiene upcoming, past y all, usamos esa estructura
      if (response.data.upcoming !== undefined && 
          response.data.past !== undefined && 
          response.data.all !== undefined) {
        
        // Guardamos todas las citas
        setAppointments(response.data.all);
        
        // Siempre mostramos las citas próximas por defecto, independientemente del filtro activo
        if (activeFilter === 'upcoming') {
          setFilteredAppointments(response.data.upcoming);
        } else if (activeFilter === 'past') {
          setFilteredAppointments(response.data.past);
        } else {
          setFilteredAppointments(response.data.all);
        }
      } else {
        // Si la respuesta no tiene la estructura esperada, tratamos los datos como una lista simple
        setAppointments(response.data);
        // Aplicamos el filtro activo a los datos
        filterAppointments(response.data, activeFilter);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('No pudimos cargar tus citas. Por favor, intenta de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter appointments based on selected filter
  const filterAppointments = (appointments: Appointment[], filter: 'all' | 'upcoming' | 'past') => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let filtered;
    
    switch (filter) {
      case 'upcoming':
        filtered = appointments.filter(app => {
          const appDate = parseISO(app.date);
          return appDate >= today && app.status !== 'CANCELLED' && app.status !== 'COMPLETED';
        });
        break;
      case 'past':
        filtered = appointments.filter(app => {
          const appDate = parseISO(app.date);
          return appDate < today || app.status === 'CANCELLED' || app.status === 'COMPLETED';
        });
        break;
      default:
        filtered = [...appointments];
    }
    
    // Sort by date (upcoming first)
    filtered.sort((a, b) => {
      const dateA = parseISO(a.date);
      const dateB = parseISO(b.date);
      return dateA.getTime() - dateB.getTime();
    });
    
    setFilteredAppointments(filtered);
  };

  // Handle filter change - using the enhanced version that handles backend response structure
  const handleFilterChange = (filter: 'all' | 'upcoming' | 'past') => {
    setActiveFilter(filter);
    
    // Si tenemos la respuesta estructurada del backend
    if (appointments.length > 0 && 'upcoming' in appointments[0]) {
      // Aquí asumimos que appointments contiene la respuesta completa del backend
      const responseData = appointments[0] as any;
      
      if (filter === 'upcoming' && responseData.upcoming) {
        setFilteredAppointments(responseData.upcoming);
      } else if (filter === 'past' && responseData.past) {
        setFilteredAppointments(responseData.past);
      } else {
        setFilteredAppointments(responseData.all || []);
      }
    } else {
      // Usamos la función de filtrado local si no tenemos la estructura del backend
      filterAppointments(appointments, filter);
    }
  };

  // Función para verificar si es primera cita con el psicólogo
  const checkIfFirstAppointment = async (psychologistId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `/api/appointments/has-confirmed-appointments/${psychologistId}/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return !response.data.has_confirmed_appointments;
    } catch (err) {
      console.error('Error verificando si es primera cita:', err);
      return true; // Por defecto asumimos que es primera cita si hay error
    }
  };

  // Función para obtener la información bancaria
  const fetchBankInfo = async (appointment: Appointment) => {
    if (!appointment.psychologist_id) return;
    
    setIsLoadingBankInfo(true);
    try {
      const token = localStorage.getItem('token');
      const isFirst = await checkIfFirstAppointment(appointment.psychologist_id);
      setIsFirstAppointment(isFirst);
      
      if (isFirst) {
        // Si es primera cita, obtener datos del admin
        const response = await axios.get('/api/profiles/bank-info/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const adminData = response.data;
        setBankInfo({
          bankName: adminData.bank_name || 'No especificado',
          accountNumber: adminData.bank_account_number || 'No especificado',
          accountType: adminData.bank_account_type || 'No especificado',
          accountOwner: adminData.bank_account_owner || 'Administración',
          ownerRut: adminData.bank_account_owner_rut || 'No especificado',
          ownerEmail: adminData.bank_account_owner_email || 'No especificado',
          isAdmin: true
        });
      } else {
        // Si no es primera cita, obtener datos del psicólogo
        const response = await axios.get(
          `/api/profiles/psychologist-profiles/${appointment.psychologist_id}/`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        const psychData = response.data;
        setBankInfo({
          bankName: psychData.bank_name || 'No especificado',
          accountNumber: psychData.bank_account_number || 'No especificado',
          accountType: psychData.bank_account_type_display || 'No especificado',
          accountOwner: psychData.bank_account_owner || psychData.first_name + ' ' + psychData.last_name,
          ownerRut: psychData.bank_account_owner_rut || psychData.rut || 'No especificado',
          ownerEmail: psychData.bank_account_owner_email || psychData.email || 'No especificado',
          isAdmin: false
        });
      }
    } catch (err) {
      console.error('Error obteniendo información bancaria:', err);
      setError('No pudimos cargar la información bancaria. Por favor, intenta de nuevo más tarde.');
    } finally {
      setIsLoadingBankInfo(false);
    }
  };

  // Handle appointment click
  const handleAppointmentClick = async (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
    setUploadSuccess(false);
    setUploadError(null);
    await fetchBankInfo(appointment);
  };

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPaymentFile(e.target.files[0]);
    }
  };

  // Handle payment upload
  const handleUploadPayment = async () => {
    if (!selectedAppointment || !paymentFile) return;
    
    setIsUploading(true);
    setUploadError(null);
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('payment_proof', paymentFile);
      
      await axios.post(`/api/appointments/${selectedAppointment.id}/upload-payment/`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUploadSuccess(true);
      fetchAppointments(); // Refresh appointments
    } catch (err) {
      console.error('Error uploading payment:', err);
      setUploadError('No pudimos subir tu comprobante. Por favor, intenta de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle cancel appointment
  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
      return;
    }
    
    setIsUploading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      await axios.patch(`/api/appointments/${selectedAppointment.id}/cancel/`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setIsModalOpen(false);
      fetchAppointments(); // Refresh appointments
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setUploadError('No pudimos cancelar tu cita. Por favor, intenta de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  // Get status badge color
  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PAYMENT_UPLOADED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PAYMENT_VERIFIED':
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'COMPLETED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'CANCELLED':
      case 'NO_SHOW':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Fetch appointments on component mount and when activeFilter changes
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Añadimos un nuevo useEffect para asegurarnos de que las citas se filtran correctamente cuando cambia el filtro activo
  useEffect(() => {
    // Si ya tenemos citas cargadas, aplicamos el filtro activo
    if (appointments.length > 0) {
      if (appointments.length > 0 && 'upcoming' in appointments[0]) {
        // Si tenemos la estructura del backend
        const responseData = appointments[0] as any;
        
        if (activeFilter === 'upcoming' && responseData.upcoming) {
          setFilteredAppointments(responseData.upcoming);
        } else if (activeFilter === 'past' && responseData.past) {
          setFilteredAppointments(responseData.past);
        } else {
          setFilteredAppointments(responseData.all || []);
        }
      } else {
        // Filtrado local
        filterAppointments(appointments, activeFilter);
      }
    }
  }, [activeFilter, appointments]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Mis Citas</h1>
        <p className="text-gray-600">Administra tus citas con psicólogos</p>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => handleFilterChange('upcoming')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeFilter === 'upcoming' 
              ? 'bg-[#2A6877] text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Próximas
        </button>
        <button
          onClick={() => handleFilterChange('past')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeFilter === 'past' 
              ? 'bg-[#2A6877] text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pasadas
        </button>
        <button
          onClick={() => handleFilterChange('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeFilter === 'all' 
              ? 'bg-[#2A6877] text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todas
        </button>
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-12">
          <ArrowPathIcon className="h-8 w-8 mx-auto text-gray-400 animate-spin" />
          <p className="mt-2 text-gray-500">Cargando tus citas...</p>
        </div>
      )}
      
      {/* Error state */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <ExclamationCircleIcon className="h-6 w-6 mx-auto text-red-500 mb-2" />
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchAppointments}
            className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          >
            Intentar de nuevo
          </button>
        </div>
      )}
      
      {/* Empty state */}
      {!isLoading && !error && filteredAppointments.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <CalendarIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No tienes citas {activeFilter === 'upcoming' ? 'próximas' : activeFilter === 'past' ? 'pasadas' : ''}</h3>
          <p className="text-gray-500 mb-4">
            {activeFilter === 'upcoming' 
              ? 'Cuando reserves una cita con un psicólogo, aparecerá aquí.'
              : activeFilter === 'past'
                ? 'No tienes citas pasadas o completadas.'
                : 'No tienes ninguna cita programada.'}
          </p>
          {activeFilter !== 'upcoming' && (
            <button
              onClick={() => handleFilterChange('upcoming')}
              className="px-4 py-2 bg-[#2A6877] text-white rounded-md hover:bg-[#1d4e5a] transition-colors"
            >
              Ver citas próximas
            </button>
          )}
        </div>
      )}
      
      {/* Appointments list */}
      {!isLoading && !error && filteredAppointments.length > 0 && (
        <div className="space-y-4">
          {filteredAppointments.map(appointment => (
            <div 
              key={appointment.id}
              onClick={() => handleAppointmentClick(appointment)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                <h3 className="text-lg font-medium text-gray-900">Cita con {appointment.psychologist_name}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                  {appointment.status_display}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center text-gray-600">
                  <CalendarIcon className="h-5 w-5 mr-2 text-gray-400" />
                  <span>{format(parseISO(appointment.date), "EEEE d 'de' MMMM, yyyy", { locale: es })}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <ClockIcon className="h-5 w-5 mr-2 text-gray-400" />
                  <span>{appointment.start_time} - {appointment.end_time}</span>
                </div>
              </div>
              
              {appointment.status === 'PENDING_PAYMENT' && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center text-yellow-600">
                    <CreditCardIcon className="h-5 w-5 mr-2" />
                    <span className="text-sm">Pendiente de pago - Haz clic para subir tu comprobante</span>
                  </div>
                </div>
              )}
              
              {appointment.status === 'CONFIRMED' && appointment.meeting_link && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <a 
                    href={appointment.meeting_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1.5 bg-[#2A6877] text-white rounded-md hover:bg-[#1d4e5a] transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 12a7 7 0 11-7-7 7 7 0 017 7zm-7-9a9 9 0 100 18 9 9 0 000-18zm-2 9a2 2 0 114 0 2 2 0 01-4 0z" />
                    </svg>
                    Unirse a la sesión
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Appointment Details Modal */}
      {isModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">Detalles de la Cita</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    Cita con {selectedAppointment.psychologist_name}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedAppointment.status)}`}>
                    {selectedAppointment.status_display}
                  </span>
                </div>
                
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-center">
                    <UserIcon className="h-5 w-5 mr-3 text-gray-400" />
                    <span>{selectedAppointment.psychologist_name}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-3 text-gray-400" />
                    <span>{format(parseISO(selectedAppointment.date), "EEEE d 'de' MMMM, yyyy", { locale: es })}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 mr-3 text-gray-400" />
                    <span>{selectedAppointment.start_time} - {selectedAppointment.end_time}</span>
                  </div>

                  {selectedAppointment.payment_amount && (
                    <div className="flex items-center">
                      <CreditCardIcon className="h-5 w-5 mr-3 text-gray-400" />
                      <span>${selectedAppointment.payment_amount.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Información bancaria */}
              {selectedAppointment.status === 'PENDING_PAYMENT' && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900 flex items-center">
                      <BuildingLibraryIcon className="h-5 w-5 mr-2 text-[#2A6877]" />
                      Datos para transferencia
                      {isFirstAppointment ? ' (Administración)' : ' (Especialista)'}
                    </h3>
                    {isLoadingBankInfo && (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#2A6877]"></div>
                    )}
                  </div>

                  {bankInfo && !isLoadingBankInfo && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <p className="text-sm text-gray-500">Banco</p>
                          <p className="font-medium">{bankInfo.bankName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Tipo de cuenta</p>
                          <p className="font-medium">{bankInfo.accountType}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Número de cuenta</p>
                          <p className="font-medium">{bankInfo.accountNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Titular</p>
                          <p className="font-medium">{bankInfo.accountOwner}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">RUT</p>
                          <p className="font-medium">{bankInfo.ownerRut}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{bankInfo.ownerEmail}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Información sobre primera cita */}
                  {isFirstAppointment && (
                    <div className="mt-4 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <ExclamationCircleIcon className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                            Esta es tu primera cita con este especialista. Por políticas de la plataforma, el pago de esta primera sesión debe realizarse a la cuenta de administración.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Notes section */}
              {selectedAppointment.client_notes && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                    <DocumentTextIcon className="h-4 w-4 mr-1" />
                    Tus notas
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-md text-gray-700">
                    {selectedAppointment.client_notes}
                  </div>
                </div>
              )}
              
              {selectedAppointment.psychologist_notes && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                    <DocumentTextIcon className="h-4 w-4 mr-1" />
                    Notas del psicólogo
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-md text-gray-700">
                    {selectedAppointment.psychologist_notes}
                  </div>
                </div>
              )}
              
              {/* Payment upload section */}
              {selectedAppointment.status === 'PENDING_PAYMENT' && (
                <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2 flex items-center">
                    <CreditCardIcon className="h-4 w-4 mr-1" />
                    Pendiente de pago
                  </h4>
                  <p className="text-sm text-yellow-700 mb-3">
                    Para confirmar tu cita, por favor sube el comprobante de pago.
                  </p>
                  
                  {uploadSuccess ? (
                    <div className="bg-green-50 p-3 rounded-md text-green-700 flex items-center">
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Comprobante subido correctamente. Tu cita será confirmada pronto.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          type="file"
                          onChange={handleFileChange}
                          accept="image/*,.pdf"
                          className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-md file:border-0
                            file:text-sm file:font-medium
                            file:bg-[#2A6877] file:text-white
                            hover:file:bg-[#1d4e5a]
                          "
                        />
                      </div>
                      
                      {uploadError && (
                        <div className="text-sm text-red-600">
                          {uploadError}
                        </div>
                      )}
                      
                      <button
                        onClick={handleUploadPayment}
                        disabled={!paymentFile || isUploading}
                        className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                          !paymentFile || isUploading
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-[#2A6877] hover:bg-[#1d4e5a]'
                        } transition-colors`}
                      >
                        {isUploading ? 'Subiendo...' : 'Subir comprobante'}
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Meeting link */}
              {selectedAppointment.status === 'CONFIRMED' && selectedAppointment.meeting_link && (
                <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center">
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Cita confirmada
                  </h4>
                  <p className="text-sm text-green-700 mb-3">
                    Tu cita ha sido confirmada. Puedes unirte a la sesión a través del siguiente enlace:
                  </p>
                  <a 
                    href={selectedAppointment.meeting_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full py-2 px-4 bg-[#2A6877] text-white text-center rounded-md hover:bg-[#1d4e5a] transition-colors"
                  >
                    Unirse a la sesión
                  </a>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex flex-wrap gap-3 justify-end pt-4 border-t border-gray-200">
                {(selectedAppointment.status === 'PENDING_PAYMENT' || 
                  selectedAppointment.status === 'PAYMENT_UPLOADED' || 
                  selectedAppointment.status === 'PAYMENT_VERIFIED' || 
                  selectedAppointment.status === 'CONFIRMED') && (
                  <button
                    onClick={handleCancelAppointment}
                    disabled={isUploading}
                    className="py-2 px-4 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors"
                  >
                    Cancelar cita
                  </button>
                )}
                
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="py-2 px-4 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientAppointments;