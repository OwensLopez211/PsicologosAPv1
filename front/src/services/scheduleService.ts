import api from './api';

interface TimeBlock {
  startTime: string;
  endTime: string;
}

interface DaySchedule {
  enabled: boolean;
  timeBlocks: TimeBlock[];
}

export interface ScheduleData {
  [key: string]: DaySchedule;
}

export const updateSchedule = async (data: { schedule: ScheduleData }) => {
  try {
    // Transformar los datos para que sean más adecuados para un sistema de citas
    const processedSchedule = processScheduleForStorage(data.schedule);
    
    // Updated to match Django URL pattern (hyphen instead of underscore)
    const response = await api.patch('/schedules/psychologist-schedule/update/', {
      schedule_config: processedSchedule
    });
    return response.data;
  } catch (error) {
    console.error('Error updating schedule:', error);
    throw error;
  }
};

export const getCurrentUserSchedule = async () => {
  try {
    // Using underscore pattern which is correct for this endpoint
    const response = await api.get('/schedules/psychologist_schedule/');
    console.log('Current user schedule from API:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching current user schedule:', error);
    throw error;
  }
};

// Procesa el horario para almacenamiento y uso futuro en el sistema de citas
function processScheduleForStorage(schedule: ScheduleData) {
  const processedSchedule: any = {};
  
  // Only include days that are enabled
  Object.keys(schedule).forEach(day => {
    if (schedule[day].enabled && schedule[day].timeBlocks.length > 0) {
      processedSchedule[day] = {
        enabled: true,
        timeBlocks: schedule[day].timeBlocks
      };
    }
  });
  
  return processedSchedule;
}

// Función para obtener el horario del psicólogo (útil para el sistema de citas)
export const getSchedule = async (psychologistId: number) => {
  try {
    // This endpoint is already correct
    const response = await api.get(`/schedules/psychologist/${psychologistId}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching schedule:', error);
    throw error;
  }
};

