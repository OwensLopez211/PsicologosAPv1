export type AttentionType = 'ONLINE' | 'IN_PERSON' | 'BOTH';
export type SessionType = 'INDIVIDUAL' | 'COUPLE' | 'FAMILY' | 'GROUP';
export type PaymentMethod = 'TRANSFER' | 'CREDIT_CARD' | 'DEBIT_CARD';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

export interface Education {
  title: string;
  university: string;
  year: number;
  type: 'DEGREE' | 'MASTER' | 'DOCTORATE' | 'CERTIFICATION';
}

export interface Schedule {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface SessionFee {
  sessionType: SessionType;
  price: number;
  duration: number; // in minutes
}

export interface Review {
  patientId: string;
  rating: number;
  comment: string;
  date: Date;
}

export interface BasicProfileData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  rut: string | null;
  gender: Gender | null;
  profile_image: string | null;
  region: string | null;
  city: string | null;
}

export interface PsychologistProfile {
  // Basic fields
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  email: string;
  phone: string;
  rut: string;
  gender: string;
  profileImage?: string;
  profile_image?: string;
  region: string;
  city: string;

  // Professional info fields
  professional_title?: string;
  specialties?: string[];
  health_register_number?: string;
  university?: string;
  graduation_year?: string;
  experience_description?: string;
  target_populations?: string[];
  intervention_areas?: string[];

  // Additional fields
  education?: Education[];
  yearsOfExperience?: number;
  attentionType?: AttentionType;
  languages?: string[];
  schedule?: Schedule[];
  sessionFees?: SessionFee[];
  acceptedPaymentMethods?: PaymentMethod[];
  biography?: string;
  reviews?: Review[];
  averageRating?: number;
  verifiedDocuments?: {
    professionalDegree: boolean;
    healthRegistration: boolean;
    civilLiability: boolean;
  };
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  experiences?: {
    id?: number;
    experience_type: string;
    institution: string;
    role: string;
    start_date: string;
    end_date?: string | null;
    description: string;
  }[];
}

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