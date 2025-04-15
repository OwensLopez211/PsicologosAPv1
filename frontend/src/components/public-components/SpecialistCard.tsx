import { FC } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface SpecialistCardProps {
  id: number;
  name: string;
  university: string;
  specialties: string;
  experience: string;
  imageUrl: string;
  verification_status?: string;
  gender?: string; // Add gender property
}

const SpecialistCard: FC<SpecialistCardProps> = ({ 
  id, 
  name, 
  university, 
  specialties, 
  experience, 
  imageUrl,
  verification_status,
  gender = 'male' // Default to male if not provided
}) => {
  const navigate = useNavigate();

  const handleSchedule = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/especialistas/${id}/agendar`);
  };

  // Determine the title prefix based on gender - make comparison case-insensitive
  const titlePrefix = gender?.toUpperCase() === 'FEMALE' ? 'Dra.' : 'Dr.';

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col md:flex-row">
      {/* Card content wrapper */}
      <Link to={`/especialistas/${id}`} className="flex flex-col md:flex-row w-full p-4 md:p-6">
        {/* Profile image and verification badge */}
        <div className="flex justify-center md:justify-start mb-4 md:mb-0">
          <div className="relative">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-[#2A6877] flex-shrink-0 border-2 border-[#e8f4f7]">
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
              <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1.5 shadow-md" title="Especialista verificado">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Specialist information */}
        <div className="md:ml-6 flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-2 justify-center md:justify-start">
            <h3 className="text-xl md:text-2xl font-semibold text-gray-900 hover:text-[#2A6877] transition-colors">
              <span className="text-[#2A6877]">{titlePrefix}</span> {name}
            </h3>
            {verification_status === "VERIFIED" && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-medium inline-block">
                Verificado
              </span>
            )}
          </div>
          
          <p className="text-[#2A6877] text-sm font-medium mt-1">{university}</p>
          
          <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
            {specialties.split(', ').map((specialty, index) => (
              <span 
                key={index} 
                className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full hover:bg-[#e8f4f7] transition-colors"
              >
                {specialty}
              </span>
            ))}
          </div>
          
          <p className="text-sm text-gray-600 mt-3">
            {experience} de experiencia
          </p>
        </div>
      </Link>

      {/* Schedule button */}
      <div className="p-4 md:p-0 md:flex md:items-center md:pr-6">
        <button 
          className="w-full md:w-auto bg-[#2A6877] text-white px-6 py-2.5 rounded-md hover:bg-[#235A67] transition-all duration-300 text-sm font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow"
          onClick={handleSchedule}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Agendar
        </button>
      </div>
    </div>
  );
};

export default SpecialistCard;