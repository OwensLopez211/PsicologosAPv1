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

// Componente para métricas
const MetricCard = ({ icon: Icon, label, value, iconBg }: {
  icon: React.ComponentType<any>;
  label: string;
  value: number;
  iconBg: string;
}) => (
  <div className="flex items-center gap-3 p-4">
    <div className={`p-2 rounded-lg ${iconBg}`}>
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-xl font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

// Componente para citas
const AppointmentCard = ({ appointment }: { appointment: UpcomingAppointment }) => {
  const statusConfig = STATUS_CONFIG.appointment[appointment.status as keyof typeof STATUS_CONFIG.appointment] || 
    { color: 'bg-gray-50 text-gray-700', text: 'Desconocido' };

  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{appointment.clientName}</h4>
        <p className="text-sm text-gray-600">
          {new Date(appointment.date).toLocaleDateString('es-ES', { 
            month: 'short', 
            day: 'numeric' 
          })} • {appointment.time}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
          {statusConfig.text}
        </span>
        <Link 
          to={`/dashboard/appointments/${appointment.id}`}
          className="text-[#2A6877] hover:text-[#1d4e5f] p-1"
        >
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

const PsychologistDashboard: React.FC = () => {
  const [stats, setStats] = useState<PsychologistStats>({
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    activeClients: 0,
    pendingPayments: 0
  });
  const [verificationStatus, setVerificationStatus] = useState<{ verification_status: string, verification_status_display: string }>({
    verification_status: 'PENDING',
    verification_status_display: 'Pendiente'
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, appointmentsData, verificationData] = await Promise.all([
          PsychologistDashboardService.getDashboardStats(),
          PsychologistDashboardService.getUpcomingAppointments(),
          PsychologistDashboardService.getVerificationStatus()
        ]);
        setStats(statsData);
        setUpcomingAppointments(appointmentsData);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#2A6877] border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="text-[#2A6877] hover:text-[#1d4e5f] font-medium"
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Estado de verificación */}
      {verificationStatus.verification_status !== 'VERIFIED' && (
        <div className={`p-4 rounded-xl border ${verificationConfig.color} flex items-center justify-between`}>
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
        </div>
      )}

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#2A6877]/10 rounded-xl">
              <CalendarIcon className="h-8 w-8 text-[#2A6877]" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Citas atendidas</p>
              <h2 className="text-3xl font-bold text-gray-900">{stats.totalAppointments}</h2>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <MetricCard 
            icon={UsersIcon}
            label="Pacientes activos"
            value={stats.activeClients}
            iconBg="bg-blue-50 text-blue-600"
          />
        </div>
      </div>

      {/* Métricas secundarias */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <MetricCard 
            icon={ClockIcon}
            label="Citas próximas"
            value={stats.pendingAppointments}
            iconBg="bg-purple-50 text-purple-600"
          />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <MetricCard 
            icon={CurrencyDollarIcon}
            label="Pagos pendientes"
            value={stats.pendingPayments}
            iconBg="bg-green-50 text-green-600"
          />
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Acciones rápidas</h3>
        <div className="flex gap-3">
          <Link 
            to="/dashboard/appointments"
            className="flex items-center gap-2 px-4 py-2 bg-[#2A6877] text-white rounded-lg hover:bg-[#1d4e5f] transition-colors"
          >
            <CalendarIcon className="h-4 w-4" />
            Gestionar citas
          </Link>
          <Link 
            to="/dashboard/clients"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <UsersIcon className="h-4 w-4" />
            Ver pacientes
          </Link>
        </div>
      </div>

      {/* Próximas citas */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Próximas citas</h3>
          <p className="text-sm text-gray-600">Tus citas más cercanas</p>
        </div>

        {upcomingAppointments.length > 0 ? (
          <>
            <div className="divide-y divide-gray-100">
              {upcomingAppointments.map(appointment => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
            <div className="p-6 text-center border-t border-gray-100">
              <Link 
                to="/dashboard/appointments" 
                className="text-[#2A6877] hover:text-[#1d4e5f] font-medium"
              >
                Ver todas las citas →
              </Link>
            </div>
          </>
        ) : (
          <div className="p-12 text-center">
            <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h4 className="font-medium text-gray-900 mb-2">No hay citas próximas</h4>
            <p className="text-sm text-gray-600">Tu agenda está libre por ahora</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PsychologistDashboard;