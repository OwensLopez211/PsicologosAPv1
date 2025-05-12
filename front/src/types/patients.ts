export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
}

export interface Patient {
  id: number;
  user: User;
  profile_image?: string | null;
  rut?: string;
  region?: string;
  last_appointment_date?: string | null;
  last_appointment_status?: string | null;
  next_appointment_date?: string | null;
  next_appointment_status?: string | null;
  total_appointments: number;
}

export interface FilterOptions {
  hasNextAppointment: boolean | null;
  sortBy: 'name' | 'appointments' | 'nextAppointment';
  sortOrder: 'asc' | 'desc';
} 