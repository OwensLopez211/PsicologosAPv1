import { FC } from 'react';
import { Link } from 'react-router-dom';

interface SpecialistCardProps {
  id: number;
  name: string;
  university: string;
  specialties: string;
  experience: string;
  imageUrl: string;
  verification_status?: string;
  // Remove email and phone from props if they exist
}

const SpecialistCard: FC<SpecialistCardProps> = ({ 
  id, 
  name, 
  university, 
  specialties, 
  experience, 
  imageUrl,
  verification_status 
  // Ensure email and phone are not destructured from props
}) => {
  return (
    <div className="bg-white p-8 flex items-start justify-between gap-6 border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <Link to={`/especialistas/${id}`} className="flex gap-8 flex-1">
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-[#2A6877] flex-shrink-0">
            <img 
              src={imageUrl} 
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
          {verification_status === "VERIFIED" && (
            <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1" title="Especialista verificado">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-gray-900 hover:text-[#2A6877] transition-colors">{name}</h3>
            {verification_status === "VERIFIED" && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-medium">
                Verificado
              </span>
            )}
          </div>
          <p className="text-[#2A6877] text-sm font-medium mt-1">{university}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {specialties.split(', ').map((specialty, index) => (
              <span key={index} className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                {specialty}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-3">
            {experience} de experiencia
          </p>
          {/* No email or phone information displayed here */}
        </div>
      </Link>
      <button 
        className="bg-[#2A6877] text-white px-4 py-1.5 rounded-md hover:bg-[#235A67] transition-colors text-sm font-medium self-start"
        onClick={(e) => e.preventDefault()}
      >
        Agendar
      </button>
    </div>
  );
};

export default SpecialistCard;