import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';
import PatientService, { Patient } from '../../../services/PatientService';

const PatientsManagement = () => {
  // Get token directly from localStorage
  const storedToken = localStorage.getItem('token');
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(10);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        // Log token information for debugging
        console.log('Token available:', !!storedToken);
        console.log('Token value:', storedToken ? `${storedToken.substring(0, 15)}...` : 'No token');
        
        setLoading(true);
        // Use the token from localStorage directly
        const data = await PatientService.getAllPatients(storedToken);
        setPatients(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching patients:', err);
        if (err.message === 'No authentication token provided') {
          setError('No se ha encontrado un token de autenticación. Por favor, inicie sesión nuevamente.');
        } else {
          setError('Error al cargar los pacientes. Por favor, intente de nuevo más tarde.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [storedToken]);

  // Filter patients based on search term
  const filteredPatients = patients.filter(
    (patient) =>
      patient.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.rut.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get current patients for pagination
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Handle patient activation/deactivation
  const togglePatientStatus = async (patientId: number, isActive: boolean) => {
    try {
      await PatientService.togglePatientStatus(token, patientId, isActive);
      
      // Update local state
      setPatients(
        patients.map((patient) =>
          patient.user.id === patientId
            ? { ...patient, user: { ...patient.user, is_active: !isActive } }
            : patient
        )
      );
      
      toast.success(`Paciente ${isActive ? 'desactivado' : 'activado'} exitosamente`);
    } catch (err) {
      console.error('Error toggling patient status:', err);
      toast.error('Error al cambiar el estado del paciente');
    }
  };

  // View patient details
  const viewPatientDetails = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPatient(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2A6877]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Gestión de Pacientes</h1>
      
      {/* Search and filters */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nombre, email o RUT..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2A6877]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
      </div>

      {/* Patients table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                RUT
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Región
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentPatients.length > 0 ? (
              currentPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
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
                  <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                    {patient.user.email}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                    {patient.rut}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                    {patient.region}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
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
                  <td className="py-4 px-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => viewPatientDetails(patient)}
                      className="text-[#2A6877] hover:text-[#1a4c5a] mr-3"
                    >
                      Ver detalles
                    </button>
                    <button
                      onClick={() => togglePatientStatus(patient.user.id, patient.user.is_active)}
                      className={`${
                        patient.user.is_active ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'
                      }`}
                    >
                      {patient.user.is_active ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-4 px-4 text-center text-gray-500">
                  No se encontraron pacientes
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredPatients.length > patientsPerPage && (
        <div className="flex justify-center mt-6">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Anterior
            </button>
            {Array.from({ length: Math.ceil(filteredPatients.length / patientsPerPage) }).map((_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                  currentPage === index + 1
                    ? 'z-10 bg-[#2A6877] border-[#2A6877] text-white'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === Math.ceil(filteredPatients.length / patientsPerPage)}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === Math.ceil(filteredPatients.length / patientsPerPage)
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Siguiente
            </button>
          </nav>
        </div>
      )}

      {/* Patient details modal */}
      {isModalOpen && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Detalles del Paciente</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col items-center">
                <img
                  src={selectedPatient.profile_image || '/default-avatar.png'}
                  alt={`${selectedPatient.user.first_name} ${selectedPatient.user.last_name}`}
                  className="h-32 w-32 rounded-full object-cover mb-4"
                />
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedPatient.user.first_name} {selectedPatient.user.last_name}
                </h3>
                <p className="text-sm text-gray-500">{selectedPatient.user.email}</p>
                <span
                  className={`mt-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    selectedPatient.user.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {selectedPatient.user.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div>
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500">Información Personal</h4>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500">RUT</p>
                      <p className="text-sm font-medium">{selectedPatient.rut || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Género</p>
                      <p className="text-sm font-medium">
                        {selectedPatient.gender === 'MALE'
                          ? 'Masculino'
                          : selectedPatient.gender === 'FEMALE'
                          ? 'Femenino'
                          : selectedPatient.gender === 'OTHER'
                          ? 'Otro'
                          : selectedPatient.gender === 'PREFER_NOT_TO_SAY'
                          ? 'Prefiere no decir'
                          : 'No especificado'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Fecha de Nacimiento</p>
                      <p className="text-sm font-medium">
                        {selectedPatient.birth_date || 'No especificado'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Teléfono</p>
                      <p className="text-sm font-medium">
                        {selectedPatient.phone_number || 'No especificado'}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Ubicación</h4>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500">Región</p>
                      <p className="text-sm font-medium">
                        {selectedPatient.region || 'No especificado'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Ciudad</p>
                      <p className="text-sm font-medium">
                        {selectedPatient.city || 'No especificado'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => togglePatientStatus(selectedPatient.user.id, selectedPatient.user.is_active)}
                className={`px-4 py-2 rounded-md text-white ${
                  selectedPatient.user.is_active
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {selectedPatient.user.is_active ? 'Desactivar Usuario' : 'Activar Usuario'}
              </button>
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientsManagement;