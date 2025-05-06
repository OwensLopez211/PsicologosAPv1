import React from 'react';
import { 
  BriefcaseIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  MapPinIcon
} from '@heroicons/react/24/solid';

// Actualizar la interfaz para que coincida con el formato recibido del API
interface Experience {
  id: number;
  role?: string; // Campo en el API
  institution?: string; // Campo en el API
  position?: string; // Alternativa si no usa role
  company?: string; // Alternativa si no usa institution
  location?: string | null;
  start_date: string;
  end_date?: string | null;
  description?: string | null;
  is_current?: boolean;
  experience_type?: string;
  experience_type_display?: string;
}

interface ProfessionalExperiencesProps {
  experiences: Experience[] | null;
}

const ProfessionalExperiences: React.FC<ProfessionalExperiencesProps> = ({
  experiences
}) => {
  // Formatear la fecha: YYYY-MM-DD -> Mes YYYY
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Actualidad';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 border-b pb-2">
        Experiencia Profesional
      </h2>
      
      {experiences && experiences.length > 0 ? (
        <div className="space-y-4">
          {experiences.map((experience) => (
            <div 
              key={experience.id} 
              className="bg-white border rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start mb-2 sm:mb-3">
                <div className="bg-[#2A6877]/10 p-1.5 sm:p-2 rounded-lg mr-3 flex-shrink-0">
                  <BriefcaseIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#2A6877]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-medium text-gray-800">
                    {experience.role || experience.position || "Cargo no especificado"}
                  </h3>
                  {(experience.experience_type_display || experience.experience_type) && (
                    <div className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs mt-1">
                      {experience.experience_type_display || experience.experience_type}
                    </div>
                  )}
                  {(experience.institution || experience.company) && (
                    <div className="flex items-center text-xs sm:text-sm text-gray-600 mt-1">
                      <BuildingOfficeIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 mr-1" />
                      <span>{experience.institution || experience.company}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="pl-8 sm:pl-10 space-y-2">
                {experience.location && (
                  <div className="flex items-center text-xs sm:text-sm text-gray-600">
                    <MapPinIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 mr-1.5" />
                    <span>{experience.location}</span>
                  </div>
                )}
                
                <div className="flex items-center text-xs sm:text-sm text-gray-600">
                  <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 mr-1.5" />
                  <span>
                    {formatDate(experience.start_date)} - {formatDate(experience.end_date)}
                    {experience.is_current && ' (Actual)'}
                  </span>
                </div>
                
                {experience.description && (
                  <div className="mt-2 text-xs sm:text-sm text-gray-700 border-t pt-2">
                    <p>{experience.description}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm sm:text-base text-gray-500">No hay experiencias profesionales registradas</p>
      )}
    </div>
  );
};

export default ProfessionalExperiences; 