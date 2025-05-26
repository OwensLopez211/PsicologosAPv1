import React from 'react';
import SpecialistCard from '../public-components/SpecialistCard';

interface Specialist {
  id: number;
  name: string;
  university: string;
  specialties: string[];
  experience: string;
  profile_image?: string;
  verification_status: string;
  professional_title?: string;
  gender?: string;
  rating?: number;
}

interface SpecialistListProps {
  specialists: Specialist[];
}

export const SpecialistList: React.FC<SpecialistListProps> = ({ specialists }) => {
  if (specialists.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h3 className="text-xl font-medium text-gray-700 mb-2">No se encontraron especialistas</h3>
        <p className="text-gray-500">No hay especialistas verificados que coincidan con tus criterios de búsqueda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-6">
      {specialists.map((specialist) => (
        <div key={specialist.id} className="bg-white shadow-sm rounded-lg p-4">
          <SpecialistCard
            id={specialist.id}
            name={specialist.name}
            university={specialist.university || ''}
            specialties={Array.isArray(specialist.specialties) ? specialist.specialties.join(', ') : ''}
            imageUrl={specialist.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(specialist.name)}&background=2A6877&color=fff&size=300`}
            verification_status={specialist.verification_status}
            gender={specialist.gender}
            rating={specialist.rating}
          />
        </div>
      ))}
    </div>
  );
};

export default SpecialistList;