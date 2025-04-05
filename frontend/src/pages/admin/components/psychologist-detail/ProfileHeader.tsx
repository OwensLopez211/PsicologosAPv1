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
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckBadgeIcon className="w-5 h-5 mr-1" />
            Verificado
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <ExclamationCircleIcon className="w-5 h-5 mr-1" />
            Rechazado
          </span>
        );
      case 'VERIFICATION_IN_PROGRESS':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="w-5 h-5 mr-1" />
            En verificación
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="w-5 h-5 mr-1" />
            Pendiente
          </span>
        );
    }
  };

  // Helper function to map document status to profile status
  const mapDocumentStatusToProfileStatus = (documentStatus: string): string => {
    switch (documentStatus) {
      case 'verified':
        return 'VERIFIED';
      case 'rejected':
        return 'REJECTED';
      case 'pending':
        return 'VERIFICATION_IN_PROGRESS';
      default:
        return 'VERIFICATION_IN_PROGRESS';
    }
  };

  // Helper function to map profile status to document status
  const mapProfileStatusToDocumentStatus = (profileStatus: string): string => {
    switch (profileStatus) {
      case 'VERIFIED':
        return 'verified';
      case 'REJECTED':
        return 'rejected';
      case 'VERIFICATION_IN_PROGRESS':
        return 'pending';
      default:
        return 'pending';
    }
  };

  // Handle status change with proper mapping
  const handleStatusChange = (newProfileStatus: string) => {
    onStatusChange(newProfileStatus);
  };

  return (
    <div className="bg-[#2A6877] text-white p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <div className="relative">
            {profile_image ? (
              <img 
                src={profile_image} 
                alt={`${user.first_name} ${user.last_name}`}
                className="w-20 h-20 rounded-full object-cover border-2 border-white"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white">
                <UserCircleIcon className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {user.first_name} {user.last_name}
            </h1>
            <p className="text-white/80">{professional_title || 'Sin título especificado'}</p>
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          {getStatusBadge(verification_status)}
          
          {/* Only show verification buttons if not already verified */}
          {verification_status !== 'VERIFIED' && (
            <div className="flex space-x-2">
              <button 
                onClick={() => handleStatusChange('VERIFIED')}
                className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
              >
                Verificar
              </button>
              {verification_status !== 'REJECTED' && (
                <button 
                  onClick={() => handleStatusChange('REJECTED')}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                >
                  Rechazar
                </button>
              )}
            </div>
          )}
          
          {/* Show reactivate button if rejected */}
          {verification_status === 'REJECTED' && (
            <button 
              onClick={() => handleStatusChange('VERIFICATION_IN_PROGRESS')}
              className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
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