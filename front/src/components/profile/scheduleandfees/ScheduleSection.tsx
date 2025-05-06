import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { updateSchedule } from '../../../services/scheduleService';
import toast from 'react-hot-toast';
import { CheckIcon, PlusIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';

interface TimeBlock {
  startTime: string;
  endTime: string;
}

interface DaySchedule {
  enabled: boolean;
  timeBlocks: TimeBlock[];
}

export interface ScheduleData {
  [key: string]: DaySchedule;
}

interface ScheduleSectionProps {
  schedule: ScheduleData;
  onScheduleChange: (newSchedule: ScheduleData) => void;
  isLoading: boolean;
  onLoadingChange?: (loading: boolean) => void;
  onSubmitSuccess?: () => void;
}

const ScheduleSection = ({ 
  schedule, 
  onScheduleChange,
  isLoading, 
  onLoadingChange,
  onSubmitSuccess
}: ScheduleSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [localSchedule, setLocalSchedule] = useState<ScheduleData>(schedule);
  const [showScheduleSummary, setShowScheduleSummary] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const daysOfWeek = [
    { id: 'monday', label: 'Lunes', color: 'from-blue-500/20 to-blue-600/10' },
    { id: 'tuesday', label: 'Martes', color: 'from-indigo-500/20 to-indigo-600/10' },
    { id: 'wednesday', label: 'Miércoles', color: 'from-purple-500/20 to-purple-600/10' },
    { id: 'thursday', label: 'Jueves', color: 'from-pink-500/20 to-pink-600/10' },
    { id: 'friday', label: 'Viernes', color: 'from-[#2A6877]/20 to-[#2A6877]/10' },
    { id: 'saturday', label: 'Sábado', color: 'from-orange-500/20 to-orange-600/10' },
    { id: 'sunday', label: 'Domingo', color: 'from-red-500/20 to-red-600/10' },
  ];

  // Update local schedule when parent schedule changes
  useEffect(() => {
    setLocalSchedule(schedule);
  }, [schedule]);

  // Reset success message after delay
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (saveSuccess) {
      timer = setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [saveSuccess]);

  console.log("isEditing:", isEditing); // Debug log

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if at least one day is enabled and has time blocks
    const hasValidSchedule = Object.values(localSchedule).some(day => 
      day.enabled && day.timeBlocks.length > 0
    );
    
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
      const cleanedSchedule = Object.keys(localSchedule).reduce((acc, day) => {
        acc[day] = {
          enabled: localSchedule[day].enabled,
          timeBlocks: localSchedule[day].enabled ? localSchedule[day].timeBlocks : []
        };
        return acc;
      }, {} as ScheduleData);
      
      await updateSchedule({ schedule: cleanedSchedule });
      
      // Update parent component
      onScheduleChange(cleanedSchedule);
      
      setSaveSuccess(true);
      setIsEditing(false);
      setShowScheduleSummary(true);
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
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
    for (const day in localSchedule) {
      if (localSchedule[day].enabled) {
        for (const block of localSchedule[day].timeBlocks) {
          if (block.startTime >= block.endTime) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const handleDayToggle = (day: string) => {
    setLocalSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled,
      }
    }));
  };

  const handleTimeChange = (day: string, blockIndex: number, field: 'startTime' | 'endTime', value: string) => {
    setLocalSchedule(prev => ({
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
    setLocalSchedule(prev => ({
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
    setLocalSchedule(prev => ({
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

  // Generate a summary of the schedule
  const getScheduleSummary = () => {
    const activeDays = daysOfWeek.filter(day => localSchedule[day.id].enabled);
    
    if (activeDays.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-4 sm:py-6 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2 sm:mb-3">
            <ClockIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 italic text-sm sm:text-base">No hay horarios configurados</p>
          <p className="text-gray-400 text-xs sm:text-sm mt-0.5 sm:mt-1">Haz clic en "Editar" para configurar tus horarios de atención</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {activeDays.map(day => {
          const dayInfo = daysOfWeek.find(d => d.id === day.id);
          return (
            <motion.div 
              key={day.id} 
              className={`rounded-lg bg-gradient-to-br ${dayInfo?.color} p-3 sm:p-4 border border-gray-100`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="font-medium text-gray-700 text-sm sm:text-lg mb-1.5 sm:mb-2 border-b border-gray-200 pb-1">
                {day.label}
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                {localSchedule[day.id].timeBlocks.map((block, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-1.5 sm:gap-2 bg-white/70 backdrop-blur-sm p-1.5 sm:p-2 rounded-lg shadow-sm"
                  >
                    <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4 text-[#2A6877]" />
                    <span className="text-gray-700 font-medium text-xs sm:text-sm">
                      {formatTime(block.startTime)} - {formatTime(block.endTime)}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.1 
      } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.3 } 
    }
  };

  return (
    <motion.div 
      className="space-y-3 sm:space-y-4 bg-white/90 backdrop-blur-sm p-3 sm:p-6 rounded-xl shadow-sm border border-gray-100"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#2A6877] to-[#B4E4D3] text-white">
            <motion.span 
              className="text-xl sm:text-2xl"
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              📅
            </motion.span>
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-semibold text-gray-900">Horarios de Atención</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Define cuándo estás disponible para atender pacientes</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <AnimatePresence>
            {saveSuccess && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-green-50 text-green-600 rounded-full text-xs sm:text-sm"
              >
                <CheckIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Guardado</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          <AnimatePresence>
            {!isEditing ? (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => {
                  setIsEditing(true);
                  setShowScheduleSummary(false);
                }}
                className="inline-flex items-center px-2 sm:px-4 py-1 sm:py-2 border border-[#2A6877] text-xs sm:text-sm font-medium rounded-full text-[#2A6877] hover:bg-[#2A6877] hover:text-white transition-all shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Editar
              </motion.button>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* Schedule Summary View */}
      <AnimatePresence>
        {!isEditing && showScheduleSummary && (
          <motion.div 
            variants={itemVariants}
            className="bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 p-3 sm:p-4 mt-2 sm:mt-4"
          >
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4 flex items-center">
              <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-[#2A6877]" />
              Tu horario actual
            </h3>
            {getScheduleSummary()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schedule Editor */}
      {isEditing && (
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          onSubmit={handleSubmit} 
          className="space-y-4 sm:space-y-6 mt-3 sm:mt-4"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 p-3 sm:p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {daysOfWeek.map(({ id, label, color }) => (
                <motion.div 
                  key={id} 
                  className={`rounded-lg p-3 sm:p-4 transition-all bg-white shadow-sm border ${
                    localSchedule[id].enabled ? `border-[#2A6877]/30 bg-gradient-to-br ${color}` : 'border-gray-200'
                  }`}
                  whileHover={{ y: -2, boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}
                >
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localSchedule[id].enabled}
                        onChange={() => handleDayToggle(id)}
                        className="h-4 w-4 sm:h-5 sm:w-5 text-[#2A6877] focus:ring-[#2A6877] border-gray-300 rounded"
                      />
                      <span className={`ml-1.5 sm:ml-2 font-semibold text-sm sm:text-base ${localSchedule[id].enabled ? 'text-gray-800' : 'text-gray-500'}`}>
                        {label}
                      </span>
                    </label>
                    {localSchedule[id].enabled && (
                      <motion.button
                        type="button"
                        onClick={() => addTimeBlock(id)}
                        className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-white/80 text-xs sm:text-sm text-[#2A6877] hover:text-white hover:bg-[#2A6877] rounded-full border border-[#2A6877]/30 flex items-center shadow-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <PlusIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-0.5 sm:mr-1" />
                        Horario
                      </motion.button>
                    )}
                  </div>

                  <AnimatePresence>
                    {localSchedule[id].enabled && (
                      <motion.div 
                        className="space-y-2 sm:space-y-3"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        {localSchedule[id].timeBlocks.map((block, blockIndex) => (
                          <motion.div 
                            key={blockIndex} 
                            className="flex items-center gap-1.5 sm:gap-2 bg-white/90 p-2 sm:p-3 rounded-lg border border-[#2A6877]/20 shadow-sm"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: blockIndex * 0.1 }}
                            whileHover={{ y: -1 }}
                          >
                            <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4 text-[#2A6877] flex-shrink-0" />
                            <input
                              type="time"
                              value={block.startTime}
                              onChange={(e) => handleTimeChange(id, blockIndex, 'startTime', e.target.value)}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2A6877] focus:ring-[#2A6877] text-xs sm:text-sm"
                            />
                            <span className="text-gray-500">-</span>
                            <input
                              type="time"
                              value={block.endTime}
                              onChange={(e) => handleTimeChange(id, blockIndex, 'endTime', e.target.value)}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2A6877] focus:ring-[#2A6877] text-xs sm:text-sm"
                            />
                            {localSchedule[id].timeBlocks.length > 1 && (
                              <motion.button
                                type="button"
                                onClick={() => removeTimeBlock(id, blockIndex)}
                                className="bg-red-50 text-red-500 hover:text-red-700 hover:bg-red-100 p-1 sm:p-1.5 rounded-full"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <XMarkIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                              </motion.button>
                            )}
                          </motion.div>
                        ))}
                        
                        {localSchedule[id].timeBlocks.length === 0 && (
                          <motion.div 
                            className="flex items-center justify-center p-3 sm:p-4 bg-white/50 rounded-lg border border-dashed border-gray-300"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <button
                              type="button"
                              onClick={() => addTimeBlock(id)}
                              className="text-xs sm:text-sm text-gray-500 flex flex-col items-center"
                            >
                              <PlusIcon className="h-5 w-5 sm:h-6 sm:w-6 mb-1 text-[#2A6877]" />
                              Agregar un horario
                            </button>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 sm:space-x-4 pt-2 sm:pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => {
                setIsEditing(false);
                setShowScheduleSummary(true);
                setLocalSchedule(schedule); // Reset to parent schedule
              }}
              className="inline-flex justify-center py-1.5 sm:py-2 px-3 sm:px-4 border border-gray-300 shadow-sm text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A6877] transition-all"
              disabled={localLoading || isLoading}
            >
              Cancelar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={localLoading || isLoading}
              className="inline-flex justify-center py-1.5 sm:py-2 px-3 sm:px-5 border border-transparent shadow-sm text-xs sm:text-sm font-medium rounded-md text-white bg-gradient-to-r from-[#2A6877] to-[#235A67] hover:from-[#235A67] hover:to-[#1A4652] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A6877] disabled:opacity-50 transition-all"
            >
              {(localLoading || isLoading) ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-0.5 sm:-ml-1 mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </span>
              ) : (
                <span className="flex items-center">
                  Guardar cambios
                  <CheckIcon className="ml-1.5 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </span>
              )}
            </motion.button>
          </div>
        </motion.form>
      )}
    </motion.div>
  );
};

export default ScheduleSection;