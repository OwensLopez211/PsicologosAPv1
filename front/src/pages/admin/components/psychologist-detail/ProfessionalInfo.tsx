import React from 'react';
import { 
  AcademicCapIcon,
  CalendarIcon,
  DocumentTextIcon,
  BriefcaseIcon
} from '@heroicons/react/24/solid';

interface ProfessionalInfoProps {
  university: string | null;
  graduation_year: number | null;
  health_register_number: string | null;
}

const ProfessionalInfo: React.FC<ProfessionalInfoProps> = ({
  university,
  graduation_year,
  health_register_number,
}) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
        <span className="bg-[#2A6877]/10 p-1.5 rounded-md mr-2">
          <BriefcaseIcon className="h-5 w-5 text-[#2A6877]" />
        </span>
        Información Profesional
      </h2>
      
      <div className="space-y-4">
        <div className="flex flex-col">
          <div className="flex items-center mb-1.5">
            <AcademicCapIcon className="w-4 h-4 text-[#2A6877] mr-2" />
            <span className="text-sm font-medium text-gray-500">Universidad</span>
          </div>
          <span className="text-gray-800 pl-6">
            {university || <span className="text-gray-400 italic">No especificado</span>}
          </span>
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-center mb-1.5">
            <CalendarIcon className="w-4 h-4 text-[#2A6877] mr-2" />
            <span className="text-sm font-medium text-gray-500">Año de graduación</span>
          </div>
          <span className="text-gray-800 pl-6">
            {graduation_year || <span className="text-gray-400 italic">No especificado</span>}
          </span>
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-center mb-1.5">
            <DocumentTextIcon className="w-4 h-4 text-[#2A6877] mr-2" />
            <span className="text-sm font-medium text-gray-500">Registro profesional</span>
          </div>
          <span className="text-gray-800 pl-6">
            {health_register_number || <span className="text-gray-400 italic">No especificado</span>}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalInfo;