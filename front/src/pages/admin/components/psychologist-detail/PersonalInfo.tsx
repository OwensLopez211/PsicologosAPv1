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
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
        <span className="bg-[#2A6877]/10 p-1.5 rounded-md mr-2">
          <IdentificationIcon className="h-5 w-5 text-[#2A6877]" />
        </span>
        Información Personal
      </h2>
      
      <div className="space-y-4">
        <div className="flex flex-col">
          <div className="flex items-center mb-1.5">
            <EnvelopeIcon className="w-4 h-4 text-[#2A6877] mr-2" />
            <span className="text-sm font-medium text-gray-500">Email</span>
          </div>
          <span className="text-gray-800 pl-6 break-all">{user.email}</span>
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-center mb-1.5">
            <PhoneIcon className="w-4 h-4 text-[#2A6877] mr-2" />
            <span className="text-sm font-medium text-gray-500">Teléfono</span>
          </div>
          <span className="text-gray-800 pl-6">
            {phone ? (
              <a href={`tel:${phone}`} className="hover:text-[#2A6877] transition-colors">
                {phone}
              </a>
            ) : (
              <span className="text-gray-400 italic">No especificado</span>
            )}
          </span>
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-center mb-1.5">
            <IdentificationIcon className="w-4 h-4 text-[#2A6877] mr-2" />
            <span className="text-sm font-medium text-gray-500">RUT</span>
          </div>
          <span className="text-gray-800 pl-6">
            {rut || <span className="text-gray-400 italic">No especificado</span>}
          </span>
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-center mb-1.5">
            <MapPinIcon className="w-4 h-4 text-[#2A6877] mr-2" />
            <span className="text-sm font-medium text-gray-500">Ubicación</span>
          </div>
          <span className="text-gray-800 pl-6">
            {city && region 
              ? `${city}, ${region}`
              : <span className="text-gray-400 italic">No especificado</span>}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;