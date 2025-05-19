import { memo } from 'react';

interface AppointmentStatusBadgeProps {
  status?: string | null;
}

const AppointmentStatusBadge = memo(({ status }: AppointmentStatusBadgeProps) => {
  if (!status) return null;
  
  // Función para obtener el color del badge según el estado
  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'PENDING_PAYMENT': 'bg-yellow-100 text-yellow-800',
      'PAYMENT_UPLOADED': 'bg-blue-100 text-blue-800',
      'PAYMENT_VERIFIED': 'bg-indigo-100 text-indigo-800',
      'CONFIRMED': 'bg-green-100 text-green-800',
      'COMPLETED': 'bg-purple-100 text-purple-800',
      'CANCELLED': 'bg-red-100 text-red-800',
      'NO_SHOW': 'bg-gray-100 text-gray-800'
    };
    
    return statusColors[status.toUpperCase()] || 'bg-gray-100 text-gray-500';
  };
  
  // Función para obtener el texto a mostrar para el estado
  const getStatusText = (status: string) => {
    const statusTexts: Record<string, string> = {
      'PENDING_PAYMENT': 'Pago pendiente',
      'PAYMENT_UPLOADED': 'Pago subido',
      'PAYMENT_VERIFIED': 'Pago verificado',
      'CONFIRMED': 'Confirmada',
      'COMPLETED': 'Completada',
      'CANCELLED': 'Cancelada',
      'NO_SHOW': 'No asistió'
    };
    
    return statusTexts[status.toUpperCase()] || status;
  };
  
  return (
    <span className={`mt-1 px-2 py-0.5 inline-flex text-xs leading-4 rounded-full ${getStatusColor(status)}`}>
      {getStatusText(status)}
    </span>
  );
});

AppointmentStatusBadge.displayName = 'AppointmentStatusBadge';

export default AppointmentStatusBadge; 