// front/src/components/reviews/ReviewForm.tsx
import { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

interface ReviewFormProps {
  appointment?: {
    id: number;
    date: string;
    psychologist: {
      user: {
        first_name: string;
        last_name: string;
      };
    };
  };
  onSubmit: (review: { rating: number; comment: string }) => void;
  initialRating?: number;
  initialComment?: string;
  isReadOnly?: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  appointment,
  onSubmit,
  initialRating = 0,
  initialComment = '',
  isReadOnly = false
}) => {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);

  const handleSubmit = () => {
    if (rating === 0) {
      // Aquí podrías mostrar un mensaje de error
      return;
    }
    onSubmit({ rating, comment });
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      {appointment && (
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Sesión con {appointment.psychologist.user.first_name} {appointment.psychologist.user.last_name}
          </h3>
          <p className="text-sm text-gray-500">
            Fecha: {new Date(appointment.date).toLocaleDateString()}
          </p>
        </div>
      )}
      
      <h3 className="text-lg font-medium text-gray-900 mb-4">Deja tu valoración</h3>
      
      {/* Estrellas de valoración */}
      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => !isReadOnly && setRating(star)}
            className={`focus:outline-none ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}
            disabled={isReadOnly}
          >
            {star <= rating ? (
              <StarIcon className="h-8 w-8 text-yellow-400" />
            ) : (
              <StarOutlineIcon className="h-8 w-8 text-gray-300" />
            )}
          </button>
        ))}
      </div>

      {/* Campo de comentario */}
      <textarea
        value={comment}
        onChange={(e) => !isReadOnly && setComment(e.target.value)}
        className={`w-full rounded-md border-gray-300 shadow-sm focus:border-[#2A6877] focus:ring-[#2A6877] ${
          isReadOnly ? 'bg-gray-50 cursor-default' : ''
        }`}
        rows={4}
        placeholder="Cuéntanos tu experiencia..."
        disabled={isReadOnly}
      />

      {!isReadOnly && (
        <button
          onClick={handleSubmit}
          className="mt-4 px-4 py-2 bg-[#2A6877] text-white rounded-md hover:bg-[#1f4f5a] transition-colors"
        >
          Enviar Valoración
        </button>
      )}
    </div>
  );
};

export default ReviewForm;