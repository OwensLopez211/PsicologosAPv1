import { FC } from 'react';
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
  // Find the selected day object
  const selectedDay = availableDays.find(day => day.date === selectedDate);

  return (
    <div className="p-6">
      {/* Day tabs */}
      <div className="flex overflow-x-auto pb-2 mb-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {availableDays.map((day) => (
          <button
            key={day.date}
            className={`flex-shrink-0 px-4 py-2 mr-2 rounded-md transition-colors ${
              selectedDate === day.date
                ? 'bg-[#2A6877] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => onDateSelect(day.date)}
          >
            {formatDate(day.date)}
          </button>
        ))}
      </div>

      {/* Time slots */}
      {selectedDay && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {selectedDay.slots.map((slot, index) => (
            <button
              key={`${slot.start_time}-${index}`}
              className="p-3 rounded-md border border-gray-200 hover:border-[#2A6877] hover:bg-blue-50 transition-colors flex flex-col items-center"
              onClick={() => onSlotSelect(selectedDay.date, slot.start_time, slot.end_time)}
            >
              <span className="text-lg font-medium text-gray-800">
                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
              </span>
              <span className="text-sm text-gray-500 mt-1">
                {slot.duration} minutos
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DaySelector;