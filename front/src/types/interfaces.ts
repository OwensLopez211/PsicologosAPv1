// types/interfaces.ts
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
}

export interface PaymentDetail {
  id: number;
  appointment: number;
  transaction_id?: string;
  payment_date?: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: number;
  client_name: string;
  psychologist_name: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  status_display: string;
  payment_amount: number;
  payment_proof?: string;
  is_first_appointment?: boolean;
  payment_detail?: PaymentDetail;
}

export interface PaymentVerificationPageProps {
  userRole: 'admin' | 'psychologist';
}