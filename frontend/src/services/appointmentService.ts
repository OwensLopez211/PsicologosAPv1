import api from './api';

export interface TimeSlot {
  date: string;
  start_time: string;
  end_time: string;
}

export interface Appointment {
  id: number;
  client: number;
  psychologist_profile: number;
  date: string;
  start_time: string;
  end_time: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  payment_status: 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';
  notes?: string;
  client_notes?: string;
  psychologist_notes?: string;
  created_at: string;
  updated_at: string;
}

// Get available time slots for a specific psychologist on a specific date
export const getAvailableTimeSlots = async (psychologistId: number, date: string): Promise<TimeSlot[]> => {
  try {
    const response = await axios.get(`/api/profiles/psychologist-profiles/${psychologistId}/schedule/`);
    const scheduleConfig = response.data.schedule_config;
    
    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = new Date(date).getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];
    
    if (!scheduleConfig || !scheduleConfig[dayName]?.enabled) {
      return [];
    }

    const timeBlocks = scheduleConfig[dayName].timeBlocks;
    const availableSlots: TimeSlot[] = [];

    timeBlocks.forEach((block: { startTime: string; endTime: string }) => {
      const startHour = parseInt(block.startTime.split(':')[0]);
      const endHour = parseInt(block.endTime.split(':')[0]);

      // Create 1-hour slots
      for (let hour = startHour; hour < endHour; hour++) {
        const startTime = `${hour.toString().padStart(2, '0')}:00`;
        const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
        
        availableSlots.push({
          date,
          start_time: startTime,
          end_time: endTime
        });
      }
    });

    return availableSlots;
  } catch (error) {
    console.error('Error fetching available time slots:', error);
    return [];
  }
};

// Create a new appointment
export const createAppointment = async (appointmentData: {
  psychologist_profile: number;
  date: string;
  start_time: string;
  end_time: string;
  notes?: string;
  client_notes?: string;
}): Promise<Appointment> => {
  try {
    const response = await api.post('/appointments/appointments/', appointmentData);
    return response.data;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

// Get user's upcoming appointments
export const getUpcomingAppointments = async (): Promise<Appointment[]> => {
  try {
    const response = await api.get('/appointments/appointments/upcoming/');
    return response.data;
  } catch (error) {
    console.error('Error fetching upcoming appointments:', error);
    throw error;
  }
};

// Get user's past appointments
export const getPastAppointments = async (): Promise<Appointment[]> => {
  try {
    const response = await api.get('/appointments/appointments/past/');
    return response.data;
  } catch (error) {
    console.error('Error fetching past appointments:', error);
    throw error;
  }
};

// Update appointment status
export const updateAppointmentStatus = async (
  appointmentId: number, 
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'
): Promise<{ status: string }> => {
  try {
    const response = await api.patch(`/appointments/appointments/${appointmentId}/status/`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
};