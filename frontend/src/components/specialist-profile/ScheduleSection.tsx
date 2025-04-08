import { FC, useEffect } from 'react';
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/solid';

interface TimeBlock {
  startTime: string;
  endTime: string;
}

interface DaySchedule {
  enabled: boolean;
  timeBlocks: TimeBlock[];
}

interface ScheduleData {
  schedule_config?: {
    [key: string]: DaySchedule;
  };
}

interface ScheduleSectionProps {
  schedule: ScheduleData;
  onSchedule: () => void;
}

const ScheduleSection: FC<ScheduleSectionProps> = ({
  schedule,
  onSchedule
}) => {
  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${minutes} ${ampm}`;
    } catch (e) {
      return time;
    }
  };

  const formatSchedule = () => {
    const scheduleConfig = schedule?.schedule_config;
    if (!scheduleConfig) {
      console.log('No schedule configuration found');
      return [];
    }

    const days = {
      monday: "Lunes",
      tuesday: "Martes",
      wednesday: "Miércoles",
      thursday: "Jueves",
      friday: "Viernes",
      saturday: "Sábado",
      sunday: "Domingo"
    };

    const formattedSchedule = [];

    Object.entries(scheduleConfig).forEach(([day, dayData]) => {
      if (days[day as keyof typeof days] && dayData.enabled && dayData.timeBlocks?.length > 0) {
        formattedSchedule.push({
          day: days[day as keyof typeof days],
          timeBlocks: dayData.timeBlocks.map(block => ({
            start: formatTime(block.startTime),
            end: formatTime(block.endTime)
          }))
        });
      }
    });

    // Sort days in correct order
    const dayOrder = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    formattedSchedule.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));

    return formattedSchedule;
  };

  const scheduleData = formatSchedule();
  const hasSchedule = scheduleData.length > 0;

  return (
    <section className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <CalendarIcon className="h-5 w-5 text-[#2A6877] mr-2" />
        Horarios disponibles
      </h2>
      
      {hasSchedule ? (
        <div className="space-y-6">
          {scheduleData.map((daySchedule, dayIndex) => (
            <div key={dayIndex} className="border-b pb-4 last:border-b-0 last:pb-0">
              <h3 className="font-medium text-gray-800 mb-2">{daySchedule.day}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {daySchedule.timeBlocks.map((block, blockIndex) => (
                  <div 
                    key={blockIndex} 
                    className="bg-blue-50 text-blue-800 px-3 py-2 rounded-md flex items-center"
                  >
                    <ClockIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{block.start} - {block.end}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500 italic py-4">
          Horarios no disponibles
        </div>
      )}
      
      <div className="mt-6">
        <h3 className="font-medium mb-2">Modalidad de atención</h3>
        <span className="bg-[#2A6877] bg-opacity-10 text-[#2A6877] px-3 py-1 rounded-full text-sm inline-flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Consulta Online
        </span>
      </div>
      <button 
        className="w-full bg-[#2A6877] text-white px-6 py-3 rounded-md hover:bg-[#235A67] transition-colors mt-6"
        onClick={() => onSchedule()} // Ensure we're calling the function
      >
        Agendar Consulta
      </button>
    </section>
  );
};

export default ScheduleSection;