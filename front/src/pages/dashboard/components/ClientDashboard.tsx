import React, { useState, useEffect } from 'react';
import { 
  UserIcon, 
  CalendarIcon, 
  ClockIcon} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { fetchClientStats } from '../../../services/api';
import api from '../../../services/api';

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
  const [, setUpcomingAppointments] = useState<UpcomingAppointment[]>([]);
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
          
          // Intentar obtener al menos los datos de citas para tener estadísticas más precisas
          try {
            const appointmentsResponse = await api.get('/appointments/client-appointments/');
            const upcoming = appointmentsResponse.data.upcoming || [];
            const past = appointmentsResponse.data.past || [];
            const all = appointmentsResponse.data.all || [];
            
            // Crear estadísticas basadas en los datos de citas
            statsData = {
              totalAppointments: all.length,
              upcomingAppointments: upcoming.length,
              completedAppointments: past.filter((a: any) => a.status === 'COMPLETED').length,
              lastSessionDate: past.length > 0 ? past[0].date : null
            };
          } catch (appointmentsError) {
            // Si también falla, usar datos vacíos
            console.error('No se pudieron obtener datos de citas para estadísticas:', appointmentsError);
            statsData = {
              totalAppointments: 0,
              upcomingAppointments: 0,
              completedAppointments: 0,
              lastSessionDate: null
            };
          }
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
                to="/especialistas"
                className="flex-1 sm:flex-none px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <UserIcon className="h-3.5 w-3.5 mr-1" />
                Buscar psicólogo
              </Link>
              <Link 
                to="/dashboard/appointments" 
                className="flex-1 sm:flex-none px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                Ver mis citas
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

export default ClientDashboard; 