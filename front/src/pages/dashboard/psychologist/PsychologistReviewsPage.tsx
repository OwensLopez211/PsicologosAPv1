import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { StarIcon } from '@heroicons/react/24/solid';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ReviewService, { Review, ReviewStats } from '../../../services/ReviewService';

const PsychologistReviewsPage = () => {
  useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED'>('ALL');

  // Función para cargar las valoraciones
  const loadReviews = async () => {
    try {
      const data = await ReviewService.getPsychologistReviews();
      setReviews(data.reviews);
      setStats(data.stats as ReviewStats | null);
    } catch (err) {
      setError('Error al cargar las valoraciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  // Filtrar valoraciones según el estado seleccionado
  const filteredReviews = reviews.filter(review => 
    filter === 'ALL' ? true : review.status === filter
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2A6877]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Valoraciones Recibidas</h1>

      {/* Estadísticas */}
      {stats && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">Valoración Promedio</h3>
              <div className="flex items-center justify-center mt-2">
                <span className="text-3xl font-bold text-[#2A6877]">{stats.average_rating.toFixed(1)}</span>
                <div className="flex ml-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.round(stats.average_rating) ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">Total de Valoraciones</h3>
              <p className="text-3xl font-bold text-[#2A6877] mt-2">{stats.total_reviews}</p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">Valoraciones Aprobadas</h3>
              <p className="text-3xl font-bold text-[#2A6877] mt-2">
                {reviews.filter(r => r.status === 'APPROVED').length}
              </p>
            </div>
          </div>

          {/* Distribución de valoraciones */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Distribución de Valoraciones</h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center">
                  <span className="w-8 text-sm text-gray-600">{rating} estrellas</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full mx-2">
                    <div
                      className="h-2 bg-yellow-400 rounded-full"
                      style={{
                        width: `${(stats.rating_distribution[rating] / stats.total_reviews) * 100}%`
                      }}
                    />
                  </div>
                  <span className="w-12 text-sm text-gray-600">
                    {stats.rating_distribution[rating] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-md ${
              filter === 'ALL' ? 'bg-[#2A6877] text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('APPROVED')}
            className={`px-4 py-2 rounded-md ${
              filter === 'APPROVED' ? 'bg-[#2A6877] text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Aprobadas
          </button>
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-4 py-2 rounded-md ${
              filter === 'PENDING' ? 'bg-[#2A6877] text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setFilter('REJECTED')}
            className={`px-4 py-2 rounded-md ${
              filter === 'REJECTED' ? 'bg-[#2A6877] text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Rechazadas
          </button>
        </div>
      </div>

      {/* Lista de valoraciones */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Valoraciones</h2>
        {filteredReviews.length === 0 ? (
          <p className="text-gray-500">No hay valoraciones para mostrar</p>
        ) : (
          <div className="space-y-6">
            {filteredReviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {review.patient?.user.first_name} {review.patient?.user.last_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {format(new Date(review.created_at), "d 'de' MMMM 'de' yyyy", { locale: es })}
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

export default PsychologistReviewsPage;
