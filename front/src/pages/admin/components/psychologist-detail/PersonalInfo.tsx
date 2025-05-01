import React from 'react';
import { 
  EnvelopeIcon,
  PhoneIcon,
  IdentificationIcon,
  MapPinIcon
} from '@heroicons/react/24/solid';

interface User {
  email: string;
  first_name: string;
  last_name: string;
}

interface PersonalInfoProps {
  user: User;
  phone: string | null;
  rut: string | null;
  city: string | null;
  region: string | null;
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({
  user,
  phone,
  rut,
  city,
  region
}) => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Información Personal</h2>
      <div className="space-y-3">
        <div className="flex items-center">
          <EnvelopeIcon className="w-5 h-5 mr-3 text-[#2A6877]" />
          <span className="font-medium mr-2">Email:</span>
          <span>{user.email}</span>
        </div>
        <div className="flex items-center">
          <PhoneIcon className="w-5 h-5 mr-3 text-[#2A6877]" />
          <span className="font-medium mr-2">Teléfono:</span>
          <span>{phone || 'No especificado'}</span>
        </div>
        <div className="flex items-center">
          <IdentificationIcon className="w-5 h-5 mr-3 text-[#2A6877]" />
          <span className="font-medium mr-2">RUT:</span>
          <span>{rut || 'No especificado'}</span>
        </div>
        <div className="flex items-center">
          <MapPinIcon className="w-5 h-5 mr-3 text-[#2A6877]" />
          <span className="font-medium mr-2">Ubicación:</span>
          <span>
            {city && region 
              ? `${city}, ${region}` 
              : 'No especificado'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;