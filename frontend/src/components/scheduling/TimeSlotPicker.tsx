import { useState, useEffect } from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';
import { getAvailableTimeSlots, TimeSlot } from '../../services/appointmentService';

interface TimeSlotPickerProps {
  date: Date | null;
  psychologistId: number;  // This is the PsychologistProfile ID
  onSelectTimeSlot: (timeSlot: TimeSlot | null) => void;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({ 
  date, 
  psychologistId, 
  onSelectTimeSlot 
}) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  
  console.log('TimeSlotPicker received psychologistId:', psychologistId);

  useEffect(() => {
    // Reset selected slot when date changes
    setSelectedSlot(null);
    onSelectTimeSlot(null);
    
    // Only fetch time slots if we have a valid date and psychologist ID
    if (date && psychologistId) {
      setLoading(true);
      setError('');
      
      // Format date as YYYY-MM-DD
      const formattedDate = date.toISOString().split('T')[0];
      
      getAvailableTimeSlots(psychologistId, formattedDate)
        .then(slots => {
          console.log('Fetched time slots:', slots);
          setTimeSlots(slots);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching time slots:', err);
          setError('No se pudieron cargar los horarios disponibles');
          setTimeSlots([]);
          setLoading(false);
        });
    } else {
      setTimeSlots([]);
    }
  }, [date, psychologistId, onSelectTimeSlot]);

  const handleSelectTimeSlot = (timeSlot: TimeSlot) => {
    const newSelectedSlot = selectedSlot?.start_time === timeSlot.start_time ? null : timeSlot;
    setSelectedSlot(newSelectedSlot);
    onSelectTimeSlot(newSelectedSlot);
  };

  if (!date) {
    return (
      <div className="p-4 text-center text-gray-500">
        Por favor selecciona una fecha para ver los horarios disponibles.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-pulse flex justify-center">
          <ClockIcon className="h-8 w-8 text-blue-500" />
        </div>
        <p className="mt-2 text-gray-600">Cargando horarios disponibles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        {error}
      </div>
    );
  }

  if (timeSlots.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No hay horarios disponibles para esta fecha.
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-4">Horarios disponibles</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {timeSlots.map((slot, index) => (
          <button
            key={index}
            onClick={() => handleSelectTimeSlot(slot)}
            className={`py-2 px-3 rounded-md text-sm font-medium transition-colors
              ${selectedSlot?.start_time === slot.start_time
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
          >
            {slot.start_time} - {slot.end_time}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeSlotPicker;
