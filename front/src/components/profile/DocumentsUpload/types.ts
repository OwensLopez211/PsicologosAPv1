import { ReactNode } from 'react';

export interface DocumentType {
  type: string;
  name: string;
  icon: ReactNode;
  description: string;
}

export interface Document {
  id: number;
  document_type: string;
  file_url?: string;
  description?: string;
  verification_status: 'pending' | 'approved' | 'verified' | 'rejected' | string;
  rejection_reason?: string;
  uploaded_at?: string;
  verified_at?: string;
}