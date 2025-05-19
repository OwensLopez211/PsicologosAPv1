import { memo } from 'react';
import { Patient } from '../../types/patients';
import PatientListItem from './PatientListItem';

interface PatientListProps {
  patients: Patient[];
  loading: boolean;
  searchTerm?: string;
  error?: string | null;
  compact?: boolean;
}

const PatientList = memo(({ patients, loading, searchTerm = '', error, compact = false }: PatientListProps) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#2A6877]"></div>
        <span className="sr-only">Cargando...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        <p>{error}</p>
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

  // Si es compacto, mostrar vista simplificada
  if (compact) {
    return (
      <div className="space-y-2">
        {patients.map(patient => (
          <div key={patient.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-[#2A6877]/10 flex items-center justify-center text-[#2A6877] font-medium">
                {patient.user.first_name.charAt(0)}{patient.user.last_name.charAt(0)}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{patient.user.first_name} {patient.user.last_name}</p>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {patient.total_appointments} citas
            </div>
          </div>
        ))}
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