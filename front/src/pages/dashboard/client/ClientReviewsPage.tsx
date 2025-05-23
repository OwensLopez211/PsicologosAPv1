// front/src/pages/dashboard/client/ClientReviewsPage.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import ReviewForm from '../../../components/reviews/ReviewForm';
import { StarIcon } from '@heroicons/react/24/solid';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ReviewService, { Review } from '../../../services/ReviewService';

interface Appointment {
  id: number;
  date: string;
  status: string;
  psychologist: {
    user: {
      first_name: string;
      last_name: string;
    };
  };
}
 
const ClientReviewsPage = () => {
  useAuth();
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
  const [completedReviews, setCompletedReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar las citas pendientes de valoración
  const loadPendingAppointments = async () => {
    try {
      const data = await ReviewService.getPendingAppointments();
      setPendingAppointments(data);
    } catch (err) {
      setError('Error al cargar las citas pendientes de valoración');
    }
  };

  // Función para cargar las valoraciones realizadas
  const loadCompletedReviews = async () => {
    try {
      const data = await ReviewService.getClientReviews();
      setCompletedReviews(data);
    } catch (err) {
      setError('Error al cargar las valoraciones realizadas');
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        loadPendingAppointments(),
        loadCompletedReviews()
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Función para manejar el envío de una nueva valoración
  const handleSubmitReview = async (appointmentId: number, reviewData: { rating: number; comment: string }) => {
    try {
      await ReviewService.submitReview(appointmentId, reviewData);
      await Promise.all([loadPendingAppointments(), loadCompletedReviews()]);
    } catch (err) {
      setError('Error al enviar la valoración');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2A6877]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Mis Valoraciones</h1>
      
      {/* Sección de citas pendientes de valorar */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Citas por Valorar</h2>
        {pendingAppointments.length === 0 ? (
          <p className="text-gray-500">No tienes citas pendientes de valorar</p>
        ) : (
          <div className="space-y-6">
            {pendingAppointments.map((appointment) => (
              <ReviewForm
                key={appointment.id}
                appointment={appointment}
                onSubmit={(reviewData) => handleSubmitReview(appointment.id, reviewData)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sección de valoraciones realizadas */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Valoraciones Realizadas</h2>
        {completedReviews.length === 0 ? (
          <p className="text-gray-500">No has realizado ninguna valoración</p>
        ) : (
          <div className="space-y-6">
            {completedReviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {review.appointment?.psychologist.user.first_name} {review.appointment?.psychologist.user.last_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {review.appointment && format(new Date(review.appointment.date), "d 'de' MMMM 'de' yyyy", { locale: es })}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-2">Estado:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      review.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      review.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {review.status === 'APPROVED' ? 'Aprobada' :
                       review.status === 'REJECTED' ? 'Rechazada' : 'Pendiente'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      className={`h-5 w-5 ${
                        star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default ClientReviewsPage;