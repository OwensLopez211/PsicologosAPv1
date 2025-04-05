import api from './api';
import axios from 'axios';

// Asegúrate de que la interfaz Document tenga estos campos
export interface Document {
  id: number;
  document_type: string;
  file: string;
  description?: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  rejection_reason?: string;
  uploaded_at: string;
}

export interface Psychologist {
  id: number;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
  };
  profile_image: string | null;
  rut: string;
  phone: string;
  gender: string;
  region: string;
  city: string;
  professional_title: string;
  specialties: string[];
  health_register_number: string;
  university: string;
  graduation_year: number | null;
  experience_description: string;
  target_populations: string[];
  intervention_areas: string[];
  verification_status: string;
  verification_status_display: string;
  created_at: string;
  updated_at: string;
  bank_account_number: string;
  bank_account_type: string;
  bank_account_type_display: string;
  bank_account_owner: string;
  bank_account_owner_rut: string;
  bank_account_owner_email: string;
  bank_name: string;
  verification_documents: PsychologistDocument[];
}

export interface PsychologistDocument {
  id: number;
  document_type: string;
  document_type_display: string;
  file: string;
  description: string;
  is_verified: boolean;
  verification_status: string;
  verification_status_display: string;
  rejection_reason: string | null;
  uploaded_at: string;
  verified_at: string | null;
}

class PsychologistService {
  /**
   * Get all psychologists
   * @returns Promise with psychologist data
   */
  async getAllPsychologists(): Promise<Psychologist[]> {
    try {
      const response = await api.get('/profiles/admin/psychologists/');
      return response.data;
    } catch (error) {
      console.error('Error fetching psychologists:', error);
      throw error;
    }
  }

  /**
   * Get psychologist by ID
   * @param id Psychologist ID
   * @returns Promise with psychologist data
   */
  async getPsychologistById(id: number): Promise<Psychologist> {
    try {
      const response = await api.get(`/profiles/admin/psychologists/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching psychologist with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get psychologist documents
   * @param id Psychologist ID
   * @returns Promise with documents data
   */
  async getPsychologistDocuments(id: number): Promise<PsychologistDocument[]> {
    try {
      const response = await api.get(`/profiles/admin/psychologists/${id}/documents/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching documents for psychologist ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update psychologist verification status
   * @param id Psychologist ID
   * @param status New verification status
   * @param rejectionReason Optional reason for rejection
   * @returns Promise with updated psychologist data
   */
  async updatePsychologistStatus(
    id: number, 
    status: string,
    rejectionReason?: string
  ): Promise<Psychologist> {
    try {
      const data: any = { verification_status: status };
      if (status === 'REJECTED' && rejectionReason) {
        data.rejection_reason = rejectionReason;
      }
      
      const response = await api.patch(`/profiles/admin/psychologists/${id}/verify/`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating verification status for psychologist ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update document verification status
   * @param documentId Document ID
   * @param status New verification status
   * @param rejectionReason Optional reason for rejection
   * @returns Promise with updated document data
   */
  async updateDocumentStatus(documentId: number, status: string, rejectionReason?: string) {
    try {
      const data = {
        verification_status: status,
        ...(rejectionReason && { rejection_reason: rejectionReason }),
        update_profile_status: false // Add this flag to prevent profile status update
      };
      
      // Use the api instance that already has authentication configured
      const response = await api.patch(`/profiles/admin/psychologists/documents/${documentId}/status/`, data);
      
      return response.data;
    } catch (error) {
      console.error('Error updating document status:', error);
      throw error;
    }
  }

  /**
   * Get document download URL
   * @param psychologistId Psychologist ID
   * @param documentId Document ID
   * @returns Download URL for the document
   */
  getDocumentDownloadUrl(psychologistId: number, documentId: number): string {
    return `${api.defaults.baseURL}/profiles/psychologist-profiles/${psychologistId}/documents/download/${documentId}/`;
  }

  /**
   * Download document directly
   * @param psychologistId Psychologist ID
   * @param documentId Document ID
   * @param fileName Original file name to determine content type
   */
  async downloadDocument(psychologistId: number, documentId: number, fileName: string): Promise<Blob> {
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Check if it's a video file
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      const isVideo = ['mp4', 'mov', 'avi', 'webm', 'mkv'].includes(fileExtension);
      
      // For all files, use the fetch API with proper authentication
      const url = `${api.defaults.baseURL}/profiles/psychologist-profiles/${psychologistId}/documents/download/${documentId}/`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Get the blob directly from the response
      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error(`Error downloading document ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Get psychologist initials from first and last name
   * @param psychologist Psychologist object
   * @returns String with psychologist initials
   */
  getPsychologistInitials(psychologist: Psychologist): string {
    if (!psychologist || !psychologist.user) return '??';
    
    const firstName = psychologist.user.first_name || '';
    const lastName = psychologist.user.last_name || '';
    
    const firstInitial = firstName.length > 0 ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName.length > 0 ? lastName.charAt(0).toUpperCase() : '';
    
    return (firstInitial + lastInitial) || '??';
  }
}

export default new PsychologistService();