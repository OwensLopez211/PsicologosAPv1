import React from 'react';
import { usePatients } from '../../hooks/usePatients';
import PatientList from '../patients/PatientList';
import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const PatientListWidget: React.FC = () => {
  const { patients, loading, error } = usePatients();
  const navigate = useNavigate();
  
  // Show only the first 5 patients
  const recentPatients = patients.slice(0, 5);
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-medium text-gray-800">Pacientes Recientes</h2>
        <button 
          onClick={() => navigate('/admin/dashboard/pacients')}
          className="flex items-center text-sm font-medium text-[#2A6877] hover:text-[#1a4c5a] transition-colors"
        >
          Ver todos
          <ArrowRightIcon className="ml-1 h-4 w-4" />
        </button>
      </div>
      
      <div className="px-6 py-4">
        <PatientList 
          patients={recentPatients} 
          loading={loading} 
          error={error} 
          compact={true}
        />
      </div>
    </div>
  );
};

export default PatientListWidget;