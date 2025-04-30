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
  
  // Debugging: Mostrar la fecha actual
  console.log('Fecha actual del sistema:', today.toISOString());
  console.log('Fecha sin timezone:', today.getFullYear() + '-' + 
    String(today.getMonth() + 1).padStart(2, '0') + '-' + 
    String(today.getDate()).padStart(2, '0'));
  
  // Organizar los días disponibles por mes para mejor navegación
  const [availableDaysByMonth, setAvailableDaysByMonth] = useState<{[key: string]: DaySlot[]}>({});
  
  // Listar todos los días disponibles para debugging
  useEffect(() => {
    console.log('TODOS LOS DÍAS DISPONIBLES:');
    availableDays.forEach(day => {
      console.log(`> ${day.date} (${day.day_name}): ${day.slots.length} slots`);
      // Verificar específicamente si existe el 30 de abril
      if (day.date === '2025-04-30') {
        console.log('*** SE ENCONTRÓ EL 30 DE ABRIL EN LOS DÍAS DISPONIBLES ***');
      }
    });
  }, [availableDays]);
  
  useEffect(() => {
    // Organizar los días disponibles por mes para facilitar la navegación
    const daysByMonth: {[key: string]: DaySlot[]} = {};
    
    availableDays.forEach(day => {
      // Asegurarnos de crear la fecha sin conversión de zona horaria (usar hora fija)
      const dateParts = day.date.split('-');
      if (dateParts.length !== 3) return;
      
      const year = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]) - 1; // Meses en JS son 0-11
      
      const monthKey = `${year}-${month + 1}`;
      
      if (!daysByMonth[monthKey]) {
        daysByMonth[monthKey] = [];
      }
      
      daysByMonth[monthKey].push(day);
    });
    
    console.log('Días disponibles por mes:', Object.keys(daysByMonth).map(key => 
      `${key}: ${daysByMonth[key].length} días`
    ));
    
    setAvailableDaysByMonth(daysByMonth);
  }, [availableDays]);
  
  // Función auxiliar para obtener una fecha YYYY-MM-DD sin conversión de zona horaria
  const getLocalDateString = (date: Date): string => {
    return date.getFullYear() + '-' + 
      String(date.getMonth() + 1).padStart(2, '0') + '-' + 
      String(date.getDate()).padStart(2, '0');
  };
  
  // Filtrar los días disponibles para mostrar solo desde hoy en adelante
  const filteredDays = availableDays.filter(day => {
    // Importante: Comparar fechas como strings para evitar problemas de zona horaria
    const todayStr = getLocalDateString(today);
    
    // Comparar fechas como strings (YYYY-MM-DD)
    const result = day.date >= todayStr;
    console.log(`Comparando: ${day.date} >= ${todayStr} = ${result}`);
    return result;
  }).map(day => {
    // Si es el día de hoy, filtrar también los horarios que ya han pasado
    const todayStr = getLocalDateString(today);
    
    if (day.date === todayStr) {
      // Filtrar slots que no han pasado aún
      const currentHour = now.getHours();
      const currentMinutes = now.getMinutes();
      
      console.log(`Filtrando slots para hoy (${todayStr}), hora actual: ${currentHour}:${currentMinutes}`);
      
      const availableSlots = day.slots.filter(slot => {
        // Convertir la hora de inicio a horas y minutos
        const [hours, minutes] = slot.start_time.split(':').map(Number);
        
        // Comparar con la hora actual
        const isAvailable = (hours > currentHour) || 
                            (hours === currentHour && minutes > currentMinutes);
                            
        console.log(`- Slot ${slot.start_time}-${slot.end_time}: ${isAvailable ? 'Disponible' : 'No disponible'}`);
        
        return isAvailable;
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
  
  // Verificar específicamente el 30 de abril en los días filtrados
  useEffect(() => {
    const april30Found = filteredDays.some(day => day.date === '2025-04-30');
    console.log('¿El 30 de abril está en los días filtrados?', april30Found);
  }, [filteredDays]);
  
  // Obtener los días disponibles para el mes actual que se está mostrando
  const getCurrentMonthKey = () => {
    return `${currentMonth.getFullYear()}-${currentMonth.getMonth() + 1}`;
  };
  
  // Obtener los días filtrados para el mes actual
  const filteredDaysForCurrentMonth = filteredDays.filter(day => {
    const dateParts = day.date.split('-');
    if (dateParts.length !== 3) return false;
    
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // Meses en JS son 0-11
    
    return month === currentMonth.getMonth() && 
           year === currentMonth.getFullYear();
  });
  
  // Comprobar si hay disponibilidad en el mes actual
  const hasAvailabilityInCurrentMonth = filteredDaysForCurrentMonth.length > 0;
  console.log(`¿Hay disponibilidad en el mes actual (${getCurrentMonthKey()})?`, 
    hasAvailabilityInCurrentMonth, 
    `(${filteredDaysForCurrentMonth.length} días)`
  );
  
  // Comprobar si hay disponibilidad en el mes siguiente
  const nextMonth = new Date(currentMonth);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const nextMonthKey = `${nextMonth.getFullYear()}-${nextMonth.getMonth() + 1}`;
  
  // Verificar disponibilidad en el mes siguiente mirando a los días filtrados
  const hasAvailabilityInNextMonth = filteredDays.some(day => {
    const dateParts = day.date.split('-');
    if (dateParts.length !== 3) return false;
    
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // Meses en JS son 0-11
    
    return month === nextMonth.getMonth() && 
           year === nextMonth.getFullYear();
  });
  
  console.log(`¿Hay disponibilidad en el mes siguiente (${nextMonthKey})?`, hasAvailabilityInNextMonth);
  
  // Comprobar si hay disponibilidad en el mes anterior
  const prevMonth = new Date(currentMonth);
  prevMonth.setMonth(prevMonth.getMonth() - 1);
  const prevMonthKey = `${prevMonth.getFullYear()}-${prevMonth.getMonth() + 1}`;
  
  // Verificar disponibilidad en el mes anterior mirando a los días filtrados
  const hasAvailabilityInPrevMonth = filteredDays.some(day => {
    const dateParts = day.date.split('-');
    if (dateParts.length !== 3) return false;
    
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // Meses en JS son 0-11
    
    return month === prevMonth.getMonth() && 
           year === prevMonth.getFullYear();
  });
  
  console.log(`¿Hay disponibilidad en el mes anterior (${prevMonthKey})?`, hasAvailabilityInPrevMonth);
  
  // Actualizar la selección si el día seleccionado ya no está disponible
  useEffect(() => {
    if (filteredDays.length > 0) {
      // Si no hay fecha seleccionada o la fecha seleccionada no está en los días filtrados
      if (!selectedDate || !filteredDays.some(day => day.date === selectedDate)) {
        console.log(`No hay día seleccionado o el día seleccionado no está disponible. Seleccionando ${filteredDays[0].date}`);
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
    // Usar los componentes de la fecha directamente sin crear un objeto Date
    const dateParts = dateStr.split('-');
    if (dateParts.length !== 3) return dateStr;
    
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1;
    const day = parseInt(dateParts[2]);
    
    // Crear una fecha sin ajuste de zona horaria usando componentes específicos
    const date = new Date(year, month, day, 12, 0, 0);
    
    return date.getDate() + ' de ' + 
      date.toLocaleString('es-CL', { month: 'long' }) + ' de ' + 
      date.getFullYear();
  };

  // Función para obtener el nombre del mes actual
  const getMonthName = (date: Date) => {
    return date.toLocaleString('es-CL', { month: 'long' }).toUpperCase();
  };

  // Función para cambiar al mes anterior
  const goToPreviousMonth = () => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    
    // Convertir a fecha local sin ajustes de zona horaria
    const currentMonthNow = new Date();
    currentMonthNow.setDate(1);
    currentMonthNow.setHours(0, 0, 0, 0);
    
    console.log('Intentando cambiar al mes anterior:', 
      getMonthName(newDate), 
      newDate.getFullYear(), 
      `(¿Hay disponibilidad?: ${hasAvailabilityInPrevMonth})`
    );
    
    // Permitir cambiar al mes anterior si hay disponibilidad o si es el mes actual
    if (hasAvailabilityInPrevMonth || 
        (newDate.getMonth() === new Date().getMonth() && 
         newDate.getFullYear() === new Date().getFullYear())) {
      setCurrentMonth(newDate);
    }
  };

  // Función para cambiar al mes siguiente
  const goToNextMonth = () => {
    console.log('Intentando cambiar al mes siguiente:', 
      getMonthName(nextMonth), 
      nextMonth.getFullYear(), 
      `(¿Hay disponibilidad?: ${hasAvailabilityInNextMonth})`
    );
    
    // Solo permitir cambiar al mes siguiente si hay días disponibles en ese mes
    if (hasAvailabilityInNextMonth) {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    }
  };

  // Función para verificar si un día tiene slots disponibles
  const hasSlotsForDate = (dateStr: string) => {
    const hasSlots = filteredDays.some(day => day.date === dateStr && day.slots.length > 0);
    return hasSlots;
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
      {/* Información de disponibilidad por mes */}
      <div className="mb-4 text-sm text-gray-600 text-center">
        <p>Puede agendar sus citas para los próximos 30 días</p>
      </div>
      
      {/* Calendario */}
      <div className="mb-6">
        <div className={`border-2 rounded-lg p-4 ${currentMonthColor}`}>
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={goToPreviousMonth}
              className={`text-gray-600 hover:text-gray-900 ${
                !hasAvailabilityInPrevMonth &&
                (prevMonth.getMonth() !== new Date().getMonth() || 
                 prevMonth.getFullYear() !== new Date().getFullYear())
                  ? 'opacity-50 cursor-not-allowed' 
                  : ''
              }`}
              disabled={!hasAvailabilityInPrevMonth &&
                (prevMonth.getMonth() !== new Date().getMonth() || 
                 prevMonth.getFullYear() !== new Date().getFullYear())}
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
              className={`text-gray-600 hover:text-gray-900 ${
                !hasAvailabilityInNextMonth ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!hasAvailabilityInNextMonth}
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
                
                const isToday = dateStr === getLocalDateString(today);
                const isSelected = dateStr === selectedDate;
                const hasSlots = hasSlotsForDate(dateStr);
                
                // Usar comparación directa de strings para evitar problemas de timezone
                const todayStr = getLocalDateString(today);
                const isPast = dateStr < todayStr;
                
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
                        console.log(`Seleccionando fecha: ${dateStr}`);
                        onDateSelect(dateStr);
                      } else if (!hasSlots) {
                        console.log(`No hay slots disponibles para ${dateStr}`);
                      } else if (isPast) {
                        console.log(`La fecha ${dateStr} es en el pasado`);
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
        
        {/* Mensaje si no hay disponibilidad en el mes actual */}
        {!hasAvailabilityInCurrentMonth && (
          <div className="mt-3 text-center text-amber-600 text-sm">
            No hay horarios disponibles para este mes. 
            {hasAvailabilityInNextMonth && ' Intente el próximo mes.'}
          </div>
        )}
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