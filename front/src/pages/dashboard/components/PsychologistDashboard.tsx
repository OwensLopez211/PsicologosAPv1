import React, { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  CalendarIcon, 
  CurrencyDollarIcon,
  DocumentCheckIcon,
  ClockIcon,
  StarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

// Interfaz para las estadísticas del psicólogo
interface PsychologistStats {
  totalAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  activeClients: number;
  pendingPayments: number;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'DOCUMENTS_SUBMITTED' | 'REJECTED' | string;
  rating: number;
}

// Interfaz para citas próximas
interface UpcomingAppointment {
  id: number;
  clientName: string;
  date: string;
  time: string;
  status: 'CONFIRMED' | 'PENDING_PAYMENT' | 'CANCELED' | string;
}

const PsychologistDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<PsychologistStats>({
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    activeClients: 0,
    pendingPayments: 0,
    verificationStatus: 'PENDING',
    rating: 0
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Aquí se realizarían las llamadas a la API para obtener datos reales
        // Por ahora, simulamos datos de ejemplo
        
        // Simulación de carga de estadísticas
        setTimeout(() => {
          setStats({
            totalAppointments: 28,
            pendingAppointments: 3,
            completedAppointments: 25,
            activeClients: 8,
            pendingPayments: 2,
            verificationStatus: 'VERIFIED',
            rating: 4.8
          });
          
          // Simulación de citas próximas
          setUpcomingAppointments([
            {
              id: 1,
              clientName: 'María García',
              date: '2023-12-05',
              time: '15:30',
              status: 'CONFIRMED'
            },
            {
              id: 2,
              clientName: 'Juan Pérez',
              date: '2023-12-07',
              time: '10:00',
              status: 'PENDING_PAYMENT'
            },
            {
              id: 3,
              clientName: 'Ana Rodríguez',
              date: '2023-12-08',
              time: '17:15',
              status: 'CONFIRMED'
            }
          ]);
          
          setLoading(false);
        }, 1000);
        
      } catch (err) {
        console.error('Error al cargar datos del dashboard:', err);
        setError('No se pudieron cargar tus datos. Por favor, intenta nuevamente más tarde.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Variantes para animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Función para obtener el color según el estado de verificación
  const getVerificationStatusColor = () => {
    switch (stats.verificationStatus) {
      case 'VERIFIED':
        return 'bg-green-100 text-green-800';
      case 'DOCUMENTS_SUBMITTED':
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener el texto del estado de verificación
  const getVerificationStatusText = () => {
    switch (stats.verificationStatus) {
      case 'VERIFIED':
        return 'Verificado';
      case 'DOCUMENTS_SUBMITTED':
        return 'Documentos entregados';
      case 'PENDING':
        return 'Pendiente';
      case 'REJECTED':
        return 'Rechazado';
      default:
        return 'Desconocido';
    }
  };

  // Función para obtener el color según el estado de la cita
  const getAppointmentStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING_PAYMENT':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener el texto del estado de la cita
  const getAppointmentStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Confirmada';
      case 'PENDING_PAYMENT':
        return 'Pendiente de pago';
      case 'CANCELED':
        return 'Cancelada';
      default:
        return 'Desconocido';
    }
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {loading ? (
        <div className="flex justify-center items-center p-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#2A6877]"></div>
        </div>
      ) : error ? (
        <div className="p-5 text-center text-red-500">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-[#2A6877] hover:underline"
          >
            Intentar nuevamente
          </button>
        </div>
      ) : (
        <>
          {/* Estado de verificación */}
          <motion.div variants={itemVariants} className="mb-4">
            <div className={`p-3 rounded-lg ${getVerificationStatusColor()} flex items-center justify-between`}>
              <div className="flex items-center">
                <DocumentCheckIcon className="h-5 w-5 mr-2" />
                <span className="font-medium">Estado de tu perfil: {getVerificationStatusText()}</span>
              </div>
              {stats.verificationStatus !== 'VERIFIED' && (
                <Link 
                  to="/dashboard/profile" 
                  className="text-xs font-medium underline"
                >
                  Completar verificación
                </Link>
              )}
            </div>
          </motion.div>

          {/* Estadísticas principales */}
          <motion.div variants={itemVariants} className="mb-6">
            {/* Tarjeta principal con contador de citas */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex items-center p-4 gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Total citas atendidas</p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">{stats.totalAppointments}</h2>
                </div>
                <div className="h-12 w-12 bg-[#2A6877]/10 rounded-full flex items-center justify-center">
                  <CalendarIcon className="h-6 w-6 text-[#2A6877]" />
                </div>
              </div>
              
              {/* Métricas con diseño más compacto */}
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 border-t border-gray-100">
                {/* Clientes activos */}
                <div className="p-3 flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Pacientes activos</span>
                    <div className="h-4 w-4 rounded-full bg-blue-100 flex items-center justify-center">
                      <UsersIcon className="h-2.5 w-2.5 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-1">
                    <span className="text-lg font-semibold text-gray-800">{stats.activeClients}</span>
                  </div>
                </div>

                {/* Valoración */}
                <div className="p-3 flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Valoración</span>
                    <div className="h-4 w-4 rounded-full bg-yellow-100 flex items-center justify-center">
                      <StarIcon className="h-2.5 w-2.5 text-yellow-600" />
                    </div>
                  </div>
                  <div className="mt-1 flex items-center">
                    <span className="text-lg font-semibold text-gray-800">{stats.rating}</span>
                    <div className="ml-2 flex">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon 
                          key={i} 
                          className={`h-3 w-3 ${i < Math.floor(stats.rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                          fill={i < Math.floor(stats.rating) ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Citas pendientes */}
                <div className="p-3 flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Citas próximas</span>
                    <div className="h-4 w-4 rounded-full bg-purple-100 flex items-center justify-center">
                      <ClockIcon className="h-2.5 w-2.5 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-1">
                    <span className="text-lg font-semibold text-gray-800">{stats.pendingAppointments}</span>
                  </div>
                </div>

                {/* Pagos pendientes */}
                <div className="p-3 flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Pagos pendientes</span>
                    <div className="h-4 w-4 rounded-full bg-green-100 flex items-center justify-center">
                      <CurrencyDollarIcon className="h-2.5 w-2.5 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-1">
                    <span className="text-lg font-semibold text-gray-800">{stats.pendingPayments}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Barra de acciones rápidas */}
          <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="font-medium text-gray-800 text-sm">Acciones rápidas</h3>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Link 
                to="/dashboard/appointments"
                className="flex-1 sm:flex-none px-3 py-1.5 bg-[#2A6877] text-white text-xs rounded-md hover:bg-[#1d4e5f] transition-colors flex items-center justify-center"
              >
                <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                Gestionar citas
              </Link>
              <Link 
                to="/dashboard/clients"
                className="flex-1 sm:flex-none px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <UsersIcon className="h-3.5 w-3.5 mr-1" />
                Ver pacientes
              </Link>
            </div>
          </motion.div>

          {/* Sección de próximas citas */}
          <motion.div 
            className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200"
            variants={itemVariants}
          >
            <div className="p-3 border-b border-gray-100">
              <h3 className="font-medium text-gray-800 text-sm">Próximas citas</h3>
              <p className="text-gray-500 text-xs">Las citas más cercanas en tu agenda</p>
            </div>

            {upcomingAppointments.length > 0 ? (
              <>
                <div className="divide-y divide-gray-100">
                  {upcomingAppointments.map(appointment => (
                    <div key={appointment.id} className="p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium text-gray-800 text-sm">
                            {appointment.clientName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(appointment.date)} - {appointment.time}
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getAppointmentStatusColor(appointment.status)}`}>
                          {getAppointmentStatusText(appointment.status)}
                        </span>
                      </div>
                      <div className="flex justify-end">
                        <Link 
                          to={`/dashboard/appointments/${appointment.id}`}
                          className="text-[#2A6877] hover:text-[#1d4e5f] text-xs font-medium flex items-center"
                        >
                          Ver detalles
                          <ArrowRightIcon className="h-3 w-3 ml-1" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 text-center">
                  <Link 
                    to="/dashboard/appointments" 
                    className="text-[#2A6877] hover:text-[#1d4e5f] text-xs font-medium"
                  >
                    Ver todas mis citas →
                  </Link>
                </div>
              </>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <CalendarIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="font-medium text-gray-600 text-sm mb-1">No tienes citas próximas</p>
                <p className="text-xs text-gray-500 mb-3">
                  Tu agenda está libre por ahora
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

export default PsychologistDashboard; 