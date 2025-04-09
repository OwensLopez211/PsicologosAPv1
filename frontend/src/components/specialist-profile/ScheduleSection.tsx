import { FC, useEffect } from 'react';
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';

interface TimeBlock {
  startTime: string;
  endTime: string;
}

interface DaySchedule {
  enabled: boolean;
  timeBlocks: TimeBlock[];
}

interface ScheduleConfig {
  sunday?: DaySchedule;
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
}

interface ScheduleSectionProps {
  schedule: {
    schedule_config: ScheduleConfig;
  };
  onSchedule: () => void;
}

const ScheduleSection: React.FC<ScheduleSectionProps> = ({ schedule, onSchedule }) => {
  // Mapeo de días en inglés a español
  const dayTranslations: Record<string, string> = {
    'sunday': 'Domingo',
    'monday': 'Lunes',
    'tuesday': 'Martes',
    'wednesday': 'Miércoles',
    'thursday': 'Jueves',
    'friday': 'Viernes',
    'saturday': 'Sábado'
  };

  // Formatear hora de 24h a 12h con AM/PM
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

  // Obtener días con horarios habilitados
  const getEnabledDays = () => {
    if (!schedule || !schedule.schedule_config) return [];

    return Object.entries(schedule.schedule_config)
      .filter(([_, dayConfig]) => dayConfig && dayConfig.enabled)
      .map(([day, dayConfig]) => ({
        day,
        dayName: dayTranslations[day] || day,
        timeBlocks: dayConfig.timeBlocks || []
      }))
      .sort((a, b) => {
        // Ordenar días de la semana (domingo al final)
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        return days.indexOf(a.day) - days.indexOf(b.day);
      });
  };

  const enabledDays = getEnabledDays();

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <CalendarIcon className="h-5 w-5 mr-2 text-[#2A6877]" />
        Horario de atención
      </h3>

      {enabledDays.length > 0 ? (
        <div className="space-y-3">
          {enabledDays.map(({ day, dayName, timeBlocks }) => (
            <div key={day} className="border-b border-gray-200 pb-2 last:border-b-0 last:pb-0">
              <h4 className="font-medium text-gray-800">{dayName}</h4>
              <div className="mt-1 space-y-1">
                {timeBlocks && timeBlocks.length > 0 ? (
                  timeBlocks.map((block, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
                      <span>
                        {formatTime(block.startTime)} - {formatTime(block.endTime)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">Horario no especificado</div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No hay horarios disponibles</p>
      )}

      <button
        onClick={onSchedule}
        className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-[#2A6877] text-white rounded-md hover:bg-[#1d4e5a] transition-colors"
      >
        <CalendarIcon className="h-5 w-5 mr-2" />
        Agendar consulta
      </button>
    </div>
  );
};

export default ScheduleSection;