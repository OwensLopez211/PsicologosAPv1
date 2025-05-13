import axios from 'axios';
import { Patient as TypePatient } from '../types/patients';

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
   * Get backend URL based on environment
   */
  private getBackendUrl(): string {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:8000'
      : 'https://www.emindapp.cl';
  }

  /**
   * Get all patients
   * @param token Authentication token
   * @param userType Type of user (admin or psychologist)
   * @returns Promise with patient data
   */
  async getAllPatients(token: string | null, userType: string): Promise<TypePatient[]> {
    try {
      if (!token) {
        throw new Error('No authentication token provided');
      }
      
      let endpoint = '';
      
      // Determinar el endpoint basado en el tipo de usuario
      if (userType === 'psychologist') {
        endpoint = `${this.getBackendUrl()}/api/appointments/psychologist_patients/`;
      } else if (userType === 'admin') {
        endpoint = `${this.getBackendUrl()}/api/profiles/admin/patients/`;
      } else {
        throw new Error(`Tipo de usuario no válido: ${userType}`);
      }
      
      console.log(`Fetching patients from: ${endpoint}`);
      
      // Usar AbortController para cancelar la solicitud si tarda demasiado
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos
      
      const response = await axios.get(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const patients = response.data;
      
      if (userType === 'admin') {
        // Para admin, filtrar pacientes y mapear al formato común
        return patients
          .filter((patient: Patient) => !patient.user.user_type || patient.user.user_type === 'client')
          .map((patient: Patient) => this.mapToCommonFormat(patient));
      } else {
        // Para psicólogos, los datos ya vienen en el formato correcto
        return patients;
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  }
  
  /**
   * Map service patient to common patient format
   */
  private mapToCommonFormat(patient: Patient): TypePatient {
    return {
      id: patient.id,
      user: {
        id: patient.user.id,
        first_name: patient.user.first_name,
        last_name: patient.user.last_name,
        email: patient.user.email,
        is_active: patient.user.is_active
      },
      profile_image: patient.profile_image,
      rut: patient.rut,
      region: patient.region,
      total_appointments: 0, // Valor por defecto
      last_appointment_date: null,
      last_appointment_status: null,
      next_appointment_date: null,
      next_appointment_status: null
    };
  }

  /**
   * Toggle patient active status
   * @param token Authentication token
   * @param patientId Patient ID
   * @param userType Type of user (admin or psychologist)
   * @returns Promise with updated status
   */
  async togglePatientStatus(token: string | null, patientId: number, userType: string): Promise<{ status: string; is_active: boolean }> {
    try {
      if (!token) {
        throw new Error('No authentication token provided');
      }
      
      let endpoint = '';
      
      if (userType === 'psychologist') {
        endpoint = `${this.getBackendUrl()}/api/appointments/psychologist_patients/${patientId}/status/`;
      } else if (userType === 'admin') {
        endpoint = `${this.getBackendUrl()}/api/profiles/admin/patients/${patientId}/status/`;
      } else {
        throw new Error(`Tipo de usuario no válido: ${userType}`);
      }
      
      const response = await axios.patch(
        endpoint,
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
   * @param userType Type of user (admin or psychologist)
   * @returns Promise with patient details
   */
  async getPatientById(token: string | null, patientId: number, userType: string): Promise<Patient> {
    try {
      if (!token) {
        throw new Error('No authentication token provided');
      }
      
      let endpoint = '';
      
      if (userType === 'psychologist') {
        endpoint = `${this.getBackendUrl()}/api/appointments/psychologist_patients/${patientId}/`;
      } else if (userType === 'admin') {
        endpoint = `${this.getBackendUrl()}/api/profiles/admin/patients/${patientId}/`;
      } else {
        throw new Error(`Tipo de usuario no válido: ${userType}`);
      }
      
      const response = await axios.get(endpoint, {
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