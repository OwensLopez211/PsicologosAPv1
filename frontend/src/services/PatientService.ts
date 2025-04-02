import axios from 'axios';

export interface Patient {
  id: number;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    user_type?: string; // Add user_type field to filter by role
  };
  phone_number: string;
  birth_date: string | null;
  gender: string;
  rut: string;
  region: string;
  city: string;
  profile_image: string | null;
}

class PatientService {
  private baseUrl = '/api/profiles/admin/patients';
  
  /**
   * Get patient initials from first and last name
   * @param patient Patient object
   * @returns String with patient initials
   */
  getPatientInitials(patient: Patient): string {
    if (!patient || !patient.user) return '??';
    
    const firstName = patient.user.first_name || '';
    const lastName = patient.user.last_name || '';
    
    const firstInitial = firstName.length > 0 ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName.length > 0 ? lastName.charAt(0).toUpperCase() : '';
    
    return (firstInitial + lastInitial) || '??';
  }
  
  /**
   * Get all patients
   * @param token Authentication token
   * @returns Promise with patient data
   */
  async getAllPatients(token: string | null): Promise<Patient[]> {
    try {
      if (!token) {
        throw new Error('No authentication token provided');
      }
      
      // Try with Bearer prefix for JWT tokens
      const response = await axios.get(this.baseUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      
      // Filter out non-client users if user_type is available
      const patients = response.data;
      return patients.filter((patient: Patient) =>
        !patient.user.user_type || patient.user.user_type === 'client'
      );
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  }

  /**
   * Toggle patient active status
   * @param token Authentication token
   * @param patientId Patient ID
   * @param isActive Current active status
   * @returns Promise with updated status
   */
  async togglePatientStatus(token: string | null, patientId: number): Promise<{ status: string; is_active: boolean }> {
    try {
      if (!token) {
        throw new Error('No authentication token provided');
      }
      
      const response = await axios.patch(
        `${this.baseUrl}/${patientId}/status/`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error toggling patient status:', error);
      throw error;
    }
  }

  /**
   * Get patient details by ID
   * @param token Authentication token
   * @param patientId Patient ID
   * @returns Promise with patient details
   */
  async getPatientById(token: string | null, patientId: number): Promise<Patient> {
    try {
      if (!token) {
        throw new Error('No authentication token provided');
      }
      
      const response = await axios.get(`${this.baseUrl}/${patientId}/`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching patient with ID ${patientId}:`, error);
      throw error;
    }
  }
}

export default new PatientService();