import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import AppointmentFilters, { FilterValues } from '../../components/appointments/AppointmentFilters';
import AppointmentList from '../../components/appointments/AppointmentList';
import { 
  AppointmentData, 
  getAdminPaymentVerifications,
  getPsychologistPendingPayments,
  updateAppointmentPaymentStatus,
  isFirstAppointment
} from '../../services/appointmentPaymentService';
import  api  from '../../services/api';
import toastService from '../../services/toastService';

const VerificationsPage = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<FilterValues>({});

  useEffect(() => {
    fetchAppointments();
  }, [filters]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (user?.user_type === 'admin') {
        try {
          // Para administradores, usar el endpoint de administración con los mismos filtros que ven los psicólogos
          const statusFilter = filters.status || 'PAYMENT_UPLOADED,PAYMENT_VERIFIED,CONFIRMED';
          
          const data = await getAdminPaymentVerifications({
            ...filters,
            status: statusFilter
          });
          
        // Manejar diferentes formatos de respuesta
          const appointmentsData = Array.isArray(data) ? data : (data as any).results || [];
        setAppointments(appointmentsData);
          
          console.log('Citas cargadas para admin:', appointmentsData.length);
        } catch (adminError: any) {
          console.error('Error específico de admin:', adminError);
          
          // Mantener los mensajes de error específicos ya que son importantes para diagnóstico
          if (adminError.response) {
            const statusCode = adminError.response.status;
            if (statusCode === 404) {
              toastService.error('La ruta de verificación de pagos no se encuentra disponible. Contacte al administrador del sistema.');
              
              // Intento directo de obtener las citas como último recurso
              try {
                const response = await api.get('/appointments/');
                const allAppointments = response.data;
                // Filtrar manualmente las citas que nos interesan
                const filteredAppointments = allAppointments.filter((app: any) => 
                  ['PAYMENT_UPLOADED', 'PAYMENT_VERIFIED', 'CONFIRMED'].includes(app.status)
                );
                setAppointments(filteredAppointments);
              } catch (fallbackError) {
                console.error('Falló el intento alternativo:', fallbackError);
              }
            } else if (statusCode === 403) {
              toastService.error('No tienes permisos para acceder a este recurso');
            } else {
              toastService.error(`Error ${statusCode}: ${adminError.response.data?.detail || 'Error desconocido'}`);
            }
          } else if (adminError.request) {
            toastService.error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
          } else {
            toastService.error('Error al cargar las verificaciones: ' + adminError.message);
          }
          
          throw adminError;
        }
      } else if (user?.user_type === 'psychologist') {
        // Para psicólogos, usar el endpoint existente
        const data = await getPsychologistPendingPayments({
          ...filters,
          status: filters.status || 'PAYMENT_UPLOADED,PAYMENT_VERIFIED,CONFIRMED'
        });
        
        // Manejar diferentes formatos de respuesta
        const appointmentsData = Array.isArray(data) ? data : (data as any).results || [];
        setAppointments(appointmentsData);
        
        console.log('Citas cargadas para psicólogo:', appointmentsData.length);
      } else {
        setError(new Error('Tipo de usuario no autorizado'));
        toastService.error('Tu tipo de usuario no está autorizado para acceder a esta página');
      }
    } catch (err: any) {
      setError(err as Error);
      console.error('Error al cargar las citas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
  };

  const handleVerifyPayment = async (appointmentId: number) => {
    try {
      toast.dismiss();
      setIsLoading(true);
      
      // Verificar si es la primera cita entre psicólogo y cliente usando el backend
      const isFirst = await isFirstAppointment(appointmentId);
      
      // Comprobar si el usuario es psicólogo y si es la primera cita
      if (user?.user_type === 'psychologist' && isFirst) {
        toastService.error('No tienes permisos para verificar la primera cita con un cliente. Solo un administrador puede hacerlo.');
        setIsLoading(false);
        return;
      }
      
      const result = await updateAppointmentPaymentStatus(appointmentId, {
        status: 'PAYMENT_VERIFIED',
        notes: user?.user_type === 'admin' ? 'Pago verificado por el administrador' : 'Pago verificado por el psicólogo'
      });
      
      if (result) {
        // Actualiza la lista localmente para evitar tener que recargar todo
        setAppointments(prevAppointments => 
          prevAppointments.map(app => 
            app.id === appointmentId 
              ? { ...app, status: 'PAYMENT_VERIFIED', status_display: 'Pago Verificado' } 
              : app
          )
        );
        toastService.success('Pago verificado correctamente');
      }
    } catch (err) {
      toastService.error('Error al verificar el pago');
      console.error('Error al verificar el pago:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAppointment = async (appointmentId: number) => {
    try {
      toast.dismiss();
      setIsLoading(true);
      
      const result = await updateAppointmentPaymentStatus(appointmentId, {
        status: 'CONFIRMED',
        notes: 'Cita confirmada'
      });
      
      if (result) {
        // Actualiza la lista localmente
        setAppointments(prevAppointments => 
          prevAppointments.map(app => 
            app.id === appointmentId 
              ? { ...app, status: 'CONFIRMED', status_display: 'Confirmada' } 
              : app
          )
        );
        
        // Si la lista se queda vacía después de confirmar, volvemos a cargar
        setTimeout(() => {
          const appointmentExists = appointments.some(app => app.id === appointmentId);
          if (appointmentExists) {
      fetchAppointments();
          }
        }, 300);
      }
    } catch (err) {
      toastService.error('Error al confirmar la cita');
      console.error('Error al confirmar la cita:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {user?.user_type === 'admin' ? 'Verificación de Pagos (Admin)' : 'Mis Pagos Pendientes'}
        </h1>
          {user?.user_type === 'admin' && (
            <p className="mt-1 text-sm text-gray-500">
              Visualizando citas de todos los psicólogos con estado de pago pendiente o verificado
            </p>
          )}
        </div>
        <button
          onClick={fetchAppointments}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-[#2A6877] hover:bg-[#2A6877]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A6877]"
        >
          Actualizar
        </button>
      </div>
      
      <div className="space-y-6">
        <AppointmentFilters onFilterChange={handleFilterChange} />
        
        {appointments.length > 0 && user?.user_type === 'admin' && (
          <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
            <p className="text-sm text-blue-800">
              Mostrando {appointments.length} citas de verificación de pagos para todos los psicólogos
            </p>
          </div>
        )}
        
        <AppointmentList
          appointments={appointments}
          isLoading={isLoading}
          error={error}
          onVerifyPayment={handleVerifyPayment}
          onConfirmAppointment={handleConfirmAppointment}
        />
      </div>
    </div>
  );
};

export default VerificationsPage;