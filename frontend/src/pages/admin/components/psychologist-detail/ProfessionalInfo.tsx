import React from 'react';
import { 
  AcademicCapIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/solid';

interface ProfessionalInfoProps {
  university: string | null;
  graduation_year: number | null;
  health_register_number: string | null;
}

const ProfessionalInfo: React.FC<ProfessionalInfoProps> = ({
  university,
  graduation_year,
  health_register_number
}) => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Información Profesional</h2>
      <div className="space-y-3">
        <div className="flex items-center">
          <AcademicCapIcon className="w-5 h-5 mr-3 text-[#2A6877]" />
          <span className="font-medium mr-2">Universidad:</span>
          <span>{university || 'No especificado'}</span>
        </div>
        <div className="flex items-center">
          <CalendarIcon className="w-5 h-5 mr-3 text-[#2A6877]" />
          <span className="font-medium mr-2">Año de graduación:</span>
          <span>{graduation_year || 'No especificado'}</span>
        </div>
        <div className="flex items-center">
          <DocumentTextIcon className="w-5 h-5 mr-3 text-[#2A6877]" />
          <span className="font-medium mr-2">Registro profesional:</span>
          <span>{health_register_number || 'No especificado'}</span>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalInfo;