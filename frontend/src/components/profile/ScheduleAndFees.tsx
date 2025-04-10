import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { updateSchedule, getCurrentUserSchedule } from '../../services/scheduleService';
import { updateSuggestedPrice, getSuggestedPrice } from '../../services/pricingService';
import toast from 'react-hot-toast';
import SuggestedPriceField from './SuggestedPriceField';

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

interface ScheduleAndFeesProps {
  profile?: any;
  onSave?: (data: any) => void; // Make onSave optional
  isLoading: boolean;
  onLoadingChange?: (loading: boolean) => void;
}

// Default schedule template
const defaultSchedule: ScheduleData = {
  monday: { enabled: false, timeBlocks: [{ startTime: '09:00', endTime: '17:00' }] },
  tuesday: { enabled: false, timeBlocks: [{ startTime: '09:00', endTime: '17:00' }] },
  wednesday: { enabled: false, timeBlocks: [{ startTime: '09:00', endTime: '17:00' }] },
  thursday: { enabled: false, timeBlocks: [{ startTime: '09:00', endTime: '17:00' }] },
  friday: { enabled: false, timeBlocks: [{ startTime: '09:00', endTime: '17:00' }] },
  saturday: { enabled: false, timeBlocks: [{ startTime: '09:00', endTime: '13:00' }] },
  sunday: { enabled: false, timeBlocks: [{ startTime: '09:00', endTime: '13:00' }] },
};

const ScheduleAndFees = ({ profile, onSave, isLoading, onLoadingChange }: ScheduleAndFeesProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleData>(defaultSchedule);
  const [showScheduleSummary, setShowScheduleSummary] = useState(true);
  const [localSchedule, setLocalSchedule] = useState<ScheduleData | null>(null);
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);

  const daysOfWeek = [
    { id: 'monday', label: 'Lunes' },
    { id: 'tuesday', label: 'Martes' },
    { id: 'wednesday', label: 'Miércoles' },
    { id: 'thursday', label: 'Jueves' },
    { id: 'friday', label: 'Viernes' },
    { id: 'saturday', label: 'Sábado' },
    { id: 'sunday', label: 'Domingo' },
  ];

  // Add a new useEffect to fetch the schedule when the component mounts
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLocalLoading(true);
        if (onLoadingChange) onLoadingChange(true);
        
        console.log("Fetching schedule data...");
        const scheduleData = await getCurrentUserSchedule();
        console.log("Fetched schedule data:", scheduleData);
        
        if (scheduleData && scheduleData.schedule_config) {
          // Process the schedule data
          const fetchedSchedule = processScheduleData(scheduleData.schedule_config);
          setSchedule(fetchedSchedule);
          setLocalSchedule(fetchedSchedule);
        }
      } catch (error) {
        console.error("Error fetching schedule:", error);
        // Show a toast notification for the error
        toast.error("No se pudo cargar tu horario. Por favor, intenta de nuevo más tarde.");
        // Keep using the default schedule if there's an error
      } finally {
        setLocalLoading(false);
        if (onLoadingChange) onLoadingChange(false);
      }
    };
    
    fetchSchedule();
  }, [onLoadingChange]);

  // Add a helper function to process the schedule data
  const processScheduleData = (scheduleConfig: any) => {
    // Start with the default schedule to ensure all days are included
    const processedSchedule = { ...defaultSchedule };
    
    // Update with the fetched data
    for (const day in scheduleConfig) {
      if (processedSchedule[day]) {
        processedSchedule[day] = {
          enabled: true, // If the day exists in the config, it's enabled
          timeBlocks: scheduleConfig[day].timeBlocks || [{ startTime: '09:00', endTime: '17:00' }]
        };
      }
    }
    
    console.log("Processed schedule data:", processedSchedule);
    return processedSchedule;
  };

  // Add a new useEffect to fetch the suggested price when the component mounts
  useEffect(() => {
    const fetchSuggestedPrice = async () => {
      try {
        setPriceLoading(true);
        const priceData = await getSuggestedPrice();
        if (priceData && priceData.suggested_price !== undefined) {
          setSuggestedPrice(priceData.suggested_price);
        }
      } catch (error) {
        console.error("Error fetching suggested price:", error);
      } finally {
        setPriceLoading(false);
      }
    };
    
    fetchSuggestedPrice();
  }, []);

  // Modify the existing useEffect to handle profile updates for price
  useEffect(() => {
    console.log("Profile data received:", profile);
    
    if (profile) {
      // Handle schedule config
      if (profile.schedule_config) {
        try {
          const profileSchedule = processScheduleData(profile.schedule_config);
          setSchedule(profileSchedule);
          setLocalSchedule(profileSchedule);
        } catch (error) {
          console.error('Error parsing schedule data from profile:', error);
        }
      }
      
      // Handle suggested price
      if (profile.suggested_price !== undefined) {
        setSuggestedPrice(profile.suggested_price);
      }
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if at least one day is enabled and has time blocks
    const hasValidSchedule = Object.values(schedule).some(day => 
      day.enabled && day.timeBlocks.length > 0
    );
    
    console.log('Schedule validation:', { hasValidSchedule, schedule });
    
    if (!hasValidSchedule) {
      toast.error('Debes configurar al menos un día de atención con horarios.');
      return;
    }
    
    const isValid = validateSchedule();
    if (!isValid) {
      toast.error('Por favor, verifica que los horarios de inicio sean anteriores a los de fin.');
      return;
    }
    
    setLocalLoading(true);
    if (onLoadingChange) onLoadingChange(true);
    
    try {
      // Create cleaned schedule with all days, but only enabled ones have timeBlocks
      const cleanedSchedule = Object.keys(schedule).reduce((acc, day) => {
        acc[day] = {
          enabled: schedule[day].enabled,
          timeBlocks: schedule[day].enabled ? schedule[day].timeBlocks : []
        };
        return acc;
      }, {} as ScheduleData);
      
      await updateSchedule({ schedule: cleanedSchedule });
      setLocalSchedule(schedule);
      
      // Only call onSave if it exists
      if (onSave) {
        onSave({ schedule: cleanedSchedule });
      }
      
      toast.success('Horario actualizado correctamente');
      setIsEditing(false);
      setShowScheduleSummary(true);
      
      console.log('Schedule saved:', cleanedSchedule);
    } catch (error: any) {
      console.error('Error al actualizar el horario:', error);
      // Provide more specific error message if available
      const errorMessage = error.response?.data?.detail || 
                          'Ocurrió un error al actualizar el horario. Por favor, inténtalo de nuevo.';
      toast.error(errorMessage);
    } finally {
      setLocalLoading(false);
      if (onLoadingChange) onLoadingChange(false);
    }
  };

  const validateSchedule = () => {
    // Verificar que para cada bloque de tiempo, la hora de inicio sea anterior a la de fin
    for (const day in schedule) {
      if (schedule[day].enabled) {
        for (const block of schedule[day].timeBlocks) {
          if (block.startTime >= block.endTime) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const handleDayToggle = (day: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled,
      }
    }));
  };

  const handleTimeChange = (day: string, blockIndex: number, field: 'startTime' | 'endTime', value: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeBlocks: prev[day].timeBlocks.map((block, idx) =>
          idx === blockIndex ? { ...block, [field]: value } : block
        ),
      }
    }));
  };

  const addTimeBlock = (day: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeBlocks: [
          ...prev[day].timeBlocks,
          { startTime: '09:00', endTime: '17:00' }
        ],
      }
    }));
  };

  const removeTimeBlock = (day: string, blockIndex: number) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeBlocks: prev[day].timeBlocks.filter((_, idx) => idx !== blockIndex),
      }
    }));
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

  // Generate a summary of the schedule - use localSchedule if available
  const getScheduleSummary = () => {
    // Use localSchedule if available (for immediate updates), otherwise use schedule from props
    const currentSchedule = localSchedule || schedule;
    const activeDays = daysOfWeek.filter(day => currentSchedule[day.id].enabled);
    
    if (activeDays.length === 0) {
      return <p className="text-gray-500 italic">No hay horarios configurados</p>;
    }
    
    return (
      <div className="space-y-2">
        {activeDays.map(day => (
          <div key={day.id} className="flex items-center">
            <div className="w-24 font-medium text-gray-700">{day.label}:</div>
            <div className="flex flex-wrap gap-2">
              {currentSchedule[day.id].timeBlocks.map((block, index) => (
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
    <div className="space-y-6">
      {/* Schedule Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📅</span>
            <h2 className="text-xl font-semibold text-gray-900">Horarios de Atención</h2>
          </div>
          {!isEditing ? (
            <button
              type="button"
              onClick={() => {
                setIsEditing(true);
                setShowScheduleSummary(false);
              }}
              className="inline-flex items-center px-4 py-2 border border-[#2A6877] text-sm font-medium rounded-md text-[#2A6877] hover:bg-gray-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Editar
            </button>
          ) : (
            <div className="text-sm text-gray-500">
              Selecciona los días y configura tus horarios de atención
            </div>
          )}
        </div>

        {/* Schedule Summary View */}
        {!isEditing && showScheduleSummary && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 p-4 mb-6"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tu horario actual</h3>
            {getScheduleSummary()}
          </motion.div>
        )}

        {/* Schedule Editor */}
        {isEditing && (
          <motion.form 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit} 
            className="space-y-6"
          >
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {daysOfWeek.map(({ id, label }) => (
                  <div key={id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={schedule[id].enabled}
                          onChange={() => handleDayToggle(id)}
                          className="h-5 w-5 text-[#2A6877] focus:ring-[#2A6877] border-gray-300 rounded"
                        />
                        <span className="ml-2 font-medium text-gray-700">{label}</span>
                      </label>
                      {schedule[id].enabled && (
                        <button
                          type="button"
                          onClick={() => addTimeBlock(id)}
                          className="text-sm text-[#2A6877] hover:text-[#235A67] flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          Agregar
                        </button>
                      )}
                    </div>

                    {schedule[id].enabled && (
                      <div className="space-y-3">
                        {schedule[id].timeBlocks.map((block, blockIndex) => (
                          <div key={blockIndex} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                            <input
                              type="time"
                              value={block.startTime}
                              onChange={(e) => handleTimeChange(id, blockIndex, 'startTime', e.target.value)}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2A6877] focus:ring-[#2A6877] text-sm"
                            />
                            <span className="text-gray-500">a</span>
                            <input
                              type="time"
                              value={block.endTime}
                              onChange={(e) => handleTimeChange(id, blockIndex, 'endTime', e.target.value)}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2A6877] focus:ring-[#2A6877] text-sm"
                            />
                            {schedule[id].timeBlocks.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeTimeBlock(id, blockIndex)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setShowScheduleSummary(true);
                  if (profile?.schedule) {
                    setSchedule(profile.schedule);
                  }
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={localLoading || isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={localLoading || isLoading}
                className="px-4 py-2 bg-[#2A6877] text-white rounded-md hover:bg-[#235A67] disabled:opacity-50"
              >
                {(localLoading || isLoading) ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </span>
                ) : 'Guardar cambios'}
              </button>
            </div>
          </motion.form>
        )}
      </div>

      {/* Pricing Section - Always visible regardless of schedule editing state */}
      <div className="mt-8">
        <SuggestedPriceField 
          initialPrice={profile?.suggested_price} 
          onPriceUpdate={(price) => {
            if (onSave) {
              onSave({ suggested_price: price });
            }
          }}
        />
      </div>

    </div>
  );
};

export default ScheduleAndFees;