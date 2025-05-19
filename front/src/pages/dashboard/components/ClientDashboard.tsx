import React, { useState, useEffect } from 'react';
import { 
  UserIcon, 
  CalendarIcon, 
  ClockIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { fetchClientStats } from '../../../services/api';
import api from '../../../services/api';
import axios from 'axios';

// Interfaz para las estadísticas del cliente
interface ClientStats {
  totalAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  lastSessionDate: string | null;
}

// Interfaz para citas próximas
interface UpcomingAppointment {
  id: number;
  psychologistName: string;
  date: string;
  time: string;
  status: 'CONFIRMED' | 'PENDING_PAYMENT' | 'CANCELED' | string;
}

const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ClientStats>({
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    lastSessionDate: null
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Obtener estadísticas del cliente
        let statsData;
        try {
          statsData = await fetchClientStats();
          console.log('Estadísticas obtenidas:', statsData);
        } catch (statsError) {
          console.error('Error al obtener estadísticas, usando datos de fallback:', statsError);
          // Usar datos de fallback si falla
          statsData = {
            totalAppointments: 0,
            upcomingAppointments: 0,
            completedAppointments: 0,
            lastSessionDate: null
          };
        }
        setStats(statsData);
        
        // Obtener citas próximas
        try {
          const appointmentsResponse = await api.get('/appointments/client-appointments/');
          const upcomingData = appointmentsResponse.data.upcoming;
          
          // Transformar datos de citas próximas al formato esperado
          const formattedAppointments: UpcomingAppointment[] = upcomingData.map((appointment: any) => ({
            id: appointment.id,
            psychologistName: `${appointment.psychologist.user.first_name} ${appointment.psychologist.user.last_name}`,
            date: appointment.date,
            time: appointment.start_time,
            status: appointment.status
          }));
          
          setUpcomingAppointments(formattedAppointments);
        } catch (appointmentsError) {
          console.error('Error al obtener citas próximas:', appointmentsError);
          // En caso de error, dejamos la lista vacía
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error general al cargar datos del dashboard:', err);
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
          {/* Panel de bienvenida con información básica */}
          <motion.div variants={itemVariants} className="mb-4">
            <div className="bg-gradient-to-r from-[#2A6877]/90 to-[#2A6877]/70 rounded-lg text-white p-4">
              <h2 className="font-medium text-lg">Bienvenido, {user?.first_name || 'Usuario'}</h2>
              <p className="text-sm opacity-90 mt-1">
                {stats.lastSessionDate ? 
                  `Tu última sesión fue el ${formatDate(stats.lastSessionDate)}` : 
                  'Aún no has tenido ninguna sesión'
                }
              </p>
            </div>
          </motion.div>

          {/* Estadísticas principales */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Total de consultas */}
              <div className="bg-white rounded-lg p-3 border border-gray-200 flex flex-col">
                <div className="flex items-center mb-2">
                  <div className="h-8 w-8 rounded-full bg-[#2A6877]/10 flex items-center justify-center mr-2">
                    <CalendarIcon className="h-4 w-4 text-[#2A6877]" />
                  </div>
                  <span className="text-xs font-medium text-gray-500">Total consultas</span>
                </div>
                <span className="text-xl font-semibold text-gray-800">{stats.totalAppointments}</span>
              </div>
              
              {/* Citas pendientes */}
              <div className="bg-white rounded-lg p-3 border border-gray-200 flex flex-col">
                <div className="flex items-center mb-2">
                  <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center mr-2">
                    <ClockIcon className="h-4 w-4 text-yellow-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-500">Citas pendientes</span>
                </div>
                <span className="text-xl font-semibold text-gray-800">{stats.upcomingAppointments}</span>
              </div>
            </div>
          </motion.div>

          {/* Barra de acciones rápidas */}
          <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="font-medium text-gray-800 text-sm">Acciones rápidas</h3>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Link 
                to="/dashboard/new-appointment"
                className="flex-1 sm:flex-none px-3 py-1.5 bg-[#2A6877] text-white text-xs rounded-md hover:bg-[#1d4e5f] transition-colors flex items-center justify-center"
              >
                <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                Agendar cita
              </Link>
              <Link 
                to="/psychologists"
                className="flex-1 sm:flex-none px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <UserIcon className="h-3.5 w-3.5 mr-1" />
                Buscar psicólogo
              </Link>
            </div>
          </motion.div>

          {/* Sección principal: próximas citas */}
          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-3 border-b border-gray-100">
                <h3 className="font-medium text-gray-800 text-sm">Mis próximas citas</h3>
              </div>

              {upcomingAppointments.length > 0 ? (
                <>
                  <div className="divide-y divide-gray-100">
                    {upcomingAppointments.map(appointment => (
                      <div key={appointment.id} className="p-3 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium text-gray-800 text-sm">
                              {appointment.psychologistName}
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

                  <div className="p-3 text-center border-t border-gray-100">
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
                  <p className="font-medium text-gray-600 text-sm mb-1">No tienes citas programadas</p>
                  <p className="text-xs text-gray-500 mb-3">
                    Agenda tu primera cita con un profesional
                  </p>
                  <Link 
                    to="/dashboard/new-appointment"
                    className="inline-flex items-center text-[#2A6877] hover:text-[#1d4e5f] text-xs font-medium"
                  >
                    Agendar cita
                    <ArrowRightIcon className="h-3 w-3 ml-1" />
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

export default ClientDashboard; 