import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { StarIcon } from '@heroicons/react/24/solid';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ReviewService, { Review, ReviewStats } from '../../../services/ReviewService';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

const PsychologistReviewsPage = () => {
  useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED'>('ALL');

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await ReviewService.getPsychologistReviews();
      setReviews(data.reviews);
      setStats(data.stats as ReviewStats | null);
      setError(null);
    } catch (err) {
      setError('Error al cargar las valoraciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'REJECTED':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Valoraciones Recibidas</h1>
        <p className="mt-2 text-sm text-gray-600">
          Revisa y analiza las valoraciones de tus pacientes
        </p>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
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
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900">Total de Valoraciones</h3>
              <p className="text-3xl font-bold text-[#2A6877] mt-2">{stats.total_reviews}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900">Valoraciones Aprobadas</h3>
              <p className="text-3xl font-bold text-[#2A6877] mt-2">
                {reviews.filter(r => r.status === 'APPROVED').length}
              </p>
            </div>
          </div>

          {/* Distribución de valoraciones */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Distribución de Valoraciones</h3>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center">
                  <span className="w-8 text-sm text-gray-600">{rating} estrellas</span>
                  <div className="flex-1 h-3 bg-gray-200 rounded-full mx-2">
                    <div
                      className="h-3 bg-yellow-400 rounded-full transition-all duration-500"
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
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'ALL', label: 'Todas' },
            { value: 'APPROVED', label: 'Aprobadas' },
            { value: 'PENDING', label: 'Pendientes' },
            { value: 'REJECTED', label: 'Rechazadas' }
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value as typeof filter)}
              className={`px-4 py-2 rounded-md transition-all duration-200 ${
                filter === value 
                  ? 'bg-[#2A6877] text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de valoraciones */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Valoraciones</h2>
        </div>
        
        {filteredReviews.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 text-lg">No hay valoraciones para mostrar</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredReviews.map((review) => (
              <div key={review.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-gray-900">
                        {review.patient_name}
                      </h3>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(review.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                          {review.status === 'APPROVED' ? 'Aprobada' :
                           review.status === 'REJECTED' ? 'Rechazada' : 'Pendiente'}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-3">
                      {format(new Date(review.created_at), "d 'de' MMMM 'de' yyyy", { locale: es })}
                    </p>
                    
                    <div className="flex gap-1 mb-3">
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default PsychologistReviewsPage;
