import React from 'react';
import { 
  BriefcaseIcon,
  UserGroupIcon
} from '@heroicons/react/24/solid';

interface SpecialtiesAndPopulationsProps {
  specialties: string[] | null;
  target_populations: string[] | null;
}

const SpecialtiesAndPopulations: React.FC<SpecialtiesAndPopulationsProps> = ({
  specialties,
  target_populations
}) => {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Especialidades y Áreas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium text-gray-700 mb-2 flex items-center">
            <BriefcaseIcon className="w-5 h-5 mr-2 text-[#2A6877]" />
            Especialidades
          </h3>
          {specialties && specialties.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {specialties.map((specialty, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {specialty}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No se han especificado especialidades</p>
          )}
        </div>
        
        <div>
          <h3 className="font-medium text-gray-700 mb-2 flex items-center">
            <UserGroupIcon className="w-5 h-5 mr-2 text-[#2A6877]" />
            Poblaciones objetivo
          </h3>
          {target_populations && target_populations.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {target_populations.map((population, index) => (
                <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  {population}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No se han especificado poblaciones objetivo</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpecialtiesAndPopulations;