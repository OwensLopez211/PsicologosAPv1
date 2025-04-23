import React from 'react';
import { motion } from 'framer-motion';
import { Appointment } from './appointment-types';
import { getStatusColor } from './utils';

interface AppointmentSlotProps {
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  isEmpty?: boolean;
}

const AppointmentSlot: React.FC<AppointmentSlotProps> = ({
  appointments,
  onAppointmentClick,
  isEmpty = false
}) => {
  if (appointments.length === 0 && isEmpty) {
    return (
      <div className="h-full w-full border border-dashed border-gray-200 rounded-md hover:border-gray-300 transition-colors">
      </div>
    );
  }

  return (
    <>
      {appointments.map((appointment) => (
        <motion.div
          key={appointment.id}
          className={`p-1.5 rounded-md border h-full overflow-hidden ${getStatusColor(appointment.status)} cursor-pointer hover:shadow-md transition-all`}
          onClick={() => onAppointmentClick(appointment)}
          whileHover={{ scale: 1.02, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Nombre del cliente - más visible */}
          <div className="font-semibold text-xs leading-tight truncate mb-1">
            {appointment.client_name}
          </div>
          
          {/* Horario - más compacto */}
          <div className="text-xs flex items-center opacity-90">
            <span className="truncate">{appointment.start_time} - {appointment.end_time}</span>
          </div>
          
          {/* Notas del cliente - solo en desktop y muy compactas */}
          {appointment.client_notes && (
            <div className="text-xs mt-1 truncate hidden md:block opacity-75 text-[10px] leading-tight">
              {appointment.client_notes}
            </div>
          )}
        </motion.div>
      ))}
    </>
  );
};

export default AppointmentSlot;