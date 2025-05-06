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
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 border-b pb-2">Información Personal</h2>
      <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
        <div className="flex flex-wrap items-start sm:items-center">
          <EnvelopeIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-[#2A6877] mt-0.5 sm:mt-0" />
          <span className="font-medium mr-1 sm:mr-2">Email:</span>
          <span className="break-all">{user.email}</span>
        </div>
        <div className="flex items-start sm:items-center">
          <PhoneIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-[#2A6877] mt-0.5 sm:mt-0" />
          <span className="font-medium mr-1 sm:mr-2">Teléfono:</span>
          <span>{phone || 'No especificado'}</span>
        </div>
        <div className="flex items-start sm:items-center">
          <IdentificationIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-[#2A6877] mt-0.5 sm:mt-0" />
          <span className="font-medium mr-1 sm:mr-2">RUT:</span>
          <span>{rut || 'No especificado'}</span>
        </div>
        <div className="flex items-start sm:items-center">
          <MapPinIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-[#2A6877] mt-0.5 sm:mt-0" />
          <span className="font-medium mr-1 sm:mr-2">Ubicación:</span>
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