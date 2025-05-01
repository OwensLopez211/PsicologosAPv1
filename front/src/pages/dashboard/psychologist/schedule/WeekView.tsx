import React from 'react';
import { motion } from 'framer-motion';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Appointment } from './appointment-types';
import { generateTimeSlots } from './utils';
import AppointmentSlot from './AppointmentSlot';

interface WeekViewProps {
  currentDate: Date;
  getAppointmentsForTimeSlot: (date: Date, time: string) => Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
}

const WeekView: React.FC<WeekViewProps> = ({ 
  currentDate, 
  getAppointmentsForTimeSlot, 
  onAppointmentClick 
}) => {
  const timeSlots = generateTimeSlots();
  
  // Generate days of the week
  const generateWeekDays = () => {
    const startDay = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start from Monday
    return Array.from({ length: 7 }, (_, i) => addDays(startDay, i));
  };
  
  const weekDays = generateWeekDays();

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Day headers */}
      <div className="grid grid-cols-8 border-b">
        <div className="py-3 px-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r bg-gray-50">
          Hora
        </div>
        {weekDays.map((day, index) => (
          <motion.div 
            key={`header-${index}`}
            className={`py-3 px-2 text-center ${
              isSameDay(day, new Date()) ? 'bg-blue-50 text-[#2A6877]' : 'text-gray-700'
            }`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <div className="hidden md:block text-sm font-medium">
              {format(day, 'EEEE', { locale: es })}
            </div>
            <div className="md:hidden text-xs font-medium">
              {format(day, 'EEE', { locale: es })}
            </div>
            <div className="text-lg font-bold">
              {format(day, 'd')}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Time grid */}
      <div className="grid grid-cols-8">
        {/* Time labels column */}
        <div className="border-r">
          {timeSlots.map((time, index) => (
            <div 
              key={`time-${index}`}
              className="h-16 md:h-20 py-2 px-2 text-right text-xs font-medium text-gray-500 border-b flex items-center justify-end"
            >
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02, duration: 0.3 }}
              >
                {time}
              </motion.span>
            </div>
          ))}
        </div>

        {/* Day columns with appointment slots */}
        {weekDays.map((day, dayIndex) => (
          <div key={`day-${dayIndex}`} className={dayIndex < 6 ? 'border-r' : ''}>
            {timeSlots.map((time, timeIndex) => {
              const slotAppointments = getAppointmentsForTimeSlot(day, time);
              
              return (
                <motion.div 
                  key={`slot-${dayIndex}-${timeIndex}`}
                  className={`h-16 md:h-20 border-b p-1 relative ${
                    isSameDay(day, new Date()) ? 'bg-blue-50/50' : ''
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ 
                    delay: (dayIndex * timeSlots.length + timeIndex) * 0.001, 
                    duration: 0.3 
                  }}
                >
                  <AppointmentSlot 
                    appointments={slotAppointments} 
                    onAppointmentClick={onAppointmentClick}
                    isEmpty={true}
                  />
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default WeekView;