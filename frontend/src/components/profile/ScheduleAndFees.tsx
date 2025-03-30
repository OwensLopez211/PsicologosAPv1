import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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
  onSave: (data: any) => void;
  isLoading: boolean;
}

const ScheduleAndFees = ({ profile, onSave, isLoading }: ScheduleAndFeesProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleData>({
    monday: { enabled: false, timeBlocks: [{ startTime: '09:00', endTime: '17:00' }] },
    tuesday: { enabled: false, timeBlocks: [{ startTime: '09:00', endTime: '17:00' }] },
    wednesday: { enabled: false, timeBlocks: [{ startTime: '09:00', endTime: '17:00' }] },
    thursday: { enabled: false, timeBlocks: [{ startTime: '09:00', endTime: '17:00' }] },
    friday: { enabled: false, timeBlocks: [{ startTime: '09:00', endTime: '17:00' }] },
    saturday: { enabled: false, timeBlocks: [{ startTime: '09:00', endTime: '13:00' }] },
    sunday: { enabled: false, timeBlocks: [{ startTime: '09:00', endTime: '13:00' }] },
  });

  const daysOfWeek = [
    { id: 'monday', label: 'Lunes' },
    { id: 'tuesday', label: 'Martes' },
    { id: 'wednesday', label: 'Miércoles' },
    { id: 'thursday', label: 'Jueves' },
    { id: 'friday', label: 'Viernes' },
    { id: 'saturday', label: 'Sábado' },
    { id: 'sunday', label: 'Domingo' },
  ];

  useEffect(() => {
    if (profile?.schedule) {
      setSchedule(profile.schedule);
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ schedule });
    setIsEditing(false);
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📅</span>
          <h2 className="text-xl font-semibold text-gray-900">Horarios de Atención</h2>
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-4 py-2 border border-[#2A6877] text-sm font-medium rounded-md text-[#2A6877] hover:bg-gray-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Editar
          </button>
        )}
      </div>

      <div className="space-y-6">
        {daysOfWeek.map(({ id, label }) => (
          <div key={id} className="border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={schedule[id].enabled}
                  onChange={() => handleDayToggle(id)}
                  disabled={!isEditing}
                  className="h-4 w-4 text-[#2A6877] focus:ring-[#2A6877] border-gray-300 rounded"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">{label}</span>
              </label>
              {isEditing && schedule[id].enabled && (
                <button
                  type="button"
                  onClick={() => addTimeBlock(id)}
                  className="text-sm text-[#2A6877] hover:text-[#235A67]"
                >
                  + Agregar bloque
                </button>
              )}
            </div>

            {schedule[id].enabled && (
              <div className="ml-6 space-y-3">
                {schedule[id].timeBlocks.map((block, blockIndex) => (
                  <div key={blockIndex} className="flex items-center gap-4">
                    <input
                      type="time"
                      value={block.startTime}
                      onChange={(e) => handleTimeChange(id, blockIndex, 'startTime', e.target.value)}
                      disabled={!isEditing}
                      className="block rounded-md border-gray-300 shadow-sm focus:border-[#2A6877] focus:ring-[#2A6877] disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                    <span>-</span>
                    <input
                      type="time"
                      value={block.endTime}
                      onChange={(e) => handleTimeChange(id, blockIndex, 'endTime', e.target.value)}
                      disabled={!isEditing}
                      className="block rounded-md border-gray-300 shadow-sm focus:border-[#2A6877] focus:ring-[#2A6877] disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                    {isEditing && schedule[id].timeBlocks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTimeBlock(id, blockIndex)}
                        className="text-red-500 hover:text-red-700"
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

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-xl">💸</span>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tarifas</h3>
            <p className="text-gray-600">
              <span className="inline-block mr-2">💡</span>
              Las tarifas por sesión son establecidas por el equipo administrativo de MentAliza.
            </p>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={() => {
              setIsEditing(false);
              if (profile?.schedule) {
                setSchedule(profile.schedule);
              }
            }}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-[#2A6877] text-white rounded-md hover:bg-[#235A67] disabled:opacity-50"
          >
            {isLoading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      )}
    </form>
  );
};

export default ScheduleAndFees;