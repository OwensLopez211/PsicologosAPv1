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
    
    const response = await api.patch('/profiles/psychologist-profiles/me/update-schedule/', {
      schedule: processedSchedule
    });
    return response.data;
  } catch (error) {
    console.error('Error updating schedule:', error);
    throw error;
  }
};

// Add this new function to get the current user's schedule
export const getCurrentUserSchedule = async () => {
  try {
    const response = await api.get('/profiles/psychologist-profiles/me/schedule/');
    console.log('Current user schedule from API:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching current user schedule:', error);
    throw error;
  }
};

// Procesa el horario para almacenamiento y uso futuro en el sistema de citas
function processScheduleForStorage(schedule: ScheduleData): ScheduleData {
  const processedSchedule: ScheduleData = {};
  
  // Solo incluir días habilitados
  for (const day in schedule) {
    if (schedule[day].enabled && schedule[day].timeBlocks.length > 0) {
      // Ordenar los bloques de tiempo para facilitar la búsqueda de disponibilidad
      const sortedTimeBlocks = [...schedule[day].timeBlocks].sort((a, b) => 
        a.startTime.localeCompare(b.startTime)
      );
      
      // Combinar bloques de tiempo superpuestos
      const mergedTimeBlocks = mergeOverlappingTimeBlocks(sortedTimeBlocks);
      
      processedSchedule[day] = {
        enabled: true,
        timeBlocks: mergedTimeBlocks
      };
    }
  }
  
  return processedSchedule;
}

// Combina bloques de tiempo superpuestos para evitar conflictos en las citas
function mergeOverlappingTimeBlocks(timeBlocks: TimeBlock[]): TimeBlock[] {
  if (timeBlocks.length <= 1) return timeBlocks;
  
  const result: TimeBlock[] = [];
  let currentBlock = { ...timeBlocks[0] };
  
  for (let i = 1; i < timeBlocks.length; i++) {
    const nextBlock = timeBlocks[i];
    
    // Si hay superposición, combinar los bloques
    if (nextBlock.startTime <= currentBlock.endTime) {
      currentBlock.endTime = nextBlock.endTime > currentBlock.endTime 
        ? nextBlock.endTime 
        : currentBlock.endTime;
    } else {
      // Si no hay superposición, agregar el bloque actual y comenzar uno nuevo
      result.push(currentBlock);
      currentBlock = { ...nextBlock };
    }
  }
  
  // Agregar el último bloque
  result.push(currentBlock);
  return result;
}

// Función para obtener el horario del psicólogo (útil para el sistema de citas)
export const getSchedule = async (psychologistId: number) => {
  try {
    const response = await api.get(`/profiles/psychologist-profiles/${psychologistId}/schedule/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching schedule:', error);
    throw error;
  }
};

