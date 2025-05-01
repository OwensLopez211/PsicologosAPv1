import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Format date to local format
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date string (dd/MM/yyyy)
 */
export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '';
  return format(parseISO(dateString), 'dd/MM/yyyy', { locale: es });
};

/**
 * Format time
 * @param {string} timeString - Time string (HH:MM:SS)
 * @returns {string} - Formatted time string (HH:MM)
 */
export const formatTime = (timeString: string | undefined): string => {
  if (!timeString) return '';
  return timeString.substring(0, 5); // Extract HH:MM from HH:MM:SS
};