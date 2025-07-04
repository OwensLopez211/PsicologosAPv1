import api from './api';

export interface UpcomingAppointment {
  id: number;
  client_name: string;
  date: string;
  time: string;
  status: string;
}

export interface PsychologistStats {
  totalAppointments: number;
  completedAppointments: number;
  pendingPaymentAppointments: number;
  activeClients: number;
  upcomingAppointments: UpcomingAppointment[];
}

class PsychologistDashboardService {
  /**
   * Obtiene las estadísticas del dashboard del psicólogo autenticado
   */
  async getDashboardStats(): Promise<PsychologistStats> {
    try {
      const response = await api.get('/appointments/psychologist-stats/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas del psicólogo:', error);
      // Devolver datos vacíos en caso de error
      return {
        totalAppointments: 0,
        completedAppointments: 0,
        pendingPaymentAppointments: 0,
        activeClients: 0,
        upcomingAppointments: []
      };
    }
  }

  /**
   * Obtiene las próximas citas del psicólogo autenticado
   */
  async getUpcomingAppointments(): Promise<UpcomingAppointment[]> {
    try {
      const response = await api.get('/appointments/my-appointments/', {
        params: {
          status: 'CONFIRMED,PAYMENT_VERIFIED',
          start_date: new Date().toISOString().split('T')[0]
        }
      });
      // Si la respuesta está paginada
      const results = response.data.results || response.data;
      return (results as any[]).map((appointment: any) => ({
        id: appointment.id,
        client_name: appointment.client_name,
        date: appointment.date,
        time: appointment.start_time,
        status: appointment.status
      }));
    } catch (error) {
      console.error('Error al obtener próximas citas del psicólogo:', error);
      return [];
    }
  }

  /**
   * Obtiene el estado de verificación real del psicólogo autenticado
   */
  async getVerificationStatus(): Promise<{ verification_status: string, verification_status_display: string }> {
    try {
      const response = await api.get('/profiles/psychologist-profiles/me/verification-status/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener el estado de verificación:', error);
      return {
        verification_status: 'PENDING',
        verification_status_display: 'Pendiente'
      };
    }
  }
}

export default new PsychologistDashboardService(); 