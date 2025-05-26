import { useState, useEffect } from 'react';
import ReviewService, { Review } from '../../../services/ReviewService';
import { StarIcon } from '@heroicons/react/24/solid';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED'>('PENDING');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [selectedAction, setSelectedAction] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await ReviewService.getAdminReviews();
      setReviews(Array.isArray(data.results) ? data.results : data);
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

  const handleModerate = async (review: Review, newStatus: 'APPROVED' | 'REJECTED') => {
    setSelectedReview(review);
    setSelectedAction(newStatus);
    setIsConfirmModalOpen(true);
  };

  const confirmModeration = async () => {
    if (!selectedReview || !selectedAction) return;

    try {
      setIsProcessing(true);
      await ReviewService.moderateReview(selectedReview.id, selectedAction);
      await loadReviews();
      setIsConfirmModalOpen(false);
      setSelectedReview(null);
      setSelectedAction(null);
    } catch (err) {
      setError('Error al actualizar la valoración');
    } finally {
      setIsProcessing(false);
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Moderación de Valoraciones</h1>
        <p className="mt-2 text-sm text-gray-600">
          Gestiona y modera las valoraciones de los pacientes
        </p>
      </div>
      
      {/* Filtros */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'ALL', label: 'Todas' },
            { value: 'PENDING', label: 'Pendientes' },
            { value: 'APPROVED', label: 'Aprobadas' },
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
                        {review.patient_name} &rarr; {review.psychologist_name}
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

                  {review.status === 'PENDING' && (
                    <div className="flex gap-2 md:flex-col">
                      <button
                        onClick={() => handleModerate(review, 'APPROVED')}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircleIcon className="h-5 w-5" />
                        Aprobar
                      </button>
                      <button
                        onClick={() => handleModerate(review, 'REJECTED')}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircleIcon className="h-5 w-5" />
                        Rechazar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de confirmación */}
      <Transition appear show={isConfirmModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => !isProcessing && setIsConfirmModalOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Confirmar acción
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      ¿Estás seguro que deseas {selectedAction === 'APPROVED' ? 'aprobar' : 'rechazar'} esta valoración?
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                      onClick={() => setIsConfirmModalOpen(false)}
                      disabled={isProcessing}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                        selectedAction === 'APPROVED'
                          ? 'bg-green-600 hover:bg-green-700 focus-visible:ring-green-500'
                          : 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500'
                      }`}
                      onClick={confirmModeration}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        selectedAction === 'APPROVED' ? 'Aprobar' : 'Rechazar'
                      )}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Mensaje de error */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default AdminReviewsPage;
