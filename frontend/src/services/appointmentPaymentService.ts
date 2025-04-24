import api from './api';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { ScheduleConfig, DaySlot, generateAvailableDays } from '../components/specialist-profile/scheduleUtils';

// Interface for existing appointments
export interface ExistingAppointment {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
}

// Interface for schedule response
interface ScheduleResponse {
  schedule_config: ScheduleConfig;
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
  isAvailable?: boolean;
}

export interface DailyAvailability {
  date: string;
  slots: TimeSlot[];
  hasAvailableSlots: boolean;
}

export interface AppointmentData {
  id: number;
  client: number;
  psychologist: number;
  date: string;
  start_time: string;
  end_time: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'PAYMENT_PENDING' | 'PENDING_PAYMENT' | 'PAYMENT_UPLOADED' | 'PAYMENT_VERIFIED' | 'NO_SHOW';
  status_display?: string;
  notes?: string;
  client_notes?: string;
  created_at: string;
  updated_at: string;
  client_details?: any;
  psychologist_details?: any;
  client_data?: {
    id: number;
    user_id: number;
    name: string;
    email: string;
    phone?: string;
    profile_image?: string | null;
  };
  psychologist_data?: {
    id: number;
    user_id: number;
    name: string;
    email: string;
    phone?: string;
    professional_title?: string;
    profile_image?: string | null;
  };
  payment_detail?: {
    id: number;
    payment_method: string;
    transaction_id?: string | null;
    payment_date?: string | null;
  };
  payment_proof?: string;
  payment_proof_url?: string;
  payment_amount?: number;
  meeting_link?: string;
}

// Helper function to determine if an ID is likely a profile ID or user ID
export const verifyPsychologistId = (psychologistId: number): void => {
  console.log('VERIFYING PSYCHOLOGIST ID:', psychologistId);
  
  // You can add additional checks here if needed
  if (psychologistId > 40) {
    console.warn('WARNING: This might be a User ID instead of a Profile ID!');
  } else {
    console.log('ID appears to be a valid Profile ID');
  }
};

// Function to get availability for a month
export const getMonthlyAvailability = async (
  psychologistId: number, 
  year: number, 
  month: number
): Promise<DailyAvailability[]> => {
  try {
    verifyPsychologistId(psychologistId);
    
    console.log(`Fetching monthly availability for psychologist ${psychologistId} for ${year}-${month+1}`);
    
    // Format as YYYY-MM
    const monthStr = (month + 1).toString().padStart(2, '0');
    const yearMonthStr = `${year}-${monthStr}`;
    
    const response = await api.get('/appointments/monthly_availability/', {
      params: {
        profile_id: psychologistId,
        year_month: yearMonthStr
      }
    });
    
    console.log('Monthly availability response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching monthly availability:', error);
    
    // Create a fallback by getting the number of days in the month and making individual requests
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const availability: DailyAvailability[] = [];
    
    // Only fetch for the current date and forward
    const currentDate = new Date();
    const startDay = (year === currentDate.getFullYear() && month === currentDate.getMonth()) 
      ? currentDate.getDate() 
      : 1;
    
    for (let day = startDay; day <= daysInMonth; day++) {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      try {
        const slots = await getAvailableTimeSlots(psychologistId, dateStr);
        availability.push({
          date: dateStr,
          slots,
          hasAvailableSlots: slots.length > 0
        });
      } catch (e) {
        // If there's an error for a specific date, just mark it as having no slots
        availability.push({
          date: dateStr,
          slots: [],
          hasAvailableSlots: false
        });
      }
    }
    
    return availability;
  }
};

// Function to get available time slots for a specific date
export const getAvailableTimeSlots = async (psychologistId: number, date: string): Promise<TimeSlot[]> => {
  try {
    console.log(`Fetching available slots for psychologist ${psychologistId} on date ${date}`);
    
    const response = await api.get('/appointments/available_slots/', {
      params: { 
        profile_id: psychologistId,
        date: date
      }
    });
    
    console.log('Available slots response:', response.data);
    
    // Add isAvailable property to each slot
    return response.data.map((slot: TimeSlot) => ({
      ...slot,
      isAvailable: true
    }));
  } catch (error) {
    console.error('Error fetching available slots:', error);
    toast.error('Error al obtener horarios disponibles', {
      id: 'unique-notification'
    });
    throw error;
  }
};

// Function to create a new appointment
export const createAppointment = async (appointmentData: {
  psychologist: number;
  date: string;
  start_time: string;
  end_time: string;
  notes?: string;
  payment_method?: string;
  client_notes?: string;
}): Promise<AppointmentData> => {
  try {
    console.log('Creating appointment with data:', appointmentData);
    
    // Asegurarnos de que la fecha se envía en el formato correcto (YYYY-MM-DD)
    // y que no se ve afectada por la zona horaria
    const originalDate = appointmentData.date;
    
    // Primero obtenemos los slots disponibles para ese día para verificar el ID de perfil
    await api.get('/appointments/available_slots/', {
      params: {
        profile_id: appointmentData.psychologist,
        date: originalDate
      }
    });
    
    // Si llegamos aquí, el ID funciona para obtener slots, así que lo usamos directamente
    // Asegurarnos de que la fecha no se modifica por la zona horaria
    const formattedDate = originalDate;
    console.log('Sending appointment with formatted date:', formattedDate);
    
    const response = await api.post('/appointments/create_appointment/', {
      ...appointmentData,
      date: formattedDate // Usar la fecha formateada correctamente
    });
    
    console.log('Appointment created:', response.data);
    toast.success('Cita agendada correctamente', {
      id: 'unique-notification'
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    
    // Si el error es porque el ID del psicólogo es incorrecto, intentamos obtener el ID correcto
    if (error.response && error.response.data && 
        error.response.data.psychologist && 
        error.response.data.psychologist[0].includes("inválida")) {
      
      try {
        // Intentamos obtener los slots disponibles para ese día
        await api.get('/appointments/available_slots/', {
          params: {
            profile_id: appointmentData.psychologist,
            date: appointmentData.date
          }
        });
        
        // Si llegamos aquí sin error, el problema no es el ID
        toast.error('Error al agendar la cita. Por favor, intenta de nuevo.', {
          id: 'unique-notification'
        });
      } catch (slotError: any) {
        toast.error('No se pudo encontrar el perfil del psicólogo. Por favor, contacta a soporte.', {
          id: 'unique-notification'
        });
      }
    } else {
      // Display a more specific error message if available
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.detail || 'Error al agendar la cita';
        toast.error(errorMessage, {
          id: 'unique-notification'
        });
      } else {
        toast.error('Error al agendar la cita', {
          id: 'unique-notification'
        });
      }
    }
    
    throw error;
  }
};

// Function to get all appointments for the current user
export const getUserAppointments = async (): Promise<AppointmentData[]> => {
  try {
    const response = await api.get('/appointments/my_appointments/');
    console.log('User appointments:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user appointments:', error);
    toast.error('Error al obtener tus citas', {
      id: 'unique-notification'
    });
    throw error;
  }
};

// Function to cancel an appointment
export const cancelAppointment = async (appointmentId: number): Promise<AppointmentData> => {
  try {
    const response = await api.patch(`/appointments/${appointmentId}/cancel_appointment/`);
    console.log('Appointment cancelled:', response.data);
    toast.success('Cita cancelada correctamente', {
      id: 'unique-notification'
    });
    return response.data;
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    toast.error('Error al cancelar la cita', {
      id: 'unique-notification'
    });
    throw error;
  }
};

// Function for psychologists to get their appointments
export const getPsychologistAppointments = async (): Promise<AppointmentData[]> => {
  try {
    const response = await api.get('/appointments/psychologist_appointments/');
    console.log('Psychologist appointments:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching psychologist appointments:', error);
    toast.error('Error al obtener las citas', {
      id: 'unique-notification'
    });
    throw error;
  }
};

// Function for psychologists to confirm an appointment
export const confirmAppointment = async (appointmentId: number): Promise<AppointmentData> => {
  try {
    const response = await api.patch(`/appointments/${appointmentId}/confirm_appointment/`);
    console.log('Appointment confirmed:', response.data);
    toast.success('Cita confirmada correctamente', {
      id: 'unique-notification'
    });
    return response.data;
  } catch (error) {
    console.error('Error confirming appointment:', error);
    toast.error('Error al confirmar la cita', {
      id: 'unique-notification'
    });
    throw error;
  }
};

// Function for psychologists to mark an appointment as completed
export const completeAppointment = async (appointmentId: number): Promise<AppointmentData> => {
  try {
    const response = await api.patch(`/appointments/${appointmentId}/complete_appointment/`);
    console.log('Appointment completed:', response.data);
    toast.success('Cita marcada como completada', {
      id: 'unique-notification'
    });
    return response.data;
  } catch (error) {
    console.error('Error completing appointment:', error);
    toast.error('Error al completar la cita', {
      id: 'unique-notification'
    });
    throw error;
  }
};

// Function to upload payment proof for an appointment
export const uploadPaymentProof = async (appointmentId: number, file: File): Promise<AppointmentData> => {
  try {
    const formData = new FormData();
    formData.append('payment_proof', file);
    
    const response = await api.post(`/appointments/${appointmentId}/upload-payment/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('Payment proof uploaded:', response.data);
    toast.success('Comprobante de pago subido correctamente', {
      id: 'unique-notification'
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading payment proof:', error);
    toast.error('Error al subir el comprobante de pago', {
      id: 'unique-notification'
    });
    throw error;
  }
};

// Function for admins to verify payment
export const verifyPayment = async (appointmentId: number, verified: boolean, adminNotes?: string): Promise<AppointmentData> => {
  try {
    const response = await api.post(`/appointments/${appointmentId}/verify-payment/`, {
      verified,
      admin_notes: adminNotes || ''
    });
    
    console.log('Payment verification:', response.data);
    toast.success(verified ? 'Pago verificado correctamente' : 'Pago rechazado', {
      id: 'unique-notification'
    });
    return response.data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    toast.error('Error al verificar el pago', {
      id: 'unique-notification'
    });
    throw error;
  }
};

// Function to get client appointments
export const getClientAppointments = async (): Promise<{
  upcoming: AppointmentData[];
  past: AppointmentData[];
  all: AppointmentData[];
}> => {
  try {
    const response = await api.get('/appointments/client-appointments');
    console.log('Client appointments:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching client appointments:', error);
    toast.error('Error al obtener tus citas', {
      id: 'unique-notification'
    });
    throw error;
  }
};

class AppointmentService {
  /**
   * Fetches available time slots for a psychologist
   * @param psychologistId The ID of the psychologist
   * @returns Promise with available days and time slots
   */
  async getAvailableTimeSlots(psychologistId: number): Promise<DaySlot[]> {
    try {
      // Get the authentication token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Debe iniciar sesión para ver los horarios disponibles.');
      }

      // Fetch existing appointments first
      const existingAppointments = await this.fetchExistingAppointments(psychologistId, token);
      
      // Then fetch the psychologist's schedule
      const scheduleConfig = await this.fetchPsychologistSchedule(psychologistId, token);
      
      // Generate available days based on the schedule
      let availableDays = generateAvailableDays(scheduleConfig);
      
      // Filter out booked slots and past time slots
      availableDays = this.filterAvailableDays(availableDays, existingAppointments);
      
      return availableDays;
    } catch (error) {
      console.error('Error fetching available time slots:', error);
      throw error;
    }
  }

  /**
   * Fetches existing appointments for a psychologist
   * @param psychologistId The ID of the psychologist
   * @param token Authentication token
   * @returns Promise with existing appointments
   */
  private async fetchExistingAppointments(psychologistId: number, token: string): Promise<ExistingAppointment[]> {
    try {
      const response = await axios.get<ExistingAppointment[]>(
        `/appointments/psychologist/${psychologistId}/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching existing appointments:', error);
      return []; // Return empty array in case of error
    }
  }

  /**
   * Fetches a psychologist's schedule
   * @param psychologistId The ID of the psychologist
   * @param token Authentication token
   * @returns Promise with schedule configuration
   */
  private async fetchPsychologistSchedule(psychologistId: number, token: string): Promise<ScheduleConfig> {
    try {
      const url = `/schedules/psychologist/${psychologistId}/`;
      
      const response = await axios.get<ScheduleResponse>(
        url,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return response.data.schedule_config;
    } catch (error) {
      console.error('Error fetching psychologist schedule:', error);
      throw error;
    }
  }

  /**
   * Filters available days to remove booked slots and past time slots
   * @param days Available days with time slots
   * @param existingAppointments Existing appointments
   * @returns Filtered days with available time slots
   */
  private filterAvailableDays(days: DaySlot[], existingAppointments: ExistingAppointment[]): DaySlot[] {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    const filteredDays = days.map(day => {
      // Filter out slots that are already booked
      let availableSlots = day.slots.filter(
        slot => !this.isTimeSlotBooked(day.date, slot.start_time, slot.end_time, existingAppointments)
      );
      
      // Filter out past time slots
      if (day.date === currentDate) {
        availableSlots = availableSlots.filter(slot => {
          const [hours, minutes] = slot.start_time.split(':').map(Number);
          return hours > currentHour || (hours === currentHour && minutes > currentMinute);
        });
      } else if (day.date < currentDate) {
        // Remove all slots for past days
        availableSlots = [];
      }
      
      return {
        ...day,
        slots: availableSlots
      };
    }).filter(day => day.slots.length > 0); // Only keep days that have available slots
    
    return filteredDays;
  }

  /**
   * Checks if a time slot is already booked
   * @param date Date to check
   * @param startTime Start time to check
   * @param endTime End time to check
   * @param existingAppointments Existing appointments
   * @returns True if the slot is booked, false otherwise
   */
  private isTimeSlotBooked(
    date: string, 
    startTime: string, 
    endTime: string, 
    existingAppointments: ExistingAppointment[]
  ): boolean {
    return existingAppointments.some(appointment => {
      // Check if the appointment is on the same date
      if (appointment.date !== date) return false;
      
      // Convert times to comparable format (minutes since midnight)
      const appointmentStart = this.timeToMinutes(appointment.start_time);
      const appointmentEnd = this.timeToMinutes(appointment.end_time);
      const slotStart = this.timeToMinutes(startTime);
      const slotEnd = this.timeToMinutes(endTime);
      
      // Check for overlap
      return (
        (slotStart >= appointmentStart && slotStart < appointmentEnd) || // Slot starts during appointment
        (slotEnd > appointmentStart && slotEnd <= appointmentEnd) || // Slot ends during appointment
        (slotStart <= appointmentStart && slotEnd >= appointmentEnd) // Slot completely contains appointment
      );
    });
  }

  /**
   * Converts time string to minutes since midnight
   * @param timeStr Time string in format HH:MM:SS
   * @returns Minutes since midnight
   */
  private timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }
}

// Servicio común para administradores y psicólogos
export const updateAppointmentPaymentStatus = async (
  appointmentId: number, 
  data: { 
    status: string, 
    notes?: string,
    admin_notes?: string,
    psychologist_notes?: string
  }
) => {
  try {
    console.log('Actualizando estado de pago para cita:', appointmentId, 'con datos:', data);
    
    // Prevenir múltiples envíos configurando un indicador en localStorage
    const lockKey = `updating_appointment_${appointmentId}`;
    if (localStorage.getItem(lockKey) === 'true') {
      console.log('Evitando solicitud duplicada para la cita:', appointmentId);
      return null;
    }
    
    // Establecer el bloqueo
    localStorage.setItem(lockKey, 'true');
    
    const response = await api.patch(`/appointments/${appointmentId}/update-payment-status/`, data);
    
    let successMessage = 'Estado de la cita actualizado correctamente';
    
    // Mensaje personalizado según el estado
    if (data.status === 'PAYMENT_VERIFIED') {
      successMessage = 'Pago verificado correctamente';
    } else if (data.status === 'CONFIRMED') {
      successMessage = 'Pago verificado y cita confirmada correctamente';
    }
    
    toast.success(successMessage, {
      id: 'unique-notification'
    });
    console.log('Estado de pago actualizado:', response.data);
    
    // Liberar el bloqueo después de procesar con éxito
    localStorage.removeItem(lockKey);
    
    return response.data;
  } catch (error) {
    console.error('Error al actualizar estado de pago:', error);
    toast.error('Error al actualizar el estado del pago', {
      id: 'unique-notification'
    });
    
    // Liberar el bloqueo en caso de error
    const lockKey = `updating_appointment_${appointmentId}`;
    localStorage.removeItem(lockKey);
    
    throw error;
  }
};

// Servicios para administradores
export const getAdminPaymentVerifications = async (
  params?: { 
    psychologist_id?: number, 
    start_date?: string, 
    end_date?: string,
    status?: string 
  }
) => {
  try {
    // Si no hay filtro de estado, incluir todos los estados relevantes por defecto
    const defaultParams = {
      ...params,
      status: params?.status || 'PAYMENT_UPLOADED,PAYMENT_VERIFIED,CONFIRMED'
    };
    
    let errorToThrow = null;
    
    // Lista de rutas a intentar en orden
    const routesToTry = [
      '/appointments/admin-payment-verification/',
      '/appointments/admin_payment_verification/',
      '/appointments/admin/payment-verification/',
      '/appointments/admin-payment-verification'
    ];
    
    for (const route of routesToTry) {
      try {
        console.log(`Intentando con ruta: ${route}`);
        const response = await api.get<AppointmentData[]>(route, { 
          params: defaultParams 
        });
        console.log(`Éxito con ruta: ${route}`);
        return response.data;
      } catch (error: any) {
        console.error(`Error con ruta ${route}:`, error.response?.status || error.message);
        errorToThrow = error;
        
        // Si el error no es 404, no seguir intentando con otras rutas
        if (error.response && error.response.status !== 404) {
          break;
        }
      }
    }
    
    // Si llegamos aquí, todas las rutas fallaron. Intentemos un enfoque diferente
    try {
      // Obtener todas las citas y filtrar manualmente (último recurso)
      const response = await api.get<AppointmentData[]>('/appointments/', {
        params: {
          psychologist_id: defaultParams.psychologist_id,
          start_date: defaultParams.start_date,
          end_date: defaultParams.end_date
        }
      });
      
      // Filtrar por estado manualmente
      let filteredData = response.data;
      if (defaultParams.status) {
        const statusList = defaultParams.status.split(',');
        filteredData = filteredData.filter(app => statusList.includes(app.status));
      }
      
      console.log('Citas recuperadas y filtradas manualmente', filteredData.length);
      return filteredData;
    } catch (fallbackError) {
      console.error('Fallback también falló:', fallbackError);
      // Si el fallback también falla, lanzar el error original
      throw errorToThrow;
    }
  } catch (error) {
    console.error('Error al obtener verificaciones de pago para administrador:', error);
    toast.error('Error al cargar las citas pendientes de verificación', {
      id: 'unique-notification'
    });
    throw error;
  }
};

// Servicios para psicólogos
export const getPsychologistPendingPayments = async (
  params?: { 
    status?: string, 
    start_date?: string, 
    end_date?: string 
  }
) => {
  try {
    // Usar my-appointments con filtro de estado para pagos pendientes
    const response = await api.get<AppointmentData[]>('/appointments/my-appointments/', { 
      params: {
        ...params,
        status: params?.status || 'PAYMENT_UPLOADED,PAYMENT_VERIFIED'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener pagos pendientes para psicólogo:', error);
    toast.error('Error al cargar las citas pendientes de verificación', {
      id: 'unique-notification'
    });
    throw error;
  }
};

export default new AppointmentService();

