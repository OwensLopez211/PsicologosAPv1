import React from 'react';
import { usePatients } from '../../hooks/usePatients';
import PatientList from '../patients/PatientList';
import { useNavigate } from 'react-router-dom';

const PatientListWidget: React.FC = () => {
  const { patients, loading, error } = usePatients();
  const navigate = useNavigate();
  
  // Show only the first 5 patients
  const recentPatients = patients.slice(0, 5);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Pacientes Recientes</h2>
        <button 
          onClick={() => navigate('/admin/dashboard/pacients')}
          className="text-sm text-[#2A6877] hover:text-[#1a4c5a]"
        >
          Ver todos
        </button>
      </div>
      
      <PatientList 
        patients={recentPatients} 
        loading={loading} 
        error={error} 
        compact={true}
      />
    </div>
  );
};

export default PatientListWidget;