import React from 'react';
import { 
  CheckBadgeIcon,
  ExclamationCircleIcon, 
  ClockIcon,
  UserCircleIcon
} from '@heroicons/react/24/solid';

interface User {
  first_name: string;
  last_name: string;
}

interface ProfileHeaderProps {
  user: User;
  profile_image: string | null;
  professional_title: string | null;
  verification_status: string;
  onStatusChange: (newStatus: string) => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  profile_image,
  professional_title,
  verification_status,
  onStatusChange
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-green-100 text-green-800">
            <CheckBadgeIcon className="w-4 h-4 mr-1" />
            Verificado
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-red-100 text-red-800">
            <ExclamationCircleIcon className="w-4 h-4 mr-1" />
            Rechazado
          </span>
        );
      case 'VERIFICATION_IN_PROGRESS':
        return (
          <span className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="w-4 h-4 mr-1" />
            En verificación
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="w-4 h-4 mr-1" />
            Pendiente
          </span>
        );
    }
  };
  
  // Handle status change with proper mapping
  const handleStatusChange = (newProfileStatus: string) => {
    onStatusChange(newProfileStatus);
  };

  return (
    <div className="bg-[#2A6877] text-white p-3 sm:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="flex items-center space-x-3 sm:space-x-4 mb-3 md:mb-0">
          <div className="relative">
            {profile_image ? (
              <img 
                src={profile_image} 
                alt={`${user.first_name} ${user.last_name}`}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white">
                <UserCircleIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">
              {user.first_name} {user.last_name}
            </h1>
            <p className="text-white/80 text-sm sm:text-base">{professional_title || 'Sin título especificado'}</p>
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          {getStatusBadge(verification_status)}
          
          <div className="flex flex-wrap gap-2">
            {/* Show verify button if not verified */}
            {verification_status !== 'VERIFIED' && (
              <button 
                onClick={() => handleStatusChange('VERIFIED')}
                className="px-2 py-1 sm:px-3 sm:py-1 bg-green-500 text-white text-xs sm:text-sm rounded hover:bg-green-600"
              >
                Verificar
              </button>
            )}
            
            {/* Show different buttons based on verification status */}
            {verification_status === 'VERIFIED' ? (
              <button 
                onClick={() => handleStatusChange('VERIFICATION_IN_PROGRESS')}
                className="px-2 py-1 sm:px-3 sm:py-1 bg-yellow-500 text-white text-xs sm:text-sm rounded hover:bg-yellow-600"
              >
                Reactivar verificación
              </button>
            ) : verification_status !== 'REJECTED' && (
              <button 
                onClick={() => handleStatusChange('REJECTED')}
                className="px-2 py-1 sm:px-3 sm:py-1 bg-red-500 text-white text-xs sm:text-sm rounded hover:bg-red-600"
              >
                Rechazar
              </button>
            )}
          </div>
          
          {/* Show reactivate button if rejected */}
          {verification_status === 'REJECTED' && (
            <button 
              onClick={() => handleStatusChange('VERIFICATION_IN_PROGRESS')}
              className="px-2 py-1 sm:px-3 sm:py-1 bg-yellow-500 text-white text-xs sm:text-sm rounded hover:bg-yellow-600"
            >
              Reactivar verificación
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;