import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Appointment } from './appointment-types';
import AppointmentStatusBadge from './AppointmentStatusBadge';

interface MobileDayViewProps {
  currentDate: Date;
  dayAppointments: Appointment[];
  isLoading: boolean;
  error: string | null;
  onAppointmentClick: (appointment: Appointment) => void;
  onRetry: () => void;
}

const MobileDayView: React.FC<MobileDayViewProps> = ({
  currentDate,
  dayAppointments,
  isLoading,
  error,
  onAppointmentClick,
  onRetry
}) => {
  // Variantes de animación para Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.07 
      } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 } 
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-t-[#2A6877] border-r-[#2A6877]/30 border-b-[#2A6877]/10 border-l-[#2A6877]/60 animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium">Cargando citas...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
        <div className="text-red-500 mb-2 text-5xl">⚠️</div>
        <p className="text-red-500 mb-4">{error}</p>
        <motion.button 
          onClick={onRetry}
          className="px-4 py-2 bg-[#2A6877] text-white rounded-md hover:bg-[#235A67] transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Reintentar
        </motion.button>
      </div>
    );
  }
  
  return (
    <motion.div 
      className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="p-4 border-b bg-gradient-to-r from-[#2A6877]/10 to-transparent">
        <h3 className="font-medium text-gray-900">
          {format(currentDate, "EEEE d 'de' MMMM", { locale: es })}
        </h3>
      </div>
      
      {dayAppointments.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {dayAppointments.map((appointment) => (
            <motion.div 
              key={appointment.id}
              className="p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => onAppointmentClick(appointment)}
              variants={itemVariants}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium">{appointment.client_name}</div>
                <AppointmentStatusBadge 
                  status={appointment.status} 
                  label={appointment.status_display} 
                />
              </div>
              <div className="text-sm text-gray-500 flex items-center">
                <span className="inline-block w-16">{appointment.start_time}</span>
                <span>-</span>
                <span className="inline-block w-16 ml-2">{appointment.end_time}</span>
              </div>
              {appointment.client_notes && (
                <div className="mt-2 p-2 bg-gray-50 rounded-md text-sm text-gray-600 border-l-2 border-[#2A6877]/30">
                  {appointment.client_notes}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div 
          className="p-8 text-center"
          variants={itemVariants}
        >
          <div className="text-4xl mb-4">📅</div>
          <p className="text-gray-500">No hay citas programadas para este día</p>
          <p className="text-sm text-gray-400 mt-2">Las citas aparecerán aquí cuando estén programadas</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MobileDayView;