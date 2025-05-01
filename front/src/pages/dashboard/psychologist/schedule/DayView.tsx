import React from 'react';
import { motion } from 'framer-motion';
import { Appointment } from './appointment-types';
import { generateTimeSlots } from './utils';
import AppointmentSlot from './AppointmentSlot';

interface DayViewProps {
  currentDate: Date;
  getAppointmentsForTimeSlot: (date: Date, time: string) => Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
}

const DayView: React.FC<DayViewProps> = ({ 
  currentDate, 
  getAppointmentsForTimeSlot, 
  onAppointmentClick 
}) => {
  const timeSlots = generateTimeSlots();

  return (
    <motion.div 
      className="grid grid-cols-2 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
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
              transition={{ delay: index * 0.03, duration: 0.3 }}
            >
              {time}
            </motion.span>
          </div>
        ))}
      </div>

      {/* Appointment slots column */}
      <div>
        {timeSlots.map((time, index) => {
          const slotAppointments = getAppointmentsForTimeSlot(currentDate, time);
          
          return (
            <motion.div 
              key={`slot-${index}`}
              className="h-16 md:h-20 border-b p-1 relative"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, duration: 0.3 }}
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
    </motion.div>
  );
};

export default DayView;