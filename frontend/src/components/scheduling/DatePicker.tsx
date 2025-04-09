import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { getMonthlyAvailability, DailyAvailability } from '../../services/appointmentService';

interface DatePickerProps {
  psychologistId: number;
  onSelectDate: (date: Date | null) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ psychologistId, onSelectDate }) => {
  const [currentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availabilityData, setAvailabilityData] = useState<DailyAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch availability data when month or psychologist changes
  useEffect(() => {
    if (psychologistId) {
      setLoading(true);
      setError('');
      
      getMonthlyAvailability(psychologistId, currentYear, currentMonth)
        .then(data => {
          console.log('Monthly availability data:', data);
          setAvailabilityData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching monthly availability:', err);
          setError('Error al cargar la disponibilidad');
          setAvailabilityData([]);
          setLoading(false);
        });
    }
  }, [psychologistId, currentMonth, currentYear]);

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get day of week for first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
    onSelectDate(null);
  };

  // Navigate to next month
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
    onSelectDate(null);
  };

  // Handle date selection
  const handleDateClick = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    
    // Don't allow selecting dates in the past
    if (newDate < new Date(currentDate.setHours(0, 0, 0, 0))) {
      return;
    }
    
    // Check if the date has available slots
    const dateString = newDate.toISOString().split('T')[0];
    const dateAvailability = availabilityData.find(d => d.date === dateString);
    
    if (!dateAvailability || !dateAvailability.hasAvailableSlots) {
      return; // Don't select dates without available slots
    }
    
    if (selectedDate && 
        selectedDate.getDate() === day && 
        selectedDate.getMonth() === currentMonth && 
        selectedDate.getFullYear() === currentYear) {
      // Deselect if already selected
      setSelectedDate(null);
      onSelectDate(null);
    } else {
      // Select new date
      setSelectedDate(newDate);
      onSelectDate(newDate);
    }
  };

  // Check if a date has available slots
  const hasAvailableSlots = (day: number) => {
    const dateString = new Date(currentYear, currentMonth, day).toISOString().split('T')[0];
    const dateAvailability = availabilityData.find(d => d.date === dateString);
    return dateAvailability?.hasAvailableSlots || false;
  };

  // Check if a date is in the past
  const isDateInPast = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    return date < new Date(currentDate.setHours(0, 0, 0, 0));
  };

  // Render calendar
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
    
    // Adjust for Monday as first day of week (0 = Monday, 6 = Sunday)
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isPast = isDateInPast(day);
      const isAvailable = hasAvailableSlots(day);
      const isSelected = selectedDate && 
                         selectedDate.getDate() === day && 
                         selectedDate.getMonth() === currentMonth && 
                         selectedDate.getFullYear() === currentYear;
      
      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          disabled={isPast || !isAvailable}
          className={`h-10 w-10 rounded-full flex items-center justify-center text-sm
            ${isSelected ? 'bg-blue-600 text-white' : ''}
            ${!isSelected && isAvailable && !isPast ? 'hover:bg-gray-200' : ''}
            ${isPast ? 'text-gray-300 cursor-not-allowed' : ''}
            ${!isAvailable && !isPast ? 'text-gray-400 cursor-not-allowed' : ''}
            ${isAvailable && !isPast && !isSelected ? 'text-blue-600 font-medium' : ''}
          `}
        >
          {day}
        </button>
      );
    }
    
    return days;
  };

  // Get month name
  const getMonthName = (month: number) => {
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return monthNames[month];
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-1 rounded-full hover:bg-gray-200"
          aria-label="Mes anterior"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <h3 className="text-lg font-medium">
          {getMonthName(currentMonth)} {currentYear}
        </h3>
        <button
          onClick={goToNextMonth}
          className="p-1 rounded-full hover:bg-gray-200"
          aria-label="Mes siguiente"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>
      
      {loading ? (
        <div className="text-center py-4">
          <div className="animate-pulse">Cargando disponibilidad...</div>
        </div>
      ) : error ? (
        <div className="text-center py-4 text-red-500">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, index) => (
              <div key={index} className="h-8 flex items-center justify-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>
        </>
      )}
      
      <div className="mt-4 text-xs text-gray-500">
        <div className="flex items-center mb-1">
          <div className="h-3 w-3 rounded-full bg-blue-600 mr-2"></div>
          <span>Días con horarios disponibles</span>
        </div>
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full bg-gray-300 mr-2"></div>
          <span>Días sin disponibilidad</span>
        </div>
      </div>
    </div>
  );
};

export default DatePicker;