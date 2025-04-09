// Modificar el componente ScheduleModal para usar el ID correcto
import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import DatePicker from './DatePicker';
import TimeSlotPicker from './TimeSlotPicker';
import { createAppointment, TimeSlot, getAvailableTimeSlots } from '../../services/appointmentService';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ScheduleModalProps {
  specialistId: number;  // Este es el ID que recibimos (podría ser user_id o profile_id)
  specialistName: string;
  schedule: any;
  onClose: () => void;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ 
  specialistId, 
  specialistName, 
  schedule, 
  onClose 
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  console.log('ScheduleModal received specialistId:', specialistId);

  const handleDateSelect = (date: Date | null) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
    setHasError(false);
  };

  const handleTimeSlotSelect = (timeSlot: TimeSlot | null) => {
    setSelectedTimeSlot(timeSlot);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      toast.error('Debes iniciar sesión para agendar una cita');
      navigate('/login');
      return;
    }
    
    if (user.user_type !== 'client') {
      toast.error('Solo los clientes pueden agendar citas');
      return;
    }
    
    if (!selectedDate || !selectedTimeSlot) {
      toast.error('Por favor selecciona una fecha y un horario');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Format date as YYYY-MM-DD
      const formattedDate = selectedDate.toISOString().split('T')[0];
      
      // Usamos el mismo ID que funciona para obtener los slots disponibles
      await createAppointment({
        psychologist: specialistId,
        date: formattedDate,
        start_time: selectedTimeSlot.start_time,
        end_time: selectedTimeSlot.end_time,
        notes: notes
      });
      
      toast.success('Cita agendada correctamente');
      onClose();
      
      // Redirect to payment page or appointments page
      navigate('/dashboard/appointments');
    } catch (error) {
      console.error('Error creating appointment:', error);
      setHasError(true);
      // Toast error is handled in the service
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Agendar cita con {specialistName}</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200"
            aria-label="Cerrar"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        {hasError && (
          <div className="p-4 bg-red-50 border-b border-red-100">
            <p className="text-red-600 text-sm">
              Hubo un problema al agendar la cita. Por favor, inténtalo de nuevo más tarde.
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="border-b">
            <DatePicker 
              psychologistId={specialistId} 
              onSelectDate={handleDateSelect} 
            />
          </div>
          
          <div className="border-b">
            <TimeSlotPicker 
              date={selectedDate} 
              psychologistId={specialistId}
              onSelectTimeSlot={handleTimeSlotSelect} 
            />
          </div>
          
          <div className="p-4 border-b">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notas para el especialista (opcional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
              placeholder="Escribe cualquier información adicional que quieras compartir con el especialista"
            ></textarea>
          </div>
          
          <div className="p-4 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              disabled={!selectedDate || !selectedTimeSlot || isSubmitting}
            >
              {isSubmitting ? 'Agendando...' : 'Agendar cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleModal;