// types.ts
export type AppointmentStatus = 
  | 'PENDING_PAYMENT' 
  | 'PAYMENT_UPLOADED' 
  | 'PAYMENT_VERIFIED' 
  | 'CONFIRMED' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'NO_SHOW';

export interface Appointment {
  id: number;
  client_name: string;
  date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  psychologist_notes?: string;
  client_notes?: string;
  status_display: string;
}

