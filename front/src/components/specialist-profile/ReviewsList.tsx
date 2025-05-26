import { FC, useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { StarIcon } from '@heroicons/react/24/solid';

interface Review {
  id: number;
  patient_name: string;
  comment: string;
  rating: number;
  created_at: string;
  appointment_date: string;
}

interface ReviewsListProps {
  psychologistId: number;
}

const ReviewsList: FC<ReviewsListProps> = ({ psychologistId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null); // Referencia para el contenedor desplazable
  const intervalRef = useRef<number | null>(null); // Referencia para el intervalo de desplazamiento

  // Funciones para controlar el desplazamiento automático
  const startAutoScroll = () => {
    if (scrollContainerRef.current) {
      intervalRef.current = window.setInterval(() => {
        if (scrollContainerRef.current) {
          const container = scrollContainerRef.current;
          const scrollWidth = container.scrollWidth;
          const clientWidth = container.clientWidth;
          const currentScrollLeft = container.scrollLeft;

          // Si llegamos al final, volver al principio
          if (currentScrollLeft + clientWidth >= scrollWidth) {
            container.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            // Desplazarse una pequeña cantidad. Ajusta 100 para cambiar la velocidad.
            container.scrollBy({ left: 150, behavior: 'smooth' });
          }
        }
      }, 3000); // Ajusta 3000ms (3 segundos) para cambiar la frecuencia de desplazamiento
    }
  };

  const stopAutoScroll = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null; // Restablecer la referencia
    }
  };

  // Manejar pausa y reanudación al pasar el ratón
  const handleMouseEnter = () => { stopAutoScroll(); };
  const handleMouseLeave = () => { startAutoScroll(); };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/comments/public/psychologist/${psychologistId}/reviews/`);
        setReviews(Array.isArray(response.data.results) ? response.data.results : []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('No se pudieron cargar las reseñas');
        setLoading(false);
      } finally {
         // Asegurarse de que el carrusel inicia solo si hay reseñas después de la carga
         if (reviews.length > 0 && scrollContainerRef.current) {
             startAutoScroll();
         }
        }
    };

    fetchReviews();

    // Limpiar el intervalo al desmontar el componente
    return () => { stopAutoScroll(); };
  }, [psychologistId, reviews.length]); // Dependencia reviews.length para reiniciar si cambian las reseñas

  // Formatear fecha
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Fecha no disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Renderizar estrellas
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <StarIcon
        key={index}
        className={`h-5 w-5 ${
          index < rating ? 'text-yellow-400' : 'text-gray-200'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <motion.section 
        className="bg-white rounded-lg shadow-md p-6 border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2A6877]"></div>
        </div>
      </motion.section>
    );
  }

  if (error) {
    return (
      <motion.section 
        className="bg-white rounded-lg shadow-md p-6 border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center text-red-500">
          <p>{error}</p>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section 
      className="bg-white rounded-lg shadow-md p-6 border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center mb-6">
        <motion.div
          className="w-10 h-10 rounded-full bg-[#2A6877]/10 flex items-center justify-center mr-3"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#2A6877]" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </motion.div>
        <h2 className="text-xl font-bold text-gray-800">Reseñas de Pacientes</h2>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <p>No hay reseñas disponibles aún.</p>
        </div>
      ) : (
        // Contenedor desplazable con estilos para carrusel
        <div 
          ref={scrollContainerRef} 
          className="flex space-x-6 overflow-x-auto pb-4 no-scrollbar" // Añadir no-scrollbar class
          onMouseEnter={handleMouseEnter} // Pausar al pasar el ratón
          onMouseLeave={handleMouseLeave} // Reanudar al quitar el ratón
        >
          {reviews.map((review) => (
            <motion.div
              key={review.id}
              // Ajustar ancho para que no ocupe todo el espacio y permita ver el siguiente
              className="min-w-[85%] md:min-w-[55%] lg:min-w-[40%] bg-gradient-to-r from-gray-50 to-white p-5 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex-shrink-0" // flex-shrink-0 es importante
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">{review.patient_name}</h3>
                  <div className="flex items-center mt-1">
                    {renderStars(review.rating)}
                    <span className="ml-2 text-sm text-gray-500">
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                </div>
                {review.appointment_date && (
                  <span className="text-sm text-gray-500">
                    Cita: {formatDate(review.appointment_date)}
                  </span>
                )}
              </div>
              <p className="text-gray-700 mt-2">{review.comment}</p>
            </motion.div>
          ))}
        </div>
      )}
    </motion.section>
  );
};

export default ReviewsList; 