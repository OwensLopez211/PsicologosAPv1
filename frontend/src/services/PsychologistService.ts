import api from './api';

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
      return this.normalizeData(response.data);
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
      return this.normalizeData(response.data);
    } catch (error) {
      console.error(`Error fetching psychologist with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Normalize psychologist data to ensure all fields have proper values
   * @param data Raw data from API
   * @returns Normalized data
   */
  private normalizeData(data: any): any {
    // If it's an array, normalize each item
    if (Array.isArray(data)) {
      return data.map(item => this.normalizeData(item));
    }
    
    // Ensure arrays are properly initialized
    const normalizedData = {
      ...data,
      specialties: Array.isArray(data.specialties) ? data.specialties : [],
      target_populations: Array.isArray(data.target_populations) ? data.target_populations : [],
      intervention_areas: Array.isArray(data.intervention_areas) ? data.intervention_areas : [],
      verification_documents: Array.isArray(data.verification_documents) 
        ? data.verification_documents 
        : []
    };
    
    // Ensure graduation_year is a number or null
    if (normalizedData.graduation_year !== null && normalizedData.graduation_year !== undefined) {
      const yearValue = parseInt(normalizedData.graduation_year.toString(), 10);
      normalizedData.graduation_year = isNaN(yearValue) ? null : yearValue;
    } else {
      normalizedData.graduation_year = null;
    }
    
    return normalizedData;
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
   * Download document directly by document ID
   * @param documentId Document ID
   * @returns Promise with blob data
   */
  async downloadDocumentById(documentId: number): Promise<Blob> {
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // For all files, use the fetch API with proper authentication
      const url = `${api.defaults.baseURL}/profiles/admin/psychologists/documents/${documentId}/download/`;
      
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

  /**
   * Get psychologist suggested price
   * @param id Psychologist ID
   * @returns Promise with suggested price data
   */
  async getPsychologistSuggestedPrice(id: number): Promise<{ price: number | null }> {
    try {
      // Obtener el psicólogo para conseguir el user_id
      const psychologist = await this.getPsychologistById(id);
      const userId = psychologist.user.id;
      
      console.log(`Fetching suggested price for psychologist ID: ${id}, user ID: ${userId}`);
      
      // Usar el user_id en lugar del profile_id
      const response = await api.get(`/pricing/suggested-prices/psychologist/${userId}/`);
      console.log('Suggested price response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching suggested price for psychologist ${id}:`, error);
      return { price: null };
    }
  }

  /**
   * Get psychologist approved price
   * @param id Psychologist ID
   * @returns Promise with approved price data
   */
  async getPsychologistApprovedPrice(id: number): Promise<{ price: number | null }> {
    try {
      // Obtener el psicólogo para conseguir el user_id
      const psychologist = await this.getPsychologistById(id);
      const userId = psychologist.user.id;
      
      console.log(`Fetching approved price for psychologist ID: ${id}, user ID: ${userId}`);
      
      // Usar el user_id en lugar del profile_id
      const response = await api.get(`/pricing/psychologist-prices/psychologist/${userId}/`);
      console.log('Approved price response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching approved price for psychologist ${id}:`, error);
      return { price: null };
    }
  }

  /**
   * Update psychologist approved price
   * @param id Psychologist ID
   * @param price New approved price
   * @returns Promise with updated price data
   */
  async updatePsychologistApprovedPrice(id: number, price: number): Promise<{ price: number }> {
    try {
      console.log(`Updating price for psychologist ID: ${id} to ${price}`);
      
      // Use the updated endpoint
      const response = await api.post(`/pricing/psychologist-prices/set_psychologist_price/${id}/`, { 
        price
      });
      
      console.log('Update price response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error(`Error updating approved price for psychologist ${id}:`, error);
      throw error;
    }
  }
}

export default new PsychologistService();
