import { memo } from 'react';
import { Patient } from '../../types/patients';
import PatientListItem from './PatientListItem';

interface PatientListProps {
  patients: Patient[];
  loading: boolean;
  searchTerm: string;
}

const PatientList = memo(({ patients, loading, searchTerm }: PatientListProps) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#2A6877]"></div>
        <span className="sr-only">Cargando...</span>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {searchTerm ? 
          `No se encontraron pacientes que coincidan con "${searchTerm}"` : 
          "No se encontraron pacientes"}
      </div>
    );
  }

  return (
    <>
      {/* Vista móvil: tarjetas */}
      <div className="grid grid-cols-1 gap-4 sm:hidden">
        {patients.map(patient => (
          <PatientListItem key={patient.id} patient={patient} view="card" />
        ))}
      </div>

      {/* Vista desktop: tabla */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Paciente
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Última cita
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Próxima cita
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {patients.map(patient => (
              <PatientListItem key={patient.id} patient={patient} view="table" />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
});

PatientList.displayName = 'PatientList';

export default PatientList;