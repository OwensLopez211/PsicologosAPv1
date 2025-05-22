import React, { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  CalendarIcon, 

  DocumentCheckIcon,
  ClockIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PsychologistDashboardService, { PsychologistStats, UpcomingAppointment } from '../../../services/PsychologistDashboardService';

// Configuración de estados
const STATUS_CONFIG = {
  verification: {
    VERIFIED: { color: 'bg-green-50 text-green-700 border-green-200', text: 'Verificado' },
    DOCUMENTS_SUBMITTED: { color: 'bg-amber-50 text-amber-700 border-amber-200', text: 'Documentos entregados' },
    PENDING: { color: 'bg-amber-50 text-amber-700 border-amber-200', text: 'Pendiente' },
    REJECTED: { color: 'bg-red-50 text-red-700 border-red-200', text: 'Rechazado' }
  },
  appointment: {
    CONFIRMED: { color: 'bg-green-50 text-green-700', text: 'Confirmada' },
    PENDING_PAYMENT: { color: 'bg-amber-50 text-amber-700', text: 'Pendiente pago' },
    CANCELED: { color: 'bg-red-50 text-red-700', text: 'Cancelada' }
  }
};

const PsychologistDashboard: React.FC = () => {
  const [stats, setStats] = useState<PsychologistStats>({
    totalAppointments: 0,
    completedAppointments: 0,
    pendingPaymentAppointments: 0,
    activeClients: 0,
    upcomingAppointments: []
  });
  const [verificationStatus, setVerificationStatus] = useState<{ verification_status: string, verification_status_display: string }>({
    verification_status: 'PENDING',
    verification_status_display: 'Pendiente'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, verificationData] = await Promise.all([
          PsychologistDashboardService.getDashboardStats(),
          PsychologistDashboardService.getVerificationStatus()
        ]);
        setStats(statsData);
        setVerificationStatus(verificationData);
      } catch (err) {
        console.error('Error al cargar datos del dashboard:', err);
        setError('No se pudieron cargar los datos. Intenta nuevamente.');
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
  const getTotalPercentage = () => {
    const total = stats.totalAppointments + stats.pendingPaymentAppointments + stats.completedAppointments;
    return total > 0 ? Math.round((stats.totalAppointments / total) * 100) : 0;
  };

  const getPendingPercentage = () => {
    const total = stats.totalAppointments + stats.pendingPaymentAppointments + stats.completedAppointments;
    return total > 0 ? Math.round((stats.pendingPaymentAppointments / total) * 100) : 0;
  };

  const getCompletedPercentage = () => {
    const total = stats.totalAppointments + stats.pendingPaymentAppointments + stats.completedAppointments;
    return total > 0 ? Math.round((stats.completedAppointments / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#2A6877]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 text-center text-red-500">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-[#2A6877] hover:underline"
        >
          Intentar nuevamente
        </button>
      </div>
    );
  }

  const verificationConfig = STATUS_CONFIG.verification[verificationStatus.verification_status as keyof typeof STATUS_CONFIG.verification] || 
    { color: 'bg-gray-50 text-gray-700 border-gray-200', text: verificationStatus.verification_status_display };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Estado de verificación */}
      {verificationStatus.verification_status !== 'VERIFIED' && (
        <motion.div 
          variants={itemVariants}
          className={`p-4 rounded-xl border ${verificationConfig.color} flex items-center justify-between`}
        >
          <div className="flex items-center gap-3">
            <DocumentCheckIcon className="h-5 w-5" />
            <span className="font-medium">Estado: {verificationStatus.verification_status_display}</span>
          </div>
          <Link 
            to="/psicologo/dashboard/profile" 
            className="text-sm font-medium hover:underline"
          >
            Completar verificación
          </Link>
        </motion.div>
      )}

      {/* Estadísticas principales */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center p-4 gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500">Total de citas</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">{stats.totalAppointments}</h2>
            </div>
            <div className="h-12 w-12 bg-[#2A6877]/10 rounded-full flex items-center justify-center">
              <CalendarIcon className="h-6 w-6 text-[#2A6877]" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-y sm:divide-y-0 border-t border-gray-100">
            {/* Citas Completadas */}
            <div className="p-3 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Completadas</span>
                <div className="h-4 w-4 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircleIcon className="h-2.5 w-2.5 text-green-600" />
                </div>
              </div>
              <div className="mt-1 flex items-end">
                <span className="text-lg font-semibold text-gray-800">{stats.completedAppointments}</span>
                <span className="ml-1 text-xs text-green-700">{getCompletedPercentage()}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1 mt-2">
                <div 
                  className="bg-green-600 h-1 rounded-full" 
                  style={{ width: `${getCompletedPercentage()}%` }}
                ></div>
              </div>
            </div>

            {/* Citas Pendientes */}
            <div className="p-3 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Pendientes</span>
                <div className="h-4 w-4 rounded-full bg-yellow-100 flex items-center justify-center">
                  <ClockIcon className="h-2.5 w-2.5 text-yellow-600" />
                </div>
              </div>
              <div className="mt-1 flex items-end">
                <span className="text-lg font-semibold text-gray-800">{stats.pendingPaymentAppointments}</span>
                <span className="ml-1 text-xs text-yellow-700">{getPendingPercentage()}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1 mt-2">
                <div 
                  className="bg-yellow-600 h-1 rounded-full" 
                  style={{ width: `${getPendingPercentage()}%` }}
                ></div>
              </div>
            </div>

            {/* Pacientes Activos */}
            <div className="p-3 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Pacientes activos</span>
                <div className="h-4 w-4 rounded-full bg-blue-100 flex items-center justify-center">
                  <UsersIcon className="h-2.5 w-2.5 text-blue-600" />
                </div>
              </div>
              <div className="mt-1 flex items-end">
                <span className="text-lg font-semibold text-gray-800">{stats.activeClients}</span>
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

      {/* Próximas citas */}
      <motion.div 
        className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200"
        variants={itemVariants}
      >
        <div className="p-3 border-b border-gray-100">
          <h3 className="font-medium text-gray-800 text-sm">Próximas citas</h3>
          <p className="text-gray-500 text-xs">Tus citas más cercanas</p>
        </div>
        {stats.upcomingAppointments.length > 0 ? (
          <>
            <div className="divide-y divide-gray-100">
              {stats.upcomingAppointments.map(appointment => {
                const statusConfig = STATUS_CONFIG.appointment[appointment.status as keyof typeof STATUS_CONFIG.appointment] || { color: 'bg-gray-50 text-gray-700', text: appointment.status };
                return (
                  <div key={appointment.id} className="p-3 hover:bg-gray-50 transition-colors flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-[#2A6877]/10 flex items-center justify-center">
                        <UsersIcon className="h-4 w-4 text-[#2A6877]" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 text-sm">
                          {appointment.client_name}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {new Date(appointment.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })} • {appointment.time}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>{statusConfig.text}</span>
                        </div>
                      </div>
                    </div>
                    <Link 
                      to={`/dashboard/appointments/${appointment.id}`}
                      className="text-[#2A6877] hover:text-[#1d4e5f] text-xs font-medium flex items-center"
                    >
                      Ver detalles
                      <ArrowRightIcon className="h-3 w-3 ml-1" />
                    </Link>
                  </div>
                );
              })}
            </div>
            <div className="p-3 text-center">
              <Link 
                to="/dashboard/appointments" 
                className="text-[#2A6877] hover:text-[#1d4e5f] text-xs font-medium"
              >
                Ver todas las citas →
              </Link>
            </div>
          </>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <CalendarIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="font-medium text-gray-600 text-sm mb-1">No hay citas próximas</p>
            <p className="text-xs text-gray-500">
              Tu agenda está libre por ahora
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default PsychologistDashboard;