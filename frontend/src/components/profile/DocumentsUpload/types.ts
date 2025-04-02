import { ReactNode } from 'react';

export interface Document {
  id?: number;
  document_type: string;
  document_type_display?: string;
  file?: File | null;
  file_url?: string;
  description?: string;
  verification_status?: 'pending' | 'approved' | 'rejected' | 'not_uploaded';
  rejection_reason?: string | null;
  uploaded_at?: string;
}

export interface DocumentType {
  type: string;
  name: string;
  icon: ReactNode;
  description: string;
}