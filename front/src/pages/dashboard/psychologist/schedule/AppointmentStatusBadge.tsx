import React from 'react';
import { motion } from 'framer-motion';
import { AppointmentStatus } from './appointment-types';
import { getStatusColor } from './utils';

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
  label: string;
}

const AppointmentStatusBadge: React.FC<AppointmentStatusBadgeProps> = ({ status, label }) => {
  // Iconos según el estado
  const getStatusIcon = (status: AppointmentStatus) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'PAYMENT_UPLOADED':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'PAYMENT_VERIFIED':
      case 'CONFIRMED':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'COMPLETED':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      case 'CANCELLED':
      case 'NO_SHOW':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Descripción según el estado (opcional, para tooltips o texto adicional)
  const getStatusDescription = (status: AppointmentStatus) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return 'Esperando pago del paciente.';
      case 'PAYMENT_UPLOADED':
        return 'El pago ha sido subido y está pendiente de verificación.';
      case 'PAYMENT_VERIFIED':
        return 'El pago ha sido verificado.';
      case 'CONFIRMED':
        return 'La cita está confirmada.';
      case 'COMPLETED':
        return 'La sesión ha sido completada.';
      case 'CANCELLED':
        return 'La cita ha sido cancelada.';
      case 'NO_SHOW':
        return 'El paciente no se presentó a la cita.';
      default:
        return '';
    }
  };

  // Obtener las clases de estilo según el estado
  const statusClasses = getStatusColor(status);
  
  // Animación para el badge
  const pulseAnimation = status === 'PAYMENT_UPLOADED' ? {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: 'loop' as const
    }
  } : {};

  return (
    <motion.div 
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusClasses}`}
      animate={pulseAnimation}
      whileHover={{ scale: 1.05 }}
      title={getStatusDescription(status)}
    >
      {getStatusIcon(status)}
      <span>{label}</span>
    </motion.div>
  );
};

export default AppointmentStatusBadge;