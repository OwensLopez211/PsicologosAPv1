import React from 'react';
import { Patient } from '../../services/PatientService';

interface PatientListProps {
  patients: Patient[];
  loading: boolean;
  error: string | null;
  onViewDetails?: (patient: Patient) => void;
  compact?: boolean;
}

const PatientList: React.FC<PatientListProps> = ({ 
  patients, 
  loading, 
  error, 
  onViewDetails,
  compact = false 
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-24">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2A6877]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded relative text-sm" role="alert">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No se encontraron pacientes
      </div>
    );
  }

  // Mobile card view
  const renderMobileView = () => {
    return (
      <div className="grid grid-cols-1 gap-4 sm:hidden">
        {patients.map((patient) => (
          <div key={patient.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-3">
              <div className="h-12 w-12 flex-shrink-0">
                <img
                  className="h-12 w-12 rounded-full object-cover border-2 border-[#2A6877]"
                  src={patient.profile_image || '/default-avatar.png'}
                  alt={`${patient.user.first_name} ${patient.user.last_name}`}
                />
              </div>
              <div className="ml-3 flex-grow">
                <div className="text-base font-medium text-gray-900">
                  {patient.user.first_name} {patient.user.last_name}
                </div>
                <span
                  className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    patient.user.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {patient.user.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
            
            {!compact && (
              <div className="mt-3 space-y-2 bg-gray-50 p-3 rounded-md">
                <div className="text-sm text-gray-600 flex flex-col">
                  <span className="font-medium text-[#2A6877] mb-1">Email:</span>
                  <span className="truncate">{patient.user.email}</span>
                </div>
                <div className="text-sm text-gray-600 flex flex-col">
                  <span className="font-medium text-[#2A6877] mb-1">RUT:</span>
                  <span>{patient.rut}</span>
                </div>
              </div>
            )}
            
            {onViewDetails && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => onViewDetails(patient)}
                  className="text-sm bg-[#2A6877] text-white py-2 px-4 rounded-md hover:bg-[#1a4c5a] transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Ver detalles
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Desktop table view
  const renderDesktopView = () => {
    return (
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              {!compact && (
                <>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RUT
                  </th>
                </>
              )}
              <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              {onViewDetails && (
                <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {patients.map((patient) => (
              <tr key={patient.id} className="hover:bg-gray-50">
                <td className="py-2 px-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 flex-shrink-0">
                      <img
                        className="h-8 w-8 rounded-full object-cover"
                        src={patient.profile_image || '/default-avatar.png'}
                        alt={`${patient.user.first_name} ${patient.user.last_name}`}
                      />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {patient.user.first_name} {patient.user.last_name}
                      </div>
                    </div>
                  </div>
                </td>
                {!compact && (
                  <>
                    <td className="py-2 px-3 whitespace-nowrap text-sm text-gray-500">
                      {patient.user.email}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-sm text-gray-500">
                      {patient.rut}
                    </td>
                  </>
                )}
                <td className="py-2 px-3 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      patient.user.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {patient.user.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                {onViewDetails && (
                  <td className="py-2 px-3 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => onViewDetails(patient)}
                      className="text-[#2A6877] hover:text-[#1a4c5a]"
                    >
                      Ver detalles
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // At the top of your component, add:
  const isMobile = window.innerWidth < 640;
  
  // Then in your return statement:
  return (
    <div className={`${compact ? 'max-h-80 overflow-y-auto' : ''}`}>
      {isMobile && <div className="bg-yellow-100 p-2 mb-4 text-center text-sm">Mobile View Active</div>}
      {renderMobileView()}
      {renderDesktopView()}
    </div>
  );
};

export default PatientList;