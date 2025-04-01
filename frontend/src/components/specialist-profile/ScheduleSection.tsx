import { FC } from 'react';
import { CalendarIcon } from '@heroicons/react/24/solid';

interface ScheduleSectionProps {
  schedule?: any; // Changed from availability to schedule
  onSchedule: () => void;
}

const ScheduleSection: FC<ScheduleSectionProps> = ({
  schedule = {},
  onSchedule
}) => {
  // Format schedule data into readable strings
  const formatSchedule = () => {
    if (!schedule || Object.keys(schedule).length === 0) {
      return ["Horarios no disponibles"];
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
    
    for (const [day, slots] of Object.entries(schedule)) {
      if (Array.isArray(slots) && slots.length > 0) {
        const spanishDay = days[day as keyof typeof days] || day;
        formattedSchedule.push(`${spanishDay}: ${slots.join(', ')}`);
      }
    }

    return formattedSchedule.length > 0 ? formattedSchedule : ["Horarios no disponibles"];
  };

  const availabilityList = formatSchedule();

  return (
    <section className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Horarios disponibles</h2>
      <div className="space-y-4">
        {availabilityList.map((time, index) => (
          <div key={index} className="flex items-start gap-3">
            <CalendarIcon className="h-5 w-5 text-[#2A6877] flex-shrink-0" />
            <span className="text-gray-600">{time}</span>
          </div>
        ))}
      </div>
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
        onClick={onSchedule}
      >
        Agendar Consulta
      </button>
    </section>
  );
};

export default ScheduleSection;