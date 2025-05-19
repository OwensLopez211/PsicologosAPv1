import React, { useState, useEffect } from 'react';
import { 
  UserIcon, 
  CalendarIcon, 
  ArrowTrendingUpIcon,
  HeartIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

// Interfaz para las estadísticas del cliente
interface ClientStats {
  totalAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  favoritesPsychologists: number;
  lastSessionDate: string | null;
  unreadMessages: number;
}

// Interfaz para citas próximas
interface UpcomingAppointment {
  id: number;
  psychologistName: string;
  date: string;
  time: string;
  status: 'CONFIRMED' | 'PENDING_PAYMENT' | 'CANCELED' | string;
}

// Interfaz para psicólogos favoritos
interface FavoritePsychologist {
  id: number;
  name: string;
  specialty: string;
  imageUrl: string | null;
}

const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ClientStats>({
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    favoritesPsychologists: 0,
    lastSessionDate: null,
    unreadMessages: 0
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[]>([]);
  const [favoritePsychologists, setFavoritePsychologists] = useState<FavoritePsychologist[]>([]);
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
            totalAppointments: 12,
            upcomingAppointments: 2,
            completedAppointments: 10,
            favoritesPsychologists: 3,
            lastSessionDate: '2023-11-28',
            unreadMessages: 2
          });
          
          // Simulación de citas próximas
          setUpcomingAppointments([
            {
              id: 1,
              psychologistName: 'Dr. Carlos Mendoza',
              date: '2023-12-05',
              time: '15:30',
              status: 'CONFIRMED'
            },
            {
              id: 2,
              psychologistName: 'Dra. Laura Vega',
              date: '2023-12-12',
              time: '10:00',
              status: 'PENDING_PAYMENT'
            }
          ]);
          
          // Simulación de psicólogos favoritos
          setFavoritePsychologists([
            {
              id: 1,
              name: 'Dr. Carlos Mendoza',
              specialty: 'Terapia Cognitivo-Conductual',
              imageUrl: null
            },
            {
              id: 2,
              name: 'Dra. Laura Vega',
              specialty: 'Psicología Familiar',
              imageUrl: null
            },
            {
              id: 3,
              name: 'Dr. Miguel Ángel Santos',
              specialty: 'Ansiedad y Depresión',
              imageUrl: null
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
              
              {stats.unreadMessages > 0 && (
                <div className="mt-3 bg-white/20 rounded-md p-2 text-sm">
                  <div className="flex items-center">
                    <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                    <span>Tienes {stats.unreadMessages} mensaje{stats.unreadMessages !== 1 ? 's' : ''} sin leer</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Estadísticas principales */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
              
              {/* Psicólogos favoritos */}
              <div className="bg-white rounded-lg p-3 border border-gray-200 flex flex-col">
                <div className="flex items-center mb-2">
                  <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center mr-2">
                    <HeartIcon className="h-4 w-4 text-red-500" />
                  </div>
                  <span className="text-xs font-medium text-gray-500">Favoritos</span>
                </div>
                <span className="text-xl font-semibold text-gray-800">{stats.favoritesPsychologists}</span>
              </div>
              
              {/* Progreso terapéutico */}
              <div className="bg-white rounded-lg p-3 border border-gray-200 flex flex-col">
                <div className="flex items-center mb-2">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-500">Progreso</span>
                </div>
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-green-400 h-full rounded-full" 
                      style={{ width: `${Math.min(stats.completedAppointments * 10, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-gray-500 ml-2">
                    {Math.min(stats.completedAppointments * 10, 100)}%
                  </span>
                </div>
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

          {/* Sección de dos columnas: próximas citas y psicólogos favoritos */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            variants={itemVariants}
          >
            {/* Próximas citas */}
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

            {/* Psicólogos favoritos */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-3 border-b border-gray-100">
                <h3 className="font-medium text-gray-800 text-sm">Mis psicólogos favoritos</h3>
              </div>

              {favoritePsychologists.length > 0 ? (
                <>
                  <div className="divide-y divide-gray-100">
                    {favoritePsychologists.map(psychologist => (
                      <div key={psychologist.id} className="p-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 mr-3">
                            {psychologist.imageUrl ? (
                              <img 
                                src={psychologist.imageUrl} 
                                alt={psychologist.name} 
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <UserIcon className="h-6 w-6 text-gray-400 m-2" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-800 text-sm truncate">
                              {psychologist.name}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {psychologist.specialty}
                            </div>
                          </div>
                          <Link 
                            to={`/psychologists/${psychologist.id}`}
                            className="ml-2 text-[#2A6877] hover:text-[#1d4e5f] text-xs font-medium flex items-center"
                          >
                            Ver perfil
                            <ArrowRightIcon className="h-3 w-3 ml-1" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 text-center border-t border-gray-100">
                    <Link 
                      to="/psychologists" 
                      className="text-[#2A6877] hover:text-[#1d4e5f] text-xs font-medium"
                    >
                      Buscar más psicólogos →
                    </Link>
                  </div>
                </>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <HeartIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="font-medium text-gray-600 text-sm mb-1">Aún no tienes psicólogos favoritos</p>
                  <p className="text-xs text-gray-500 mb-3">
                    Marca tus especialistas preferidos
                  </p>
                  <Link 
                    to="/psychologists"
                    className="inline-flex items-center text-[#2A6877] hover:text-[#1d4e5f] text-xs font-medium"
                  >
                    Buscar psicólogos
                    <ArrowRightIcon className="h-3 w-3 ml-1" />
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* Sección de Recursos y Bienestar */}
          <motion.div 
            className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200"
            variants={itemVariants}
          >
            <div className="p-3 border-b border-gray-100">
              <h3 className="font-medium text-gray-800 text-sm">Recursos de bienestar</h3>
              <p className="text-gray-500 text-xs">Artículos y recursos para tu salud mental</p>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <h4 className="font-medium text-sm text-gray-800 mb-1">Artículos recomendados</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-xs text-blue-600 hover:underline flex items-center">
                      <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                      Técnicas de respiración para reducir la ansiedad
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-xs text-blue-600 hover:underline flex items-center">
                      <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                      Cómo mejorar la calidad del sueño
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-xs text-blue-600 hover:underline flex items-center">
                      <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                      Mindfulness: ejercicios prácticos para el día a día
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

export default ClientDashboard; 