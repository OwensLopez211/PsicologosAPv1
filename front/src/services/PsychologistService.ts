import api from './api';

// Interfaces (mantenidas igual)
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
   * Registra un mensaje de diagnóstico en la consola
   * @param message Mensaje a registrar
   * @param data Datos adicionales
   */
  private logDebug(message: string, data?: any): void {
    console.log(`[PsychologistService] ${message}`);
    if (data) {
      console.log(data);
    }
  }

  /**
   * Registra un error en la consola
   * @param message Mensaje de error
   * @param error Error capturado
   */
  private logError(message: string, error?: any): void {
    console.error(`[PsychologistService] ERROR: ${message}`);
    if (error) {
      console.error(error);
      // Mostrar detalles específicos de la respuesta de error
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
    }
  }

  /**
   * Get all psychologists
   * @returns Promise with psychologist data
   */
  async getAllPsychologists(): Promise<Psychologist[]> {
    this.logDebug('Fetching all psychologists');
    try {
      const response = await api.get('/profiles/admin/psychologists/');
      this.logDebug('Received psychologists data', response.data);
      return this.normalizeData(response.data);
    } catch (error) {
      this.logError('Error fetching psychologists', error);
      throw error;
    }
  }

  /**
   * Get psychologist by ID
   * @param id Psychologist ID
   * @returns Promise with psychologist data
   */
  async getPsychologistById(id: number): Promise<Psychologist> {
    this.logDebug(`Fetching psychologist with ID ${id}`);
    try {
      // Primera estrategia: intentar obtener por ID de perfil
      const endpoint = `/profiles/admin/psychologists/${id}/`;
      this.logDebug(`Making request to: ${endpoint}`);
      
      const response = await api.get(endpoint);
      this.logDebug(`Received psychologist data for ID ${id}`, response.data);
      return this.normalizeData(response.data);
    } catch (error) {
      this.logError(`Error fetching psychologist with ID ${id}`, error);
      
      // Segunda estrategia: si falla, podría ser un ID de usuario, intentar buscar por ese ID
      try {
        this.logDebug(`Attempting fallback strategy for ID ${id}`);
        const publicEndpoint = `/profiles/public/psychologists/${id}/`;
        this.logDebug(`Making request to: ${publicEndpoint}`);
        
        const response = await api.get(publicEndpoint);
        this.logDebug(`Received psychologist data from public endpoint for ID ${id}`, response.data);
        return this.normalizeData(response.data);
      } catch (secondError) {
        this.logError(`Fallback strategy also failed for ID ${id}`, secondError);
        throw secondError;
      }
    }
  }

  /**
   * Normalize psychologist data to ensure all fields have proper values
   * @param data Raw data from API
   * @returns Normalized data
   */
  private normalizeData(data: any): any {
    try {
      // If it's an array, normalize each item
      if (Array.isArray(data)) {
        return data.map(item => this.normalizeData(item));
      }
      
      if (!data) {
        this.logError('Received null or undefined data in normalizeData');
        return null;
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
    } catch (error) {
      this.logError('Error normalizing data', error);
      // Devolver los datos originales en caso de error
      return data;
    }
  }

  /**
   * Get psychologist documents
   * @param id Psychologist ID
   * @returns Promise with documents data
   */
  async getPsychologistDocuments(id: number): Promise<PsychologistDocument[]> {
    this.logDebug(`Fetching documents for psychologist ${id}`);
    try {
      const response = await api.get(`/profiles/admin/psychologists/${id}/documents/`);
      this.logDebug(`Received documents for psychologist ${id}`, response.data);
      return response.data;
    } catch (error) {
      this.logError(`Error fetching documents for psychologist ${id}`, error);
      return []; // Devolver array vacío en caso de error
    }
  }

  /**
   * Get public psychologist profile
   * @param id Psychologist ID
   * @returns Promise with psychologist data
   */
  async getPublicPsychologistProfile(id: number): Promise<Psychologist> {
    this.logDebug(`Fetching public profile for psychologist ${id}`);
    try {
      const response = await api.get(`/profiles/public/psychologists/${id}/`);
      this.logDebug(`Received public profile for psychologist ${id}`, response.data);
      return this.normalizeData(response.data);
    } catch (error) {
      this.logError(`Error fetching public profile for psychologist ${id}`, error);
      throw error;
    }
  }

  /**
   * Get psychologist suggested price
   * @param id Psychologist ID
   * @returns Promise with suggested price data
   */
  async getPsychologistSuggestedPrice(id: number): Promise<{ price: number | null }> {
    this.logDebug(`Fetching suggested price for psychologist ${id}`);
    try {
      // Intentar directamente con el ID proporcionado
      const response = await api.get(`/pricing/suggested-prices/psychologist/${id}/`);
      this.logDebug(`Received suggested price for psychologist ${id}`, response.data);
      return response.data;
    } catch (error) {
      // Si falla, puede ser porque necesitamos el ID de usuario en lugar del ID de perfil
      this.logError(`Error fetching suggested price for psychologist ${id}`, error);
      
      try {
        // Obtener el psicólogo para conseguir el user_id
        this.logDebug(`Attempting to get psychologist profile for ID ${id}`);
        const psychologist = await this.getPsychologistById(id);
        if (!psychologist || !psychologist.user) {
          throw new Error(`Could not find psychologist with ID ${id}`);
        }
        
        const userId = psychologist.user.id;
        this.logDebug(`Using user ID ${userId} instead of profile ID ${id}`);
        
        // Intentar de nuevo con el ID de usuario
        const response = await api.get(`/pricing/suggested-prices/psychologist/${userId}/`);
        this.logDebug(`Received suggested price using user ID ${userId}`, response.data);
        return response.data;
      } catch (fallbackError) {
        this.logError(`Fallback strategy also failed for suggested price`, fallbackError);
        return { price: null };
      }
    }
  }

  /**
   * Get psychologist approved price
   * @param id Psychologist ID
   * @returns Promise with approved price data
   */
  async getPsychologistApprovedPrice(id: number): Promise<{ price: number | null }> {
    this.logDebug(`Fetching approved price for psychologist ${id}`);
    try {
      // Intentar directamente con el ID proporcionado
      const response = await api.get(`/pricing/psychologist-prices/psychologist/${id}/`);
      this.logDebug(`Received approved price for psychologist ${id}`, response.data);
      return response.data;
    } catch (error) {
      // Si falla, puede ser porque necesitamos el ID de usuario en lugar del ID de perfil
      this.logError(`Error fetching approved price for psychologist ${id}`, error);
      
      try {
        // Obtener el psicólogo para conseguir el user_id
        this.logDebug(`Attempting to get psychologist profile for ID ${id}`);
        const psychologist = await this.getPsychologistById(id);
        if (!psychologist || !psychologist.user) {
          throw new Error(`Could not find psychologist with ID ${id}`);
        }
        
        const userId = psychologist.user.id;
        this.logDebug(`Using user ID ${userId} instead of profile ID ${id}`);
        
        // Intentar de nuevo con el ID de usuario
        const response = await api.get(`/pricing/psychologist-prices/psychologist/${userId}/`);
        this.logDebug(`Received approved price using user ID ${userId}`, response.data);
        return response.data;
      } catch (fallbackError) {
        this.logError(`Fallback strategy also failed for approved price`, fallbackError);
        return { price: null };
      }
    }
  }

  /**
   * Update psychologist approved price
   * @param id Psychologist ID
   * @param price New approved price
   * @returns Promise with updated price data
   */
  async updatePsychologistApprovedPrice(id: number, price: number): Promise<{ price: number }> {
    this.logDebug(`Updating approved price for psychologist ${id} to ${price}`);
    try {
      // Intentar directamente con el ID proporcionado
      const response = await api.post(`/pricing/psychologist-prices/set_psychologist_price/${id}/`, { price });
      this.logDebug(`Successfully updated price for psychologist ${id}`, response.data);
      return response.data;
    } catch (error) {
      // Si falla, puede ser porque necesitamos el ID de usuario en lugar del ID de perfil
      this.logError(`Error updating approved price for psychologist ${id}`, error);
      
      try {
        // Obtener el psicólogo para conseguir el user_id
        this.logDebug(`Attempting to get psychologist profile for ID ${id}`);
        const psychologist = await this.getPsychologistById(id);
        if (!psychologist || !psychologist.user) {
          throw new Error(`Could not find psychologist with ID ${id}`);
        }
        
        const userId = psychologist.user.id;
        this.logDebug(`Using user ID ${userId} instead of profile ID ${id}`);
        
        // Intentar de nuevo con el ID de usuario
        const response = await api.post(`/pricing/psychologist-prices/set_psychologist_price/${userId}/`, { price });
        this.logDebug(`Successfully updated price using user ID ${userId}`, response.data);
        return response.data;
      } catch (fallbackError) {
        this.logError(`Fallback strategy also failed for updating price`, fallbackError);
        throw fallbackError;
      }
    }
  }

  /**
   * Update psychologist verification status
   * @param id Psychologist ID
   * @param status New verification status
   * @returns Promise with updated psychologist data
   */
  async updatePsychologistStatus(id: number, status: string): Promise<any> {
    this.logDebug(`Updating status for psychologist ${id} to ${status}`);
    try {
      const response = await api.patch(`/profiles/admin/psychologists/${id}/verify/`, {
        verification_status: status
      });
      this.logDebug(`Successfully updated status for psychologist ${id}`, response.data);
      return response.data;
    } catch (error) {
      this.logError(`Error updating status for psychologist ${id}`, error);
      throw error;
    }
  }

  /**
   * Update document verification status
   * @param documentId Document ID
   * @param status New verification status ('verified' or 'rejected')
   * @param rejectionReason Reason for rejection (required if status is 'rejected')
   * @returns Promise with updated document data
   */
  async updateDocumentStatus(documentId: number, status: string, rejectionReason?: string): Promise<any> {
    this.logDebug(`Updating document ${documentId} status to ${status}`);
    try {
      const data: any = { verification_status: status };
      if (status === 'rejected' && rejectionReason) {
        data.rejection_reason = rejectionReason;
      }
      
      const response = await api.patch(`/profiles/admin/psychologists/documents/${documentId}/status/`, data);
      this.logDebug(`Successfully updated document ${documentId} status`, response.data);
      return response.data;
    } catch (error) {
      this.logError(`Error updating document ${documentId} status`, error);
      throw error;
    }
  }

  /**
   * Download document file
   * @param psychologistId Psychologist ID
   * @param documentId Document ID
   * @param _fileName Name of the file to download
   * @returns Promise with file blob
   */
  async downloadDocument(psychologistId: number, documentId: number, _fileName: string): Promise<Blob> {
    this.logDebug(`Downloading document ${documentId} for psychologist ${psychologistId}`);
    try {
      const response = await api.get(
        `/profiles/psychologist-profiles/me/documents/download/${documentId}/`,
        { responseType: 'blob' }
      );
      this.logDebug(`Successfully downloaded document ${documentId}`);
      return response.data;
    } catch (error) {
      this.logError(`Error downloading document ${documentId}`, error);
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