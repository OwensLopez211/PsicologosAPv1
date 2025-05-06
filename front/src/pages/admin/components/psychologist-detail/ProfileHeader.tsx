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
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckBadgeIcon className="w-3.5 h-3.5 mr-1" />
            Verificado
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <ExclamationCircleIcon className="w-3.5 h-3.5 mr-1" />
            Rechazado
          </span>
        );
      case 'VERIFICATION_IN_PROGRESS':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="w-3.5 h-3.5 mr-1" />
            En verificación
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="w-3.5 h-3.5 mr-1" />
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
    <div className="bg-gradient-to-br from-[#2A6877] to-[#1d4e5f] text-white p-4 sm:p-6 shadow-md">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-shrink-0">
            {profile_image ? (
              <img 
                src={profile_image} 
                alt={`${user.first_name} ${user.last_name}`}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white shadow-sm"
                loading="lazy"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 flex items-center justify-center border-2 border-white/50 shadow-sm">
                <UserCircleIcon className="w-10 h-10 sm:w-14 sm:h-14 text-white/80" />
              </div>
            )}
            <div className="absolute bottom-0 right-0 transform translate-x-1/4">
              {getStatusBadge(verification_status)}
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight">
              {user.first_name} {user.last_name}
            </h1>
            <p className="text-white/90 text-sm sm:text-base font-medium mt-0.5">
              {professional_title || 'Sin título especificado'}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 self-start md:self-center mt-2 md:mt-0">
          {/* Show verify button if not verified */}
          {verification_status !== 'VERIFIED' && (
            <button 
              onClick={() => handleStatusChange('VERIFIED')}
              className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 transition-colors shadow-sm flex items-center"
            >
              <CheckBadgeIcon className="w-3.5 h-3.5 mr-1.5" />
              Verificar
            </button>
          )}
          
          {/* Show different buttons based on verification status */}
          {verification_status === 'VERIFIED' ? (
            <button 
              onClick={() => handleStatusChange('VERIFICATION_IN_PROGRESS')}
              className="px-3 py-1.5 bg-yellow-600 text-white text-xs font-medium rounded-md hover:bg-yellow-700 transition-colors shadow-sm flex items-center"
            >
              <ClockIcon className="w-3.5 h-3.5 mr-1.5" />
              Reactivar verificación
            </button>
          ) : verification_status !== 'REJECTED' && (
            <button 
              onClick={() => handleStatusChange('REJECTED')}
              className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 transition-colors shadow-sm flex items-center"
            >
              <ExclamationCircleIcon className="w-3.5 h-3.5 mr-1.5" />
              Rechazar
            </button>
          )}
          
          {/* Show reactivate button if rejected */}
          {verification_status === 'REJECTED' && (
            <button 
              onClick={() => handleStatusChange('VERIFICATION_IN_PROGRESS')}
              className="px-3 py-1.5 bg-yellow-600 text-white text-xs font-medium rounded-md hover:bg-yellow-700 transition-colors shadow-sm flex items-center"
            >
              <ClockIcon className="w-3.5 h-3.5 mr-1.5" />
              Reactivar verificación
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;