import { useState, useEffect } from 'react';
// Remove unused import since useAuth is not being used
import { toast } from 'react-hot-toast';
import PatientService, { Patient } from '../../../services/PatientService';
import { motion } from 'framer-motion';

// Importar íconos
import {
  MagnifyingGlassIcon,
  UserCircleIcon,
  IdentificationIcon,
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTopRightOnSquareIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

// Animaciones
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4 }
  }
};

const PatientsManagement = () => {
  // Get token directly from localStorage
  const storedToken = localStorage.getItem('token');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(10);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        // Use the token from localStorage directly
        const data = await PatientService.getAllPatients(storedToken);
        
        // Filter to only include client users
        const clientPatients = data.filter(patient => 
          patient.user.user_type === 'client' || !patient.user.user_type
        );
        
        setPatients(clientPatients);
        setError(null);
      } catch (err) {
        console.error('Error fetching patients:', err);
        if (err instanceof Error && err.message === 'No authentication token provided') {
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

  // Filter patients based on search term and status
  const filteredPatients = patients.filter(
    (patient) => {
      const matchesSearch = 
        patient.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.rut && patient.rut.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'active' && patient.user.is_active) || 
        (statusFilter === 'inactive' && !patient.user.is_active);
      
      return matchesSearch && matchesStatus;
    }
  );

  // Get current patients for pagination
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Handle patient activation/deactivation
  const togglePatientStatus = async (patientId: number, isActive: boolean) => {
    try {
      await PatientService.togglePatientStatus(storedToken, patientId);
      
      // Update local state
      setPatients(
        patients.map((patient) =>
          patient.user.id === patientId
            ? { ...patient, user: { ...patient.user, is_active: !isActive } }
            : patient
        )
      );
      
      toast.success(`Paciente ${isActive ? 'desactivado' : 'activado'} exitosamente`);
      
      // Update selected patient if it's the same one
      if (selectedPatient && selectedPatient.user.id === patientId) {
        setSelectedPatient({
          ...selectedPatient,
          user: { ...selectedPatient.user, is_active: !isActive }
        });
      }
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

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2A6877]"></div>
      </div>
    );
  }

  return (
    <motion.div 
      className="container mx-auto px-0 sm:px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Cabecera */}
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.h1 
          className="text-2xl md:text-3xl font-bold text-[#2A6877] mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          Gestión de Pacientes
        </motion.h1>
      </motion.div>

      {/* Contenedor principal */}
      <motion.div 
        className="bg-white rounded-xl shadow-lg overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        {/* Sección de búsqueda y filtros */}
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre, email o RUT..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2A6877] focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative min-w-[180px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="block w-full pl-10 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2A6877] focus:border-transparent rounded-lg appearance-none bg-white text-sm"
              >
                <option value="all">Todos los pacientes</option>
                <option value="active">Pacientes activos</option>
                <option value="inactive">Pacientes inactivos</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="mt-2 text-xs text-gray-500 flex justify-between items-center">
            <span>{filteredPatients.length} {filteredPatients.length === 1 ? 'paciente' : 'pacientes'} encontrados</span>
            {(searchTerm || statusFilter !== 'all') && (
              <button 
                onClick={resetFilters}
                className="text-[#2A6877] hover:text-[#1d4e5f] text-xs font-medium"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Error state */}
        {error ? (
          <motion.div 
            className="p-6 bg-red-50"
            variants={itemVariants}
          >
            <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <XCircleIcon className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Lista de pacientes en cuadrícula */}
            {currentPatients.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4 sm:p-6">
                {currentPatients.map((patient) => (
                  <motion.div
                    key={patient.id}
                    className="relative bg-white rounded-lg shadow border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                    variants={itemVariants}
                  >
                    <div className="p-4 sm:p-5">
                      <div className="flex items-start space-x-4">
                        <div className="relative">
                          {patient.profile_image ? (
                            <img
                              src={patient.profile_image}
                              alt={`${patient.user.first_name} ${patient.user.last_name}`}
                              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-[#2A6877]"
                            />
                          ) : (
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-200 flex items-center justify-center border-2 border-[#2A6877]">
                              <UserCircleIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                            </div>
                          )}
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${patient.user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-800 truncate">
                            {patient.user.first_name} {patient.user.last_name}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">{patient.user.email}</p>
                          <div className="mt-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              patient.user.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {patient.user.is_active 
                                ? <CheckCircleIcon className="w-3 h-3 mr-1" /> 
                                : <XCircleIcon className="w-3 h-3 mr-1" />
                              }
                              {patient.user.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <IdentificationIcon className="w-4 h-4 mr-2 text-[#2A6877]" />
                          <span className="font-medium mr-1">RUT:</span>
                          <span className="truncate">{patient.rut || 'No especificado'}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPinIcon className="w-4 h-4 mr-2 text-[#2A6877]" />
                          <span className="font-medium mr-1">Región:</span>
                          <span className="truncate">{patient.region || 'No especificado'}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <PhoneIcon className="w-4 h-4 mr-2 text-[#2A6877]" />
                          <span className="font-medium mr-1">Teléfono:</span>
                          <span className="truncate">{patient.phone_number || 'No especificado'}</span>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-between items-center">
                        <button
                          onClick={() => togglePatientStatus(patient.user.id, patient.user.is_active)}
                          className={`px-3 py-1.5 rounded text-xs font-medium ${
                            patient.user.is_active
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-green-50 text-green-600 hover:bg-green-100'
                          }`}
                        >
                          {patient.user.is_active ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          onClick={() => viewPatientDetails(patient)}
                          className="text-[#2A6877] flex items-center text-sm font-medium hover:text-[#1d4e5f]"
                        >
                          Ver detalles
                          <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <UserCircleIcon className="mx-auto h-16 w-16 text-gray-300" />
                <p className="mt-4 text-gray-500">No se encontraron pacientes que coincidan con los criterios de búsqueda</p>
                <button 
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 bg-[#2A6877] text-white text-sm rounded-md hover:bg-[#1d4e5f] transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            )}

            {/* Paginación */}
            {filteredPatients.length > patientsPerPage && (
              <div className="px-4 py-4 border-t border-gray-100 flex justify-center">
                <nav className="flex items-center space-x-1">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-md ${
                      currentPage === 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  
                  {Array.from({ length: totalPages }).map((_, index) => {
                    // Mostrar siempre la primera y última página
                    // Para páginas intermedias, mostrar la página actual y adyacentes
                    const pageNumber = index + 1;
                    const isFirstPage = pageNumber === 1;
                    const isLastPage = pageNumber === totalPages;
                    const isCurrentPage = pageNumber === currentPage;
                    const isAdjacentPage = Math.abs(pageNumber - currentPage) <= 1;
                    
                    if (isFirstPage || isLastPage || isCurrentPage || isAdjacentPage) {
                      return (
                        <button
                          key={index}
                          onClick={() => paginate(pageNumber)}
                          className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium ${
                            currentPage === pageNumber
                              ? 'bg-[#2A6877] text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    } else if (
                      (pageNumber === currentPage - 2 && currentPage > 3) ||
                      (pageNumber === currentPage + 2 && currentPage < totalPages - 2)
                    ) {
                      return (
                        <span key={index} className="text-gray-400">
                          ...
                        </span>
                      );
                    }
                    
                    return null;
                  })}
                  
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-md ${
                      currentPage === totalPages
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Modal de detalles del paciente */}
      {isModalOpen && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl m-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Detalles del Paciente</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col items-center">
                <div className="relative">
                  {selectedPatient.profile_image ? (
                    <img
                      src={selectedPatient.profile_image}
                      alt={`${selectedPatient.user.first_name} ${selectedPatient.user.last_name}`}
                      className="h-32 w-32 rounded-full object-cover border-4 border-[#2A6877]/20"
                    />
                  ) : (
                    <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-[#2A6877]/20">
                      <UserCircleIcon className="h-24 w-24 text-gray-400" />
                    </div>
                  )}
                  <div className={`absolute bottom-0 right-0 w-8 h-8 rounded-full border-4 border-white ${selectedPatient.user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
                
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  {selectedPatient.user.first_name} {selectedPatient.user.last_name}
                </h3>
                <p className="text-sm text-gray-500">{selectedPatient.user.email}</p>
                <span
                  className={`mt-2 px-2.5 py-1 inline-flex items-center text-sm font-medium rounded-full ${
                    selectedPatient.user.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {selectedPatient.user.is_active ? 
                    <><CheckCircleIcon className="w-4 h-4 mr-1" /> Activo</> : 
                    <><XCircleIcon className="w-4 h-4 mr-1" /> Inactivo</>
                  }
                </span>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3 pb-1 border-b border-gray-100">Información Personal</h4>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4">
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
                  <h4 className="text-sm font-medium text-gray-500 mb-3 pb-1 border-b border-gray-100">Ubicación</h4>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4">
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
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3 pb-1 border-b border-gray-100">Información del Perfil</h4>
                  <div>
                    <p className="text-xs text-gray-500">Fecha de Registro</p>
                    <p className="text-sm font-medium">
                      {new Date(selectedPatient.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end space-x-3">
              <button
                onClick={() => togglePatientStatus(selectedPatient.user.id, selectedPatient.user.is_active)}
                className={`px-4 py-2 rounded-md text-white ${
                  selectedPatient.user.is_active
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                } transition-colors`}
              >
                {selectedPatient.user.is_active ? 'Desactivar Usuario' : 'Activar Usuario'}
              </button>
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-800 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default PatientsManagement;