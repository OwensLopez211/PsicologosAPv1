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
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

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

  // Formatear la fecha relativa
  const formatRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: es });
    } catch (error) {
      return 'Fecha desconocida';
    }
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Panel de depuración temporal - Solo en desarrollo */}
      {(error || showDebug) && (
        <motion.div 
          variants={itemVariants}
          className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-yellow-800">Información de depuración</h3>
            <button 
              onClick={() => setShowDebug(!showDebug)}
              className="text-sm text-yellow-600 hover:text-yellow-800"
            >
              {showDebug ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          
          {showDebug && (
            <div className="space-y-2 text-sm text-yellow-700">
              <p><strong>URL Base de API:</strong> {apiBaseUrl}</p>
              
              {/* Datos recibidos del servidor */}
              <div className="mt-2 pt-2 border-t border-yellow-200">
                <div className="flex justify-between items-center">
                  <p className="font-medium">Datos recibidos del servidor:</p>
                  <button 
                    onClick={async () => {
                      setLoading(true);
                      try {
                        // Forzar actualización ignorando cache
                        const freshStats = await AdminService.getDashboardStats();
                        setStats(freshStats);
                      } catch (err) {
                        console.error("Error al actualizar estadísticas:", err);
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 text-xs flex items-center"
                  >
                    <svg className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0114 0V5a1 1 0 112 0v2.101a9.002 9.002 0 01-14.712 6.975 1 1 0 111.296-1.52A7.002 7.002 0 114 15.899V18a1 1 0 11-2 0v-2.101a7.002 7.002 0 010-13.798V2a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Actualizar
                  </button>
                </div>
                <pre className="bg-yellow-100 p-2 rounded text-xs mt-1 overflow-auto">
                  {JSON.stringify(stats, null, 2)}
                </pre>
              </div>
              
              {error && (
                <p><strong>Error:</strong> {error}</p>
              )}
              
              {/* Botón para prueba de diagnóstico */}
              <div className="mt-3 pt-3 border-t border-yellow-200">
                <button 
                  onClick={async () => {
                    try {
                      const diagnosticInfo = await AdminService.debugPendingPsychologists();
                      console.log('Diagnóstico API:', diagnosticInfo);
                      alert('Diagnóstico completado. Ver resultados en la consola del navegador (F12 > Console)');
                    } catch (err) {
                      console.error('Error al ejecutar diagnóstico:', err);
                    }
                  }}
                  className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 text-xs"
                >
                  Ejecutar diagnóstico de API
                </button>
                <p className="mt-2 text-xs text-yellow-600">
                  Este diagnóstico verificará las URLs del API y mostrará información detallada de los errores en la consola.
                </p>
              </div>
              
              <p className="mt-3 text-xs text-yellow-600">
                Si las URLs no coinciden con la estructura del backend, ajusta el servicio AdminService.ts
              </p>
            </div>
          )}
        </motion.div>
      )}
      
      {/* Contador principal de usuarios */}
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
          {/* Estadísticas principales */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="text-center mb-1">
              <h2 className="text-5xl font-bold text-gray-800">{stats.totalUsers}</h2>
              <p className="text-gray-600 text-sm mt-1">Usuarios activos (clientes y psicólogos)</p>
            </div>
            
            {/* Tarjetas de estadísticas en formato horizontal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {/* Pacientes */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center space-x-2">
                  <UserGroupIcon className="h-5 w-5 text-blue-600" />
                  <span className="text-blue-800 font-medium">Pacientes</span>
                  <span className="text-blue-800 font-bold ml-auto">{stats.clientUsers}</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${getClientPercentage()}%` }}
                  ></div>
                </div>
                <div className="text-xs text-blue-800 mt-1 text-right">
                  {getClientPercentage()}% del total
                </div>
              </div>

              {/* Psicólogos Verificados */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 font-medium">Psicólogos Verificados</span>
                  <span className="text-green-800 font-bold ml-auto">{stats.verifiedUsers}</span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${getVerifiedPercentage()}%` }}
                  ></div>
                </div>
                <div className="text-xs text-green-800 mt-1 text-right">
                  {getVerifiedPercentage()}% del total
                </div>
              </div>

              {/* Psicólogos Pendientes */}
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-5 w-5 text-yellow-600" />
                  <span className="text-yellow-800 font-medium">Psicólogos Pendientes</span>
                  <span className="text-yellow-800 font-bold ml-auto">{stats.pendingUsers}</span>
                </div>
                <div className="w-full bg-yellow-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full" 
                    style={{ width: `${getPendingPercentage()}%` }}
                  ></div>
                </div>
                <div className="text-xs text-yellow-800 mt-1 text-right">
                  {getPendingPercentage()}% del total
                </div>
              </div>

              {/* Psicólogos Rechazados */}
              <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                <div className="flex items-center space-x-2">
                  <XCircleIcon className="h-5 w-5 text-red-600" />
                  <span className="text-red-800 font-medium">Psicólogos Rechazados</span>
                  <span className="text-red-800 font-bold ml-auto">{stats.rejectedUsers}</span>
                </div>
                <div className="w-full bg-red-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full" 
                    style={{ width: `${getRejectedPercentage()}%` }}
                  ></div>
                </div>
                <div className="text-xs text-red-800 mt-1 text-right">
                  {getRejectedPercentage()}% del total
                </div>
              </div>
            </div>
          </motion.div>

          {/* Barra de acciones rápidas */}
          <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex justify-between items-center">
            <h3 className="font-medium text-gray-800">Acciones rápidas</h3>
            <div className="flex space-x-3">
              <Link 
                to="/admin/dashboard/psychologists"
                className="px-4 py-2 bg-[#2A6877] text-white text-sm rounded-md hover:bg-[#1d4e5f] transition-colors flex items-center"
              >
                <CheckCircleIcon className="h-4 w-4 mr-1.5" />
                Verificar psicólogos
              </Link>
              <Link 
                to="/admin/dashboard/pacients"
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors flex items-center"
              >
                <UserGroupIcon className="h-4 w-4 mr-1.5" />
                Ver todos los usuarios
              </Link>
            </div>
          </motion.div>

          {/* Sección de psicólogos pendientes de verificación */}
          <motion.div 
            className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200"
            variants={itemVariants}
          >
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-medium text-gray-800">Psicólogos pendientes de verificación</h3>
              <p className="text-gray-500 text-sm">Los más recientes que requieren tu atención</p>
            </div>

            {pendingPsychologists.length > 0 ? (
              <>
                <div className="divide-y divide-gray-100">
                  {pendingPsychologists.map(psychologist => (
                    <div key={psychologist.id} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-[#2A6877]/10 flex items-center justify-center">
                          {psychologist.profile_image ? (
                            <img 
                              src={psychologist.profile_image} 
                              alt={`${psychologist.user.first_name} ${psychologist.user.last_name}`} 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <UserGroupIcon className="h-5 w-5 text-[#2A6877]" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">
                            {psychologist.user.first_name} {psychologist.user.last_name}
                          </div>
                          <div className="flex items-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              Pendiente de verificación
                            </span>
                          </div>
                        </div>
                      </div>
                      <Link 
                        to={`/admin/dashboard/psychologists/${psychologist.id}`}
                        className="text-[#2A6877] hover:text-[#1d4e5f] text-sm font-medium flex items-center"
                      >
                        Revisar
                        <ArrowRightIcon className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                  ))}
                </div>

                <div className="p-4 text-center">
                  <Link 
                    to="/admin/dashboard/psychologists" 
                    className="text-[#2A6877] hover:text-[#1d4e5f] text-sm font-medium"
                  >
                    Ver todos los psicólogos pendientes →
                  </Link>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="font-medium text-gray-600 mb-1">No hay psicólogos pendientes de verificación</p>
                <p className="text-sm text-gray-500 mb-3">
                  Actualmente no hay psicólogos esperando ser verificados en el sistema.
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
                  className="mt-3 text-sm text-[#2A6877] hover:underline flex items-center justify-center mx-auto"
                >
                  <svg className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
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