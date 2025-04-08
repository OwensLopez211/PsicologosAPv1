import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

interface DatePickerProps {
  onSelectDate: (date: Date) => void;
  schedule: any;
  minDate?: Date;
  maxDate?: Date;
}

const DatePicker: React.FC<DatePickerProps> = ({
  onSelectDate,
  schedule,
  minDate = new Date(),
  maxDate = new Date(new Date().setMonth(new Date().getMonth() + 3)) // 3 months from now
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get days of the week in Spanish
  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  
  // Get month names in Spanish
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    // Add empty days for the start of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  // Check if a date is available based on the psychologist's schedule
  const isDateAvailable = (date: Date) => {
    if (!schedule) return false;
    
    const dayOfWeek = date.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];
    
    // Check if the psychologist works on this day
    return schedule[dayName]?.enabled || false;
  };

  // Check if a date is selectable (within min/max range and available)
  const isDateSelectable = (date: Date | null) => {
    if (!date) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return (
      date >= today &&
      date >= minDate &&
      date <= maxDate &&
      isDateAvailable(date)
    );
  };

  // Format date as YYYY-MM-DD
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Handle date selection
  const handleDateClick = (date: Date | null) => {
    if (date && isDateSelectable(date)) {
      setSelectedDate(date);
      onSelectDate(date);
    }
  };

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Get days for the current month
  const days = getDaysInMonth(currentMonth);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-1 rounded-full hover:bg-gray-200 transition-colors"
          aria-label="Mes anterior"
        >
          <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
        </button>
        <h3 className="font-medium text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          onClick={nextMonth}
          className="p-1 rounded-full hover:bg-gray-200 transition-colors"
          aria-label="Mes siguiente"
        >
          <ChevronRightIcon className="h-5 w-5 text-gray-600" />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map((day, index) => (
          <div key={index} className="text-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <div
            key={index}
            className={`
              h-9 flex items-center justify-center text-sm rounded-full cursor-pointer
              ${!day ? 'invisible' : ''}
              ${day && isDateSelectable(day) ? 'hover:bg-blue-100' : 'text-gray-300 cursor-not-allowed'}
              ${selectedDate && day && formatDate(selectedDate) === formatDate(day) ? 'bg-[#2A6877] text-white' : ''}
            `}
            onClick={() => handleDateClick(day)}
          >
            {day ? day.getDate() : ''}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DatePicker;