import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import PatientService, { Patient } from '../../services/PatientService';
import { toast } from 'react-hot-toast';

const PatientsPage = () => {
  const { token } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const data = await PatientService.getAllPatients(token);
        setPatients(data);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError('Error al cargar los pacientes');
        toast.error('No se pudieron cargar los pacientes');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [token]);

  // Filter patients based on search term
  const filteredPatients = patients.filter(
    (patient) =>
      patient.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.rut && patient.rut.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Mis Pacientes</h1>
      
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        {/* Search input */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2A6877] focus:border-transparent"
              placeholder="Buscar por nombre, email o RUT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center h-24">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2A6877]"></div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Mobile patient cards */}
        {!loading && !error && (
          <div className="grid grid-cols-1 gap-4 sm:hidden">
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <div key={patient.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center mb-3">
                    <div className="h-12 w-12 flex-shrink-0">
                      <img
                        className="h-12 w-12 rounded-full object-cover"
                        src={patient.profile_image || '/default-avatar.png'}
                        alt={`${patient.user.first_name} ${patient.user.last_name}`}
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
                    <div className="text-xs text-gray-500 flex">
                      <span className="font-medium w-16">RUT:</span>
                      <span>{patient.rut}</span>
                    </div>
                    <div className="text-xs text-gray-500 flex">
                      <span className="font-medium w-16">Región:</span>
                      <span className="truncate">{patient.region}</span>
                    </div>
                    <div className="text-xs text-gray-500 flex">
                      <span className="font-medium w-16">Estado:</span>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          patient.user.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {patient.user.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                No se encontraron pacientes
              </div>
            )}
          </div>
        )}

        {/* Desktop table */}
        {!loading && !error && (
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RUT
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Región
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={patient.profile_image || '/default-avatar.png'}
                              alt={`${patient.user.first_name} ${patient.user.last_name}`}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {patient.user.first_name} {patient.user.last_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {patient.user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {patient.rut}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {patient.region}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
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
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      No se encontraron pacientes
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientsPage;