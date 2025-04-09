import api from './api';
import { toast } from 'react-hot-toast';

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
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'PAYMENT_PENDING';
  notes?: string;
  client_notes?: string;
  created_at: string;
  updated_at: string;
  client_details?: any;
  psychologist_details?: any;
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
      const dateStr = `${year}-${monthStr}-${day.toString().padStart(2, '0')}`;
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
// Añade esta función al archivo appointmentService.ts

// Modificar la función createAppointment para usar el ID correcto
export const createAppointment = async (appointmentData: {
  psychologist: number;
  date: string;
  start_time: string;
  end_time: string;
  notes?: string;
}): Promise<AppointmentData> => {
  try {
    console.log('Creating appointment with data:', appointmentData);
    
    // Primero obtenemos los slots disponibles para ese día para verificar el ID de perfil
    const availableSlotsResponse = await api.get('/appointments/available_slots/', {
      params: {
        profile_id: appointmentData.psychologist,
        date: appointmentData.date
      }
    });
    
    // Si llegamos aquí, el ID funciona para obtener slots, así que lo usamos directamente
    const response = await api.post('/appointments/create_appointment/', appointmentData);
    
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
        const availableSlotsResponse = await api.get('/appointments/available_slots/', {
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
