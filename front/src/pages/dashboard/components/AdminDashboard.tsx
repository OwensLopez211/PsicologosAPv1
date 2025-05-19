import React, { useState, useEffect } from 'react';
import { 
  UserGroupIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import AdminService, { AdminStats, PendingPsychologist } from '../../../services/AdminService';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    verifiedUsers: 0,
    pendingUsers: 0,
    rejectedUsers: 0,
    clientUsers: 0
  });
  const [pendingPsychologists, setPendingPsychologists] = useState<PendingPsychologist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiBaseUrl, setApiBaseUrl] = useState<string>('');
  const [showDebug, setShowDebug] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Verificar la URL base para depuración
        const baseUrl = await AdminService.checkApiUrl();
        setApiBaseUrl(baseUrl);
        
        // Obtener estadísticas del dashboard
        try {
          const statsData = await AdminService.getDashboardStats();
          setStats(statsData);
        } catch (statsError) {
          console.error('Error al cargar estadísticas:', statsError);
          setError('No se pudieron cargar las estadísticas del dashboard');
        }
        
        // Obtener psicólogos pendientes (intento independiente)
        try {
          const pendingData = await AdminService.getPendingPsychologists(3);
          setPendingPsychologists(pendingData);
        } catch (pendingError) {
          console.error('Error al cargar psicólogos pendientes:', pendingError);
          // No establecemos error global para que al menos se muestren las estadísticas si están disponibles
        }
        
      } catch (err) {
        console.error('Error general al cargar datos del dashboard:', err);
        setError('No se pudieron cargar los datos del dashboard. Verifica la conexión al servidor.');
      } finally {
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

  // Calcular porcentajes para las barras de progreso
  const getVerifiedPercentage = () => {
    return stats.totalUsers > 0 ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100) : 0;
  };
  
  const getPendingPercentage = () => {
    return stats.totalUsers > 0 ? Math.round((stats.pendingUsers / stats.totalUsers) * 100) : 0;
  };
  
  const getRejectedPercentage = () => {
    return stats.totalUsers > 0 ? Math.round((stats.rejectedUsers / stats.totalUsers) * 100) : 0;
  };

  const getClientPercentage = () => {
    return stats.totalUsers > 0 ? Math.round((stats.clientUsers / stats.totalUsers) * 100) : 0;
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Panel de depuración básico */}
      {(error || showDebug) && (
        <motion.div 
          variants={itemVariants}
          className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-yellow-800">Información del sistema</h3>
            <button 
              onClick={() => setShowDebug(!showDebug)}
              className="text-sm text-yellow-600 hover:text-yellow-800"
            >
              {showDebug ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          
          {showDebug && (
            <div className="space-y-2 text-sm text-yellow-700">
              <p><strong>URL Base:</strong> {apiBaseUrl}</p>
              
              {/* Datos de estadísticas */}
              <div className="mt-2 pt-2 border-t border-yellow-200">
                <div className="flex justify-between items-center">
                  <p className="font-medium">Estadísticas:</p>
                  <button 
                    onClick={async () => {
                      setLoading(true);
                      try {
                        // Forzar actualización
                        const freshStats = await AdminService.getDashboardStats();
                        setStats(freshStats);
                        
                        // Actualizar también psicólogos pendientes
                        const pendingData = await AdminService.getPendingPsychologists(3);
                        setPendingPsychologists(pendingData);
                      } catch (err) {
                        console.error("Error al actualizar datos:", err);
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-xs flex items-center"
                  >
                    <svg className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0114 0V5a1 1 0 112 0v2.101a9.002 9.002 0 01-14.712 6.975 1 1 0 111.296-1.52A7.002 7.002 0 114 15.899V18a1 1 0 11-2 0v-2.101a7.002 7.002 0 010-13.798V2a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Actualizar datos
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="bg-white p-2 rounded text-xs">
                    <p><strong>Total Usuarios:</strong> {stats.totalUsers}</p>
                    <p><strong>Pacientes:</strong> {stats.clientUsers}</p>
                  </div>
                  <div className="bg-white p-2 rounded text-xs">
                    <p><strong>Psicólogos pendientes:</strong> {stats.pendingUsers}</p>
                    <p><strong>Psicólogos verificados:</strong> {stats.verifiedUsers}</p>
                  </div>
                </div>
              </div>
              
              {error && (
                <p className="mt-2 pt-2 border-t border-yellow-200 text-red-600"><strong>Error:</strong> {error}</p>
              )}
            </div>
          )}
        </motion.div>
      )}
      
      {/* Contador principal y estadísticas de usuarios - REDISEÑADO */}
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
          {/* Estadísticas principales - Rediseñado en estilo ShadCN */}
          <motion.div variants={itemVariants} className="mb-6">
            {/* Tarjeta principal con contador total */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex items-center p-4 gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Total usuarios</p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">{stats.totalUsers}</h2>
                </div>
                <div className="h-12 w-12 bg-[#2A6877]/10 rounded-full flex items-center justify-center">
                  <UserGroupIcon className="h-6 w-6 text-[#2A6877]" />
                </div>
              </div>
              
              {/* Métricas con diseño más compacto */}
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 border-t border-gray-100">
                {/* Pacientes */}
                <div className="p-3 flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Pacientes</span>
                    <div className="h-4 w-4 rounded-full bg-blue-100 flex items-center justify-center">
                      <UserGroupIcon className="h-2.5 w-2.5 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-1 flex items-end">
                    <span className="text-lg font-semibold text-gray-800">{stats.clientUsers}</span>
                    <span className="ml-1 text-xs text-blue-700">{getClientPercentage()}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1 mt-2">
                    <div 
                      className="bg-blue-600 h-1 rounded-full" 
                      style={{ width: `${getClientPercentage()}%` }}
                    ></div>
                  </div>
                </div>

                {/* Psicólogos Verificados */}
                <div className="p-3 flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Verificados</span>
                    <div className="h-4 w-4 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircleIcon className="h-2.5 w-2.5 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-1 flex items-end">
                    <span className="text-lg font-semibold text-gray-800">{stats.verifiedUsers}</span>
                    <span className="ml-1 text-xs text-green-700">{getVerifiedPercentage()}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1 mt-2">
                    <div 
                      className="bg-green-600 h-1 rounded-full" 
                      style={{ width: `${getVerifiedPercentage()}%` }}
                    ></div>
                  </div>
                </div>

                {/* Psicólogos Pendientes */}
                <div className="p-3 flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Pendientes</span>
                    <div className="h-4 w-4 rounded-full bg-yellow-100 flex items-center justify-center">
                      <ClockIcon className="h-2.5 w-2.5 text-yellow-600" />
                    </div>
                  </div>
                  <div className="mt-1 flex items-end">
                    <span className="text-lg font-semibold text-gray-800">{stats.pendingUsers}</span>
                    <span className="ml-1 text-xs text-yellow-700">{getPendingPercentage()}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1 mt-2">
                    <div 
                      className="bg-yellow-600 h-1 rounded-full" 
                      style={{ width: `${getPendingPercentage()}%` }}
                    ></div>
                  </div>
                </div>

                {/* Psicólogos Rechazados */}
                <div className="p-3 flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Rechazados</span>
                    <div className="h-4 w-4 rounded-full bg-red-100 flex items-center justify-center">
                      <XCircleIcon className="h-2.5 w-2.5 text-red-600" />
                    </div>
                  </div>
                  <div className="mt-1 flex items-end">
                    <span className="text-lg font-semibold text-gray-800">{stats.rejectedUsers}</span>
                    <span className="ml-1 text-xs text-red-700">{getRejectedPercentage()}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1 mt-2">
                    <div 
                      className="bg-red-600 h-1 rounded-full" 
                      style={{ width: `${getRejectedPercentage()}%` }}
                    ></div>
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
                to="/admin/dashboard/psychologists"
                className="flex-1 sm:flex-none px-3 py-1.5 bg-[#2A6877] text-white text-xs rounded-md hover:bg-[#1d4e5f] transition-colors flex items-center justify-center"
              >
                <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />
                Verificar psicólogos
              </Link>
              <Link 
                to="/admin/dashboard/pacients"
                className="flex-1 sm:flex-none px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <UserGroupIcon className="h-3.5 w-3.5 mr-1" />
                Ver todos los usuarios
              </Link>
            </div>
          </motion.div>

          {/* Sección de psicólogos pendientes de verificación */}
          <motion.div 
            className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200"
            variants={itemVariants}
          >
            <div className="p-3 border-b border-gray-100">
              <h3 className="font-medium text-gray-800 text-sm">Psicólogos pendientes</h3>
              <p className="text-gray-500 text-xs">Los más recientes que requieren tu atención</p>
            </div>

            {pendingPsychologists.length > 0 ? (
              <>
                <div className="divide-y divide-gray-100">
                  {pendingPsychologists.map(psychologist => (
                    <div key={psychologist.id} className="p-3 hover:bg-gray-50 transition-colors flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-[#2A6877]/10 flex items-center justify-center">
                          {psychologist.profile_image ? (
                            <img 
                              src={psychologist.profile_image} 
                              alt={`${psychologist.user.first_name} ${psychologist.user.last_name}`} 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <UserGroupIcon className="h-4 w-4 text-[#2A6877]" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800 text-sm">
                            {psychologist.user.first_name} {psychologist.user.last_name}
                          </div>
                          <div className="flex items-center">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              <ClockIcon className="h-2.5 w-2.5 mr-0.5" />
                              Pendiente
                            </span>
                          </div>
                        </div>
                      </div>
                      <Link 
                        to={`/admin/dashboard/psychologists/${psychologist.id}`}
                        className="text-[#2A6877] hover:text-[#1d4e5f] text-xs font-medium flex items-center"
                      >
                        Revisar
                        <ArrowRightIcon className="h-3 w-3 ml-1" />
                      </Link>
                    </div>
                  ))}
                </div>

                <div className="p-3 text-center">
                  <Link 
                    to="/admin/dashboard/psychologists" 
                    className="text-[#2A6877] hover:text-[#1d4e5f] text-xs font-medium"
                  >
                    Ver todos los psicólogos pendientes →
                  </Link>
                </div>
              </>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <CheckCircleIcon className="h-8 w-8 text-green-300 mx-auto mb-2" />
                <p className="font-medium text-gray-600 text-sm mb-1">No hay psicólogos pendientes</p>
                <p className="text-xs text-gray-500 mb-3">
                  ¡Todos los psicólogos han sido revisados!
                </p>
                <button 
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const pendingData = await AdminService.getPendingPsychologists(3);
                      setPendingPsychologists(pendingData);
                    } catch (err) {
                      console.error("Error al recargar psicólogos:", err);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="mt-2 text-xs text-[#2A6877] hover:underline flex items-center justify-center mx-auto"
                >
                  <svg className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0114 0V5a1 1 0 112 0v2.101a9.002 9.002 0 01-14.712 6.975 1 1 0 111.296-1.52A7.002 7.002 0 114 15.899V18a1 1 0 11-2 0v-2.101a7.002 7.002 0 010-13.798V2a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Verificar nuevamente
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

export default AdminDashboard;