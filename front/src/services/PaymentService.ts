import axios from 'axios';
import { Appointment } from '../types/appointment';

export class PaymentService {
  /**
   * Obtiene los pagos pendientes según el rol del usuario
   */
  static async getPendingPayments(userRole: 'admin' | 'psychologist'): Promise<Appointment[]> {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = userData.id;
    
    // Usar el endpoint correcto según el rol
    const endpoint = userRole === 'admin' 
      ? '/api/payments/admin/pending-payments/' 
      : `/api/payments/psychologist/pending-payments/?user_id=${userId}`;
    
    const response = await axios.get(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  }

  /**
   * Verifica un pago
   */
  static async verifyPayment(
    appointment: Appointment, 
    verified: boolean, 
    notes: string, 
    userRole: 'admin' | 'psychologist'
  ): Promise<void> {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = userData.id;
    
    // Determinar el campo de notas según el rol
    const notesField = userRole === 'admin' ? 'admin_notes' : 'psychologist_notes';
    
    // Usar el endpoint correcto según el rol
    const endpoint = userRole === 'admin'
      ? `/api/payments/admin/verify-payment/${appointment.id}/`
      : `/api/payments/psychologist/verify-payment/${appointment.payment_detail?.id}/`;
    
    await axios.post(endpoint, {
      verified,
      [notesField]: notes,
      user_id: userId // Añadir el ID del usuario para ayudar al backend a encontrar el perfil
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  // Obtener todas las citas (pendientes y verificadas)
  static async getAllPayments(userRole: 'admin' | 'psychologist'): Promise<Appointment[]> {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = userData.id;
    
    // Usar el endpoint correcto según el rol
    const endpoint = userRole === 'admin' 
      ? '/api/payments/admin/all-payments/' 
      : `/api/payments/psychologist/all-payments/?user_id=${userId}`;
    
    const response = await axios.get(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  }
}