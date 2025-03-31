import { FC } from 'react';

interface ProfileHeaderProps {
  name: string;
  title: string;
  registrationNumber: string;
  profileImage: string;
  onSchedule: () => void;
}

const ProfileHeader: FC<ProfileHeaderProps> = ({
  name,
  title,
  registrationNumber,
  profileImage,
  onSchedule
}) => (
  <div className="bg-white shadow-sm">
    <div className="container mx-auto px-6 py-8">
      <div className="md:flex md:items-center md:gap-12">
        <div className="md:w-1/4">
          <img 
            src={profileImage}
            alt={name}
            className="w-48 h-48 rounded-full object-cover mx-auto shadow-lg"
          />
        </div>
        <div className="md:w-3/4 mt-6 md:mt-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">{name}</h1>
              <p className="text-[#2A6877] font-medium mt-1">{title}</p>
              <p className="text-gray-600 text-sm mt-1">Registro: {registrationNumber}</p>
            </div>
            <button 
              className="bg-[#2A6877] text-white px-6 py-2 rounded-md hover:bg-[#235A67] transition-colors"
              onClick={onSchedule}
            >
              Agendar Consulta
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ProfileHeader;