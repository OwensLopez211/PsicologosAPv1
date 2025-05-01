// utils.ts
export const getStatusColor = (status: string): string => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PAYMENT_UPLOADED':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'PAYMENT_VERIFIED':
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CANCELLED':
      case 'NO_SHOW':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Generate time slots from 8 AM to 8 PM
  export const generateTimeSlots = () => {
    return Array.from({ length: 12 }, (_, i) => {
      const hour = i + 8; // Start from 8 AM
      return `${hour.toString().padStart(2, '0')}:00`;
    });
  };