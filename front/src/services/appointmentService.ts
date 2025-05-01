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
  notes?: string;
  client_notes?: string;
  created_at: string;
  updated_at: string;
  client_details?: any;
  psychologist_details?: any;
  payment_proof?: string;
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
    toast.error('Error al obtener horarios disponibles');
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
    toast.success('Cita agendada correctamente');
    
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
        toast.error('Error al agendar la cita. Por favor, intenta de nuevo.');
      } catch (slotError: any) {
        toast.error('No se pudo encontrar el perfil del psicólogo. Por favor, contacta a soporte.');
      }
    } else {
      // Display a more specific error message if available
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.detail || 'Error al agendar la cita';
        toast.error(errorMessage);
      } else {
        toast.error('Error al agendar la cita');
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
    toast.error('Error al obtener tus citas');
    throw error;
  }
};

// Function to cancel an appointment
export const cancelAppointment = async (appointmentId: number): Promise<AppointmentData> => {
  try {
    const response = await api.patch(`/appointments/${appointmentId}/cancel_appointment/`);
    console.log('Appointment cancelled:', response.data);
    toast.success('Cita cancelada correctamente');
    return response.data;
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    toast.error('Error al cancelar la cita');
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
    toast.error('Error al obtener las citas');
    throw error;
  }
};

// Function for psychologists to confirm an appointment
export const confirmAppointment = async (appointmentId: number): Promise<AppointmentData> => {
  try {
    const response = await api.patch(`/appointments/${appointmentId}/confirm_appointment/`);
    console.log('Appointment confirmed:', response.data);
    toast.success('Cita confirmada correctamente');
    return response.data;
  } catch (error) {
    console.error('Error confirming appointment:', error);
    toast.error('Error al confirmar la cita');
    throw error;
  }
};

// Function for psychologists to mark an appointment as completed
export const completeAppointment = async (appointmentId: number): Promise<AppointmentData> => {
  try {
    const response = await api.patch(`/appointments/${appointmentId}/complete_appointment/`);
    console.log('Appointment completed:', response.data);
    toast.success('Cita marcada como completada');
    return response.data;
  } catch (error) {
    console.error('Error completing appointment:', error);
    toast.error('Error al completar la cita');
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
    toast.success('Comprobante de pago subido correctamente');
    return response.data;
  } catch (error) {
    console.error('Error uploading payment proof:', error);
    toast.error('Error al subir el comprobante de pago');
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
    toast.success(verified ? 'Pago verificado correctamente' : 'Pago rechazado');
    return response.data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    toast.error('Error al verificar el pago');
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
    toast.error('Error al obtener tus citas');
    throw error;
  }
};

class AppointmentService {
  /**
   * Fetches available time slots for a psychologist
   * @param psychologistId The ID of the psychologist
   * @param forceRefresh Optional parameter to force refresh and ignore cache
   * @returns Promise with available days and time slots
   */
  async getAvailableTimeSlots(psychologistId: number, forceRefresh?: boolean): Promise<DaySlot[]> {
    try {
      verifyPsychologistId(psychologistId);
      
      console.log('Fetching available time slots for psychologist:', psychologistId, forceRefresh ? '(forzando recarga)' : '');
      
      // Obtener el token de autenticación
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        throw new Error('No authentication token found');
      }

      // Paso 1: Obtener la configuración de horario del psicólogo
      const scheduleConfig = await this.fetchPsychologistSchedule(psychologistId, token, forceRefresh);
      
      if (!scheduleConfig) {
        console.error('No schedule configuration found for psychologist');
        throw new Error('No schedule configuration found');
      }

      // Paso 2: Generar los días disponibles a partir de la configuración
      const availableDays = generateAvailableDays(scheduleConfig);
      
      if (availableDays.length === 0) {
        console.log('No available days found from schedule configuration');
        return [];
      }
      
      console.log('Available days from schedule:', availableDays);
      
      // Paso 3: Obtener las citas existentes para filtrar los horarios ocupados
      const existingAppointments = await this.fetchExistingAppointments(psychologistId, token, forceRefresh);
      
      console.log('Existing appointments:', existingAppointments);
      
      // Paso 4: Filtrar los días y horarios disponibles
      const filteredDays = this.filterAvailableDays(availableDays, existingAppointments);
      
      console.log('Filtered available days:', filteredDays);
      
      return filteredDays;
    } catch (error) {
      console.error('Error in getAvailableTimeSlots:', error);
      throw error;
    }
  }

  /**
   * Fetches existing appointments for a psychologist
   * @param psychologistId The ID of the psychologist
   * @param token Authentication token
   * @param forceRefresh Optional parameter to force refresh
   * @returns Promise with existing appointments
   */
  private async fetchExistingAppointments(
    psychologistId: number, 
    token: string,
    forceRefresh?: boolean
  ): Promise<ExistingAppointment[]> {
    try {
      // Añadir un parámetro de consulta para evitar caché si se fuerza la actualización
      const timestamp = forceRefresh ? `?t=${Date.now()}` : '';
      
      const response = await axios.get<ExistingAppointment[]>(
        `/api/appointments/psychologist/${psychologistId}/${timestamp}`,
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
   * @param forceRefresh Optional parameter to force refresh
   * @returns Promise with schedule configuration
   */
  private async fetchPsychologistSchedule(
    psychologistId: number, 
    token: string,
    forceRefresh?: boolean
  ): Promise<ScheduleConfig> {
    try {
      // Añadir un parámetro de consulta para evitar caché si se fuerza la actualización
      const timestamp = forceRefresh ? `?t=${Date.now()}` : '';
      const url = `/api/schedules/psychologist/${psychologistId}/${timestamp}`;
      
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
    
    console.log('Filtrando días disponibles, hoy es:', currentDate);
    
    const filteredDays = days.map(day => {
      console.log(`Procesando día: ${day.date} (${day.day_name})`);
      
      // Filter out slots that are already booked
      let availableSlots = day.slots.filter(
        slot => !this.isTimeSlotBooked(day.date, slot.start_time, slot.end_time, existingAppointments)
      );
      
      // Log slots before filtering past slots
      console.log(`Slots antes de filtrar por hora actual: ${availableSlots.length}`);
      
      // Create date objects with consistent timezone handling
      const dayDateString = day.date;
      const currentDateString = currentDate;
      
      // Compare dates as strings first (YYYY-MM-DD) to avoid timezone issues
      if (dayDateString === currentDateString) {
        // Same day - filter by time
        console.log(`Día actual: filtrando slots por hora (hora actual: ${currentHour}:${currentMinute})`);
        
        availableSlots = availableSlots.filter(slot => {
          const [hours, minutes] = slot.start_time.split(':').map(Number);
          return hours > currentHour || (hours === currentHour && minutes > currentMinute);
        });
      } else {
        // Compare dates correctly for past filtering
        const isPast = this.compareDates(dayDateString, currentDateString) < 0;
        
        if (isPast) {
          console.log(`Día pasado (${dayDateString} < ${currentDateString}): removiendo todos los slots`);
        availableSlots = [];
        }
      }
      
      console.log(`Slots después de filtrar: ${availableSlots.length}`);
      
      return {
        ...day,
        slots: availableSlots
      };
    }).filter(day => day.slots.length > 0); // Only keep days that have available slots
    
    console.log(`Total de días disponibles después de filtrar: ${filteredDays.length}`);
    return filteredDays;
  }

  /**
   * Compares two date strings in format YYYY-MM-DD
   * @param date1 First date string
   * @param date2 Second date string
   * @returns -1 if date1 < date2, 0 if equal, 1 if date1 > date2
   */
  private compareDates(date1: string, date2: string): number {
    // Parse dates with consistent timezone handling by using the same time and timezone
    // for both dates
    const d1 = new Date(`${date1}T12:00:00.000Z`);
    const d2 = new Date(`${date2}T12:00:00.000Z`);
    
    // Compare timestamps
    if (d1.getTime() < d2.getTime()) return -1;
    if (d1.getTime() > d2.getTime()) return 1;
    return 0;
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

export default new AppointmentService();
