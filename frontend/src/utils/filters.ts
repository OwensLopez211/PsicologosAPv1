import { Appointment } from '../types/interfaces';

/**
 * Filter appointments based on selected filter and user role
 * @param {Appointment[]} appointments - List of appointments
 * @param {string} filter - Filter type ('all', 'pending', 'verified')
 * @param {string} userRole - User role ('admin', 'psychologist')
 * @returns {Appointment[]} - Filtered appointments
 */
export const filterAppointments = (
  appointments: Appointment[], 
  filter: 'all' | 'pending' | 'verified',
  userRole: 'admin' | 'psychologist'
): Appointment[] => {
  let filtered: Appointment[];
  
  // Base filter by status
  switch (filter) {
    case 'pending':
      filtered = appointments.filter(app => 
        app.status === 'PAYMENT_UPLOADED' && !app.payment_detail?.verified
      );
      break;
    case 'verified':
      filtered = appointments.filter(app => 
        app.payment_detail?.verified === true || app.status === 'PAYMENT_VERIFIED' || app.status === 'CONFIRMED'
      );
      break;
    default:
      filtered = [...appointments];
  }
  
  // Additional filter for psychologists: exclude first appointments (only for pending)
  if (userRole === 'psychologist' && filter === 'pending') {
    filtered = filtered.filter(app => !app.is_first_appointment);
  }
  
  return filtered;
};