import api from './api';

export interface Review {
  id: number;
  rating: number;
  comment: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
  patient_name?: string;
  psychologist_name?: string;
  appointment_date?: string;
  patient?: { 
    id: number;
    user: { 
      first_name: string; 
      last_name: string;
      email: string;
    } 
  };
  psychologist?: { 
    id: number;
    user: { 
      first_name: string; 
      last_name: string;
      email: string;
    } 
  };
  appointment?: {
    id: number;
    date: string;
    status: string;
    psychologist: { 
      user: { 
        first_name: string; 
        last_name: string 
      } 
    };
  };
}

export interface ReviewStats {
  total_reviews: number;
  average_rating: number;
  rating_distribution: { [key: number]: number };
}

export interface ReviewResponse {
  reviews: Review[];
  stats?: ReviewStats;
}

class ReviewService {
  // Cliente: citas pendientes de valorar
  async getPendingAppointments() {
    const { data } = await api.get('/comments/client/pending-appointments/');
    return Array.isArray(data.results) ? data.results : [];
  }

  // Cliente: valoraciones realizadas
  async getClientReviews() {
    const { data } = await api.get('/comments/client/reviews/');
    return data;
  }

  // Cliente: enviar valoración
  async submitReview(appointmentId: number, review: { rating: number; comment: string }) {
    const { data } = await api.post('/comments/client/submit/', {
      appointment: appointmentId,
      ...review
    });
    return data;
  }

  // Psicólogo: valoraciones recibidas y stats
  async getPsychologistReviews(): Promise<ReviewResponse> {
    const { data } = await api.get('/comments/psychologist/reviews/');
    return data;
  }

  // Público: valoraciones de un psicólogo específico
  async getPublicPsychologistReviews(psychologistId: number): Promise<Review[]> {
    const { data } = await api.get(`/comments/public/psychologist/${psychologistId}/reviews/`);
    return data;
  }

  // Admin: todas las valoraciones
  async getAdminReviews() {
    const { data } = await api.get('/comments/admin/reviews/');
    return data;
  }

  // Admin: aprobar/rechazar
  async moderateReview(id: number, status: 'APPROVED' | 'REJECTED') {
    const { data } = await api.patch(`/comments/admin/reviews/${id}/`, { status });
    return data;
  }

  // Admin: eliminar valoración
  async deleteReview(id: number) {
    await api.delete(`/comments/admin/reviews/${id}/`);
  }
}

export default new ReviewService();
