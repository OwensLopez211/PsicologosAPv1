import { FC, useEffect, useState } from 'react';
import { DaySlot } from '../scheduleUtils';

interface DaySelectorProps {
  availableDays: DaySlot[];
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  onSlotSelect: (date: string, startTime: string, endTime: string) => void;
  formatDate: (dateStr: string) => string;
  formatTime: (timeStr: string) => string;
}

const DaySelector: FC<DaySelectorProps> = ({
  availableDays,
  selectedDate,
  onDateSelect,
  onSlotSelect,
  formatDate,
  formatTime
}) => {
  // Estado para el mes y año actual que se está mostrando
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    // Inicializar con el mes actual o el mes del primer día disponible
    if (availableDays.length > 0) {
      const firstAvailableDate = new Date(availableDays[0].date + 'T12:00:00');
      return new Date(firstAvailableDate.getFullYear(), firstAvailableDate.getMonth(), 1);
    }
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  });

  // Obtener la fecha y hora actual
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Establecer a medianoche para comparar solo fechas
  
  // Filtrar los días disponibles para mostrar solo desde hoy en adelante
  const filteredDays = availableDays.filter(day => {
    // Importante: Usamos el string de fecha directamente para comparar
    // Creamos un objeto Date solo para la comparación, sin modificar el valor original
    const dayDate = new Date(day.date + 'T00:00:00');
    return dayDate >= today;
  }).map(day => {
    // Si es el día de hoy, filtrar también los horarios que ya han pasado
    if (new Date(day.date + 'T00:00:00').toDateString() === today.toDateString()) {
      // Filtrar slots que no han pasado aún
      const currentHour = now.getHours();
      const currentMinutes = now.getMinutes();
      
      const availableSlots = day.slots.filter(slot => {
        // Convertir la hora de inicio a horas y minutos
        const [hours, minutes] = slot.start_time.split(':').map(Number);
        
        // Comparar con la hora actual
        return (hours > currentHour) || 
               (hours === currentHour && minutes > currentMinutes);
      });
      
      // Devolver el día con los slots filtrados
      return {
        ...day,
        slots: availableSlots
      };
    }
    
    // Para días futuros, mantener todos los slots
    return day;
  }).filter(day => day.slots.length > 0); // Eliminar días que no tienen slots disponibles
  
  // Actualizar la selección si el día seleccionado ya no está disponible
  useEffect(() => {
    if (filteredDays.length > 0) {
      // Si no hay fecha seleccionada o la fecha seleccionada no está en los días filtrados
      if (!selectedDate || !filteredDays.some(day => day.date === selectedDate)) {
        onDateSelect(filteredDays[0].date);
      }
    }
  }, [filteredDays, selectedDate, onDateSelect]);

  // Find the selected day object
  const selectedDay = filteredDays.find(day => day.date === selectedDate);

  // Función para manejar la selección de slot sin ajuste de zona horaria
  const handleSlotSelect = (date: string, startTime: string, endTime: string) => {
    // Usamos la fecha exactamente como viene, sin crear un objeto Date
    console.log('Slot seleccionado con fecha:', date, 'Hora inicio:', startTime, 'Hora fin:', endTime);
    onSlotSelect(date, startTime, endTime);
  };
  
  // Función personalizada para formatear la fecha correctamente
  const correctFormatDate = (dateStr: string) => {
    // Crear una fecha a partir del string pero sin conversión de zona horaria
    const date = new Date(dateStr + 'T12:00:00');
    
    // Obtener el día correcto
    const day = date.getDate();
    const month = date.toLocaleString('es-CL', { month: 'long' });
    const year = date.getFullYear();
    
    // Formatear la fecha correctamente
    return `${day} de ${month} de ${year}`;
  };

  // Función para obtener el nombre del mes actual
  const getMonthName = (date: Date) => {
    return date.toLocaleString('es-CL', { month: 'long' }).toUpperCase();
  };

  // Función para cambiar al mes anterior
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // Función para cambiar al mes siguiente
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Función para verificar si un día tiene slots disponibles
  const hasSlotsForDate = (dateStr: string) => {
    return filteredDays.some(day => day.date === dateStr && day.slots.length > 0);
  };

  // Función para generar el calendario del mes actual
  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Primer día del mes
    const firstDayOfMonth = new Date(year, month, 1);
    // Último día del mes
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Día de la semana del primer día (0 = domingo, 1 = lunes, etc.)
    const firstDayWeekday = firstDayOfMonth.getDay();
    // Ajustar para que la semana comience en lunes (0 = lunes, 6 = domingo)
    const adjustedFirstDayWeekday = firstDayWeekday === 0 ? 6 : firstDayWeekday - 1;
    
    // Total de días en el mes
    const daysInMonth = lastDayOfMonth.getDate();
    
    // Arreglo para almacenar las semanas del calendario
    const calendar: (number | null)[][] = [];
    
    // Primera semana con días del mes anterior
    let week: (number | null)[] = Array(adjustedFirstDayWeekday).fill(null);
    
    // Agregar los días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      week.push(day);
      
      // Si es el último día de la semana o el último día del mes, agregar la semana al calendario
      if (week.length === 7 || day === daysInMonth) {
        // Si la última semana no está completa, rellenar con null
        while (week.length < 7) {
          week.push(null);
        }
        
        calendar.push(week);
        week = [];
      }
    }
    
    return calendar;
  };

  // Generar el calendario
  const calendar = generateCalendar();

  // Función para formatear una fecha como string YYYY-MM-DD
  const formatDateString = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // Colores para los meses
  const monthColors: Record<number, string> = {
    0: 'border-yellow-400 text-yellow-600', // Enero
    1: 'border-red-400 text-red-600', // Febrero
    2: 'border-blue-400 text-blue-600', // Marzo
    3: 'border-green-400 text-green-600', // Abril
    4: 'border-teal-400 text-teal-600', // Mayo
    5: 'border-blue-400 text-blue-600', // Junio
    6: 'border-yellow-400 text-yellow-600', // Julio
    7: 'border-red-400 text-red-600', // Agosto
    8: 'border-orange-400 text-orange-600', // Septiembre
    9: 'border-yellow-400 text-yellow-600', // Octubre
    10: 'border-teal-400 text-teal-600', // Noviembre
    11: 'border-blue-400 text-blue-600', // Diciembre
  };

  const currentMonthColor = monthColors[currentMonth.getMonth()];
  
  return (
    <div className="p-6">
      {/* Calendario */}
      <div className="mb-6">
        <div className={`border-2 rounded-lg p-4 ${currentMonthColor}`}>
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={goToPreviousMonth}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-lg font-semibold">
              {getMonthName(currentMonth)} {currentMonth.getFullYear()}
            </h3>
            <button 
              onClick={goToNextMonth}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Días de la semana */}
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, index) => (
              <div key={index} className="font-medium text-gray-700 py-1">
                {day}
              </div>
            ))}
            
            {/* Días del mes */}
            {calendar.map((week, weekIndex) => (
              week.map((day, dayIndex) => {
                if (day === null) {
                  return (
                    <div 
                      key={`${weekIndex}-${dayIndex}`} 
                      className="py-2 text-gray-300"
                    >
                      &nbsp;
                    </div>
                  );
                }
                
                const dateStr = formatDateString(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth(),
                  day
                );
                
                const isToday = dateStr === today.toISOString().split('T')[0];
                const isSelected = dateStr === selectedDate;
                const hasSlots = hasSlotsForDate(dateStr);
                const isPast = new Date(dateStr) < today;
                
                return (
                  <div 
                    key={`${weekIndex}-${dayIndex}`}
                    className={`
                      py-2 rounded-full w-8 h-8 mx-auto flex items-center justify-center
                      ${isSelected ? 'bg-[#2A6877] text-white' : ''}
                      ${isToday && !isSelected ? 'border border-[#2A6877] text-[#2A6877]' : ''}
                      ${hasSlots && !isPast && !isSelected ? 'cursor-pointer hover:bg-gray-200' : ''}
                      ${!hasSlots || isPast ? 'text-gray-400' : 'text-gray-700'}
                    `}
                    onClick={() => {
                      if (hasSlots && !isPast) {
                        onDateSelect(dateStr);
                      }
                    }}
                  >
                    {day}
                  </div>
                );
              })
            ))}
          </div>
        </div>
      </div>

      {/* Fecha seleccionada */}
      {selectedDate && (
        <div className="mb-4 text-center">
          <h3 className="text-lg font-medium text-gray-900">
            {correctFormatDate(selectedDate)}
          </h3>
        </div>
      )}

      {/* Time slots */}
      {selectedDay && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {selectedDay.slots.map((slot, index) => (
            <button
              key={`${slot.start_time}-${index}`}
              className="bg-white border border-gray-200 rounded-md p-3 hover:bg-gray-50 transition-colors text-center"
              onClick={() => handleSlotSelect(selectedDay.date, slot.start_time, slot.end_time)}
            >
              <span className="block text-gray-900 font-medium">
                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DaySelector;