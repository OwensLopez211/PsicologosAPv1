import { memo } from 'react';
import { Patient } from '../../types/patients';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import AppointmentStatusBadge from './AppointmentStatusBadge';
import UserAvatar from '../shared/UserAvatar';

interface PatientListItemProps {
  patient: Patient;
  view: 'card' | 'table';
}

const PatientListItem = memo(({ patient, view }: PatientListItemProps) => {
  // Formatear fecha para mostrar
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'No hay cita programada';
    try {
      const date = new Date(dateString);
      return format(date, "d 'de' MMMM, yyyy", { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  if (view === 'card') {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center mb-3">
          <div className="h-12 w-12 flex-shrink-0">
            <UserAvatar 
              profileImage={patient.profile_image}
              firstName={patient.user.first_name}
              lastName={patient.user.last_name}
              size="large"
            />
          </div>
          <div className="ml-3 flex-grow">
            <div className="text-sm font-medium text-gray-900">
              {patient.user.first_name} {patient.user.last_name}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {patient.user.email}
            </div>
          </div>
        </div>
        
        <div className="mt-2 space-y-1">
          {patient.rut && (
            <div className="text-xs text-gray-500 flex">
              <span className="font-medium w-28">RUT:</span>
              <span>{patient.rut}</span>
            </div>
          )}
          <div className="text-xs text-gray-500 flex">
            <span className="font-medium w-28">Última cita:</span>
            <div className="flex flex-col">
              <span>{formatDate(patient.last_appointment_date)}</span>
              {patient.last_appointment_date && (
                <AppointmentStatusBadge status={patient.last_appointment_status} />
              )}
            </div>
          </div>
          <div className="text-xs text-gray-500 flex">
            <span className="font-medium w-28">Próxima cita:</span>
            <div className="flex flex-col">
              <span className={patient.next_appointment_date ? "text-[#2A6877]" : ""}>
                {formatDate(patient.next_appointment_date)}
              </span>
              {patient.next_appointment_date && (
                <AppointmentStatusBadge status={patient.next_appointment_status} />
              )}
            </div>
          </div>
          <div className="text-xs text-gray-500 flex">
            <span className="font-medium w-28">Total de citas:</span>
            <span>{patient.total_appointments}</span>
          </div>
        </div>
      </div>
    );
  }

  // Vista de tabla
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <UserAvatar 
              profileImage={patient.profile_image}
              firstName={patient.user.first_name}
              lastName={patient.user.last_name}
              size="medium"
            />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {patient.user.first_name} {patient.user.last_name}
            </div>
            {patient.rut && (
              <div className="text-xs text-gray-500">RUT: {patient.rut}</div>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div>{patient.user.email}</div>
        {patient.region && (
          <div className="text-xs text-gray-500">{patient.region}</div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="flex flex-col space-y-1">
          <span>{formatDate(patient.last_appointment_date)}</span>
          {patient.last_appointment_date && (
            <AppointmentStatusBadge status={patient.last_appointment_status} />
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex flex-col space-y-1">
          <span className={patient.next_appointment_date ? "text-[#2A6877]" : "text-gray-500"}>
            {formatDate(patient.next_appointment_date)}
          </span>
          {patient.next_appointment_date && (
            <AppointmentStatusBadge status={patient.next_appointment_status} />
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {patient.total_appointments}
      </td>
    </tr>
  );
});

PatientListItem.displayName = 'PatientListItem';

export default PatientListItem; 