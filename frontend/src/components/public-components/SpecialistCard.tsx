import { FC, useState, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Ajusta la ruta según tu estructura

// Lazy load del AppointmentModal
const AppointmentModal = lazy(() => import('../specialist-profile/appointmentModal'));

interface SpecialistCardProps {
  id: number;
  name: string;
  university: string;
  specialties: string;
  experience: string;
  imageUrl: string;
  verification_status?: string;
  gender?: string;
  rating?: number; // Añadido para mostrar valoración
  availabilityStatus?: 'available' | 'busy' | 'unavailable'; // Para mostrar disponibilidad
}

const SpecialistCard: FC<SpecialistCardProps> = ({ 
  id, 
  name, 
  university, 
  specialties, 
  experience, 
  imageUrl,
  verification_status,
  gender = 'male',
  rating = 4.8, // Valor por defecto
  availabilityStatus = 'available' // Valor por defecto
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  const handleSchedule = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Verificar si el usuario está autenticado
    if (!isAuthenticated) {
      // Redirigir a la página de inicio de sesión
      navigate('/login?redirect=' + encodeURIComponent(`/especialistas/${id}/agendar`));
      return;
    }
    
    // Si está autenticado, mostrar el modal
    setShowAppointmentModal(true);
  };

  const handleCloseModal = () => {
    setShowAppointmentModal(false);
  };

  // Determine the title prefix based on gender
  const titlePrefix = gender?.toUpperCase() === 'FEMALE' ? 'Ps.' : 'Ps.';
  
  // Availability indicators
  const availabilityColors = {
    available: 'bg-green-500',
    busy: 'bg-amber-500',
    unavailable: 'bg-gray-400'
  };
  
  const availabilityText = {
    available: 'Disponible',
    busy: 'Agenda limitada',
    unavailable: 'No disponible'
  };

  // Split specialties into array
  const specialtiesArray = specialties.split(', ');

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
        <div className="relative">
          {/* Background Banner with Design Element */}
          <div className="w-full h-16 bg-gradient-to-r from-teal-600 to-cyan-700" />
          
          <div className="px-6 pt-0 pb-6">
            {/* Card Content Wrapper */}
            <Link to={`/especialistas/${id}`} className="block">
              {/* Profile Section with Avatar */}
              <div className="flex flex-col sm:flex-row">
                {/* Avatar + Verification */}
                <div className="flex justify-center sm:justify-start -mt-8 mb-4 sm:mb-0">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white shadow-md">
                      <img 
                        src={imageUrl} 
                        alt={`${titlePrefix} ${name}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/150?text=Psicólogo';
                        }}
                      />
                    </div>
                    {verification_status === "VERIFIED" && (
                      <div className="absolute -bottom-1 -right-1 bg-teal-500 text-white rounded-full p-1.5 shadow-md" title="Especialista verificado">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Section */}
                <div className="sm:ml-6 flex-1 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
                    <h3 className="text-xl font-bold text-gray-800">
                      <span className="text-teal-600">{titlePrefix}</span> {name}
                    </h3>
                    
                    {/* Verification Badge */}
                    {verification_status === "VERIFIED" && (
                      <span className="bg-teal-50 text-teal-700 text-xs px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Verificado
                      </span>
                    )}
                  </div>
                  
                  {/* University with Icon */}
                  <div className="flex items-center justify-center sm:justify-start mt-1 text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                    </svg>
                    <p className="text-sm font-medium">{university}</p>
                  </div>
                  
                  {/* Experience + Rating in a row */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2">
                    {/* Experience Badge */}
                    <div className="flex items-center text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm">{experience} de experiencia</span>
                    </div>
                    
                    {/* Rating Stars */}
                    <div className="flex items-center">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <svg 
                            key={i} 
                            xmlns="http://www.w3.org/2000/svg" 
                            className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-amber-400' : 'text-gray-300'}`} 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-1 text-sm font-medium text-gray-600">{rating.toFixed(1)}</span>
                    </div>
                    
                    {/* Availability Status */}
                    <div className="flex items-center">
                      <div className={`h-2 w-2 rounded-full ${availabilityColors[availabilityStatus]} mr-1.5`}></div>
                      <span className="text-xs font-medium text-gray-600">{availabilityText[availabilityStatus]}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Specialties Tags */}
              <div className="mt-4">
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  {specialtiesArray.slice(0, 3).map((specialty, index) => (
                    <span 
                      key={index} 
                      className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full hover:bg-teal-50 hover:text-teal-700 transition-colors"
                    >
                      {specialty}
                    </span>
                  ))}
                  {specialtiesArray.length > 3 && (
                    <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                      +{specialtiesArray.length - 3} más
                    </span>
                  )}
                </div>
              </div>
            </Link>

            {/* Button Row */}
            <div className="mt-5 flex items-center justify-between gap-4">
              {/* Schedule button */}
              <button 
                className="flex-1 bg-teal-600 text-white px-4 py-2.5 rounded-lg hover:bg-teal-700 transition-all duration-300 text-sm font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow"
                onClick={handleSchedule}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Agendar cita
              </button>
              
              {/* View Profile Button */}
              <Link 
                to={`/especialistas/${id}`}
                className="flex-1 bg-white border border-teal-600 text-teal-600 px-4 py-2.5 rounded-lg hover:bg-teal-50 transition-all duration-300 text-sm font-medium flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Ver perfil
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de citas con carga diferida */}
      {showAppointmentModal && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#2A6877] mx-auto"></div>
              <p className="text-center mt-2">Cargando agenda...</p>
            </div>
          </div>
        }>
          <AppointmentModal
            psychologistId={id}
            psychologistName={name}
            onClose={handleCloseModal}
          />
        </Suspense>
      )}
    </>
  );
};

export default SpecialistCard;