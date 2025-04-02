import { useAuth } from '../../context/AuthContext';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface TimeBlock {
  startTime: string;
  endTime: string;
}

interface DaySchedule {
  enabled: boolean;
  timeBlocks: TimeBlock[];
}

interface ScheduleData {
  [key: string]: DaySchedule;
}

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  specialistId: number;
  specialistName: string;
}

const ScheduleModal = ({ isOpen, onClose, specialistId, specialistName }: ScheduleModalProps) => {
  const { isAuthenticated } = useAuth();
  const [schedule, setSchedule] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch the psychologist's schedule when the modal opens
  useEffect(() => {
    if (isOpen && isAuthenticated && specialistId) {
      fetchPsychologistSchedule();
    }
  }, [isOpen, specialistId, isAuthenticated]);

  const fetchPsychologistSchedule = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Adjust the endpoint to match your API
      const response = await axios.get(`/api/profiles/psychologist-profiles/${specialistId}/schedule/`);
      
      if (response.data && response.data.schedule_config) {
        setSchedule(response.data.schedule_config);
      } else {
        setSchedule(null);
        setError('No hay horarios disponibles para este especialista');
      }
    } catch (err) {
      console.error('Error fetching psychologist schedule:', err);
      setError('Error al cargar el horario del especialista');
    } finally {
      setLoading(false);
    }
  };

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

  // Generate a summary of the schedule
  const getScheduleSummary = () => {
    if (!schedule) return null;
    
    const daysOfWeek = [
      { id: 'monday', label: 'Lunes' },
      { id: 'tuesday', label: 'Martes' },
      { id: 'wednesday', label: 'Miércoles' },
      { id: 'thursday', label: 'Jueves' },
      { id: 'friday', label: 'Viernes' },
      { id: 'saturday', label: 'Sábado' },
      { id: 'sunday', label: 'Domingo' },
    ];
    
    const activeDays = daysOfWeek.filter(day => schedule[day.id]?.enabled);
    
    if (activeDays.length === 0) {
      return <p className="text-gray-500 italic">No hay horarios configurados</p>;
    }
    
    return (
      <div className="space-y-2">
        {activeDays.map(day => (
          <div key={day.id} className="flex items-center">
            <div className="w-24 font-medium text-gray-700">{day.label}:</div>
            <div className="flex flex-wrap gap-2">
              {schedule[day.id].timeBlocks.map((block, index) => (
                <span 
                  key={index} 
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {formatTime(block.startTime)} - {formatTime(block.endTime)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {isAuthenticated ? (
                  <>
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      Agendar consulta con {specialistName}
                    </Dialog.Title>
                    
                    <div className="mt-4">
                      {loading ? (
                        <div className="flex justify-center py-4">
                          <svg className="animate-spin h-6 w-6 text-[#2A6877]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      ) : error ? (
                        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                          {error}
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">Horarios disponibles:</h4>
                          {getScheduleSummary()}
                          
                          {/* Calendar component will be implemented here */}
                          <div className="mt-6 border-t pt-4">
                            <p className="text-sm text-gray-500">
                              Selecciona una fecha y hora para tu consulta
                            </p>
                            {/* Calendar implementation will go here */}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      Iniciar sesión requerido
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Para agendar una consulta, necesitas iniciar sesión primero.
                      </p>
                    </div>
                    <div className="mt-4 space-y-3">
                      <Link
                        to="/login"
                        className="w-full inline-flex justify-center rounded-md border border-transparent bg-[#2A6877] px-4 py-2 text-sm font-medium text-white hover:bg-[#235A67] focus:outline-none"
                      >
                        Iniciar sesión
                      </Link>
                      <Link
                        to="/registro"
                        className="w-full inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                      >
                        Crear cuenta
                      </Link>
                    </div>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ScheduleModal;