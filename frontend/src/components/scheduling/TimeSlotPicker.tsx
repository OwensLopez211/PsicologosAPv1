import { useState, useEffect } from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';
import { getAvailableTimeSlots, TimeSlot } from '../../services/appointmentService';

interface TimeSlotPickerProps {
  psychologistId: number;
  selectedDate: Date | null;
  onSelectTimeSlot: (timeSlot: TimeSlot | null) => void;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  psychologistId,
  selectedDate,
  onSelectTimeSlot
}) => {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Format time for display (e.g., "09:00" to "9:00 AM")
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

  // Fetch available time slots when date changes
  useEffect(() => {
    if (selectedDate && psychologistId) {
      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);
      setSelectedSlot(null);
      onSelectTimeSlot(null);
    }
  }, [selectedDate, psychologistId]);

  const fetchAvailableSlots = async () => {
    if (!selectedDate) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const slots = await getAvailableTimeSlots(psychologistId, formattedDate);
      setAvailableSlots(slots);
      
      if (slots.length === 0) {
        setError('No hay horarios disponibles para esta fecha');
      }
    } catch (err) {
      console.error('Error fetching available time slots:', err);
      setError('Error al cargar los horarios disponibles');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTimeSlot = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    onSelectTimeSlot(slot);
  };

  if (!selectedDate) {
    return (
      <div className="text-center py-4 text-gray-500">
        Selecciona una fecha para ver los horarios disponibles
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h4 className="font-medium text-gray-900 mb-3">
        Horarios disponibles para {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
      </h4>
      
      {loading ? (
        <div className="flex justify-center py-4">
          <svg className="animate-spin h-6 w-6 text-[#2A6877]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : error ? (
        <div className="text-center py-4 text-gray-500">
          {error}
        </div>
      ) : availableSlots.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          No hay horarios disponibles para esta fecha
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {availableSlots.map((slot, index) => (
            <button
              key={index}
              className={`
                flex items-center justify-center px-3 py-2 rounded-md text-sm
                ${selectedSlot && selectedSlot.start_time === slot.start_time ? 
                  'bg-[#2A6877] text-white' : 
                  'bg-blue-50 text-blue-800 hover:bg-blue-100'}
              `}
              onClick={() => handleSelectTimeSlot(slot)}
            >
              <ClockIcon className="h-4 w-4 mr-1" />
              {formatTime(slot.start_time)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimeSlotPicker;