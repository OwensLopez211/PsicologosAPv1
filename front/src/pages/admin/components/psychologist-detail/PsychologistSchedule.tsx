import React, { useState, useEffect } from 'react';
import { ClockIcon, CalendarDaysIcon } from '@heroicons/react/24/solid';
import PsychologistService, { ScheduleConfig, TimeBlock } from '../../../../services/PsychologistService';

interface PsychologistScheduleProps {
  psychologistId: number;
}

const dayTranslations: Record<string, string> = {
  'monday': 'Lunes',
  'tuesday': 'Martes',
  'wednesday': 'Miércoles',
  'thursday': 'Jueves',
  'friday': 'Viernes',
  'saturday': 'Sábado',
  'sunday': 'Domingo'
};

// Orden de los días de la semana
const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const PsychologistSchedule: React.FC<PsychologistScheduleProps> = ({
  psychologistId
}) => {
  const [scheduleConfig, setScheduleConfig] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<boolean>(false);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!psychologistId) {
          setError('ID de psicólogo no válido');
          setLoading(false);
          return;
        }
        
        const scheduleData = await PsychologistService.getPsychologistSchedule(psychologistId);
        
        // Verificar si se recibió un objeto válido
        if (!scheduleData || typeof scheduleData !== 'object') {
          console.warn('Los datos de horario recibidos no son válidos:', scheduleData);
          setScheduleConfig({});
        } else {
          console.log('Horario completo recibido:', scheduleData);
          
          // Intentar identificar la estructura correcta
          if (scheduleData.schedule_config) {
            setScheduleConfig(scheduleData.schedule_config);
          } else {
            setScheduleConfig(scheduleData);
          }
        }
      } catch (err) {
        console.error('Error al cargar el horario:', err);
        setError('No se pudo cargar el horario del especialista');
        setScheduleConfig({});
      } finally {
        setLoading(false);
      }
    };

    if (psychologistId) {
      fetchSchedule();
    } else {
      setLoading(false);
      setError('ID de psicólogo no válido');
    }
  }, [psychologistId]);

  // Formatear la hora: "HH:MM:SS" -> "HH:MM"
  const formatTime = (timeString: string): string => {
    if (!timeString) return '';
    
    try {
      if (timeString.includes(':')) {
        const parts = timeString.split(':');
        return `${parts[0]}:${parts[1]}`;
      }
      return timeString;
    } catch (error) {
      console.error('Error al formatear la hora:', error);
      return timeString || '';
    }
  };

  // Obtener el nombre en español del día
  const getSpanishDay = (day: string): string => {
    if (!day) return '';
    return dayTranslations[day.toLowerCase()] || day;
  };

  // Comprobar si hay horarios habilitados
  const hasEnabledSchedules = (): boolean => {
    if (!scheduleConfig || typeof scheduleConfig !== 'object') return false;
    
    return dayOrder.some(day => {
      const daySchedule = scheduleConfig[day];
      if (!daySchedule) return false;
      
      // Verificar si tiene timeBlocks y están habilitados
      return daySchedule.enabled && 
             daySchedule.timeBlocks && 
             Array.isArray(daySchedule.timeBlocks) && 
             daySchedule.timeBlocks.length > 0;
    });
  };

  // Renderizar los bloques de tiempo para un día específico
  const renderTimeBlocks = (dayName: string) => {
    if (!scheduleConfig || !scheduleConfig[dayName]) return null;
    
    const daySchedule = scheduleConfig[dayName];
    
    // Verificar si está habilitado y tiene bloques de tiempo
    if (!daySchedule.enabled || 
        !daySchedule.timeBlocks || 
        !Array.isArray(daySchedule.timeBlocks) || 
        daySchedule.timeBlocks.length === 0) {
      return null;
    }

    return (
      <div 
        key={dayName}
        className="bg-white border rounded-lg p-3 flex items-start shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="bg-[#2A6877]/10 p-1.5 sm:p-2 rounded-lg mr-3 flex-shrink-0">
          <CalendarDaysIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#2A6877]" />
        </div>
        <div className="w-full">
          <h3 className="text-sm sm:text-base font-medium text-gray-800">
            {getSpanishDay(dayName)}
          </h3>
          <div className="space-y-1 mt-1">
            {daySchedule.timeBlocks.map((block: any, index: number) => {
              if (debug) console.log(`Bloque de ${dayName}:`, block);
              
              // Buscar las propiedades de tiempo en diferentes formatos
              let startTime = '';
              let endTime = '';
              
              if (typeof block === 'object') {
                startTime = block.startTime || block.start_time || '';
                endTime = block.endTime || block.end_time || '';
              }
              
              return (
                <div key={`${dayName}-${index}`} className="flex items-center text-xs sm:text-sm text-gray-600">
                  <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 mr-1.5" />
                  <span>{formatTime(startTime)} - {formatTime(endTime)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Función para mostrar datos de depuración
  const toggleDebug = () => {
    setDebug(!debug);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3 sm:mb-4 border-b pb-2">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
          Horario de Atención
        </h2>
        <button 
          onClick={toggleDebug} 
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          {debug ? "Ocultar debug" : "Debug"}
        </button>
      </div>
      
      {/* Panel de depuración */}
      {debug && (
        <div className="bg-gray-100 p-3 rounded-md mb-4 overflow-auto max-h-60 text-xs">
          <pre>{JSON.stringify(scheduleConfig, null, 2)}</pre>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#2A6877]"></div>
        </div>
      ) : error ? (
        <p className="text-sm sm:text-base text-red-500">{error}</p>
      ) : hasEnabledSchedules() ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {dayOrder.map(day => renderTimeBlocks(day))}
        </div>
      ) : (
        <p className="text-sm sm:text-base text-gray-500">No hay horarios registrados para este especialista</p>
      )}
    </div>
  );
};

export default PsychologistSchedule; 