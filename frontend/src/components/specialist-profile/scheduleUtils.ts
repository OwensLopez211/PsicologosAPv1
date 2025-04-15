// Define interfaces for the schedule data
export interface TimeBlock {
  startTime: string;
  endTime: string;
}

export interface DaySchedule {
  enabled: boolean;
  timeBlocks: TimeBlock[];
}

export interface ScheduleConfig {
  [key: string]: DaySchedule;
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
}

export interface DaySlot {
  date: string;
  day_name: string;
  day_of_week: string;
  slots: TimeSlot[];
}

// Map day names to their Spanish equivalents and day numbers
export const dayMapping: { [key: string]: { name: string, number: number } } = {
  'monday': { name: 'Lunes', number: 1 },
  'tuesday': { name: 'Martes', number: 2 },
  'wednesday': { name: 'Miércoles', number: 3 },
  'thursday': { name: 'Jueves', number: 4 },
  'friday': { name: 'Viernes', number: 5 },
  'saturday': { name: 'Sábado', number: 6 },
  'sunday': { name: 'Domingo', number: 0 }
};

// Function to generate available days and slots from the schedule config
export const generateAvailableDays = (scheduleConfig: ScheduleConfig): DaySlot[] => {
  const availableDays: DaySlot[] = [];
  
  // Get today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Generate dates for the next 14 days
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Get the day of the week (0-6, where 0 is Sunday)
    const dayOfWeek = date.getDay();
    
    // Find the corresponding day in the schedule config
    const dayKey = Object.keys(dayMapping).find(key => dayMapping[key].number === dayOfWeek);
    
    if (dayKey && scheduleConfig[dayKey] && scheduleConfig[dayKey].enabled) {
      const dayConfig = scheduleConfig[dayKey];
      
      // If there are time blocks for this day, add it to available days
      if (dayConfig.timeBlocks && dayConfig.timeBlocks.length > 0) {
        const dateStr = date.toISOString().split('T')[0];
        
        // Generate 1-hour slots from each time block
        const slots: TimeSlot[] = [];
        
        dayConfig.timeBlocks.forEach(block => {
          // Parse start and end times
          const [startHour, startMinute] = block.startTime.split(':').map(Number);
          const [endHour, endMinute] = block.endTime.split(':').map(Number);
          
          // Create a date object for start and end times
          const startDate = new Date();
          startDate.setHours(startHour, startMinute, 0, 0);
          
          const endDate = new Date();
          endDate.setHours(endHour, endMinute, 0, 0);
          
          // Generate 1-hour slots
          let currentSlotStart = new Date(startDate);
          
          while (currentSlotStart.getTime() < endDate.getTime() - 59 * 60 * 1000) { // Leave at least 59 minutes for a session
            const currentSlotEnd = new Date(currentSlotStart);
            currentSlotEnd.setHours(currentSlotStart.getHours() + 1);
            
            // If the end time exceeds the block's end time, adjust it
            if (currentSlotEnd.getTime() > endDate.getTime()) {
              currentSlotEnd.setTime(endDate.getTime());
            }
            
            // Format times as HH:MM
            const formattedStartTime = `${String(currentSlotStart.getHours()).padStart(2, '0')}:${String(currentSlotStart.getMinutes()).padStart(2, '0')}`;
            const formattedEndTime = `${String(currentSlotEnd.getHours()).padStart(2, '0')}:${String(currentSlotEnd.getMinutes()).padStart(2, '0')}`;
            
            // Add the slot if it's at least 45 minutes long
            if (currentSlotEnd.getTime() - currentSlotStart.getTime() >= 45 * 60 * 1000) {
              slots.push({
                start_time: formattedStartTime,
                end_time: formattedEndTime
              });
            }
            
            // Move to the next slot
            currentSlotStart.setHours(currentSlotStart.getHours() + 1);
          }
        });
        
        if (slots.length > 0) {
          availableDays.push({
            date: dateStr,
            day_name: dayMapping[dayKey].name,
            day_of_week: dayKey,
            slots: slots
          });
        }
      }
    }
  }
  
  return availableDays;
};

// Format time for display (e.g., "14:00" to "2:00 PM")
export const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes} ${ampm}`;
};

// Format date for display
export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};