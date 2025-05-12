import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import toastService from '../../../services/toastService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FunnelIcon, MagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

// Interfaces para los datos
interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
}

interface Patient {
  id: number;
  user: User;
  profile_image?: string | null;
  rut?: string;
  region?: string;
  last_appointment_date?: string | null;
  last_appointment_status?: string | null;
  next_appointment_date?: string | null;
  next_appointment_status?: string | null;
  total_appointments: number;
}

// Filtros para la lista de pacientes
interface FilterOptions {
  hasNextAppointment: boolean | null;
  sortBy: 'name' | 'appointments' | 'nextAppointment';
  sortOrder: 'asc' | 'desc';
}

const PatientsPage = () => {
  const { user, token } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    hasNextAppointment: null,
    sortBy: 'nextAppointment',
    sortOrder: 'asc'
  });

  // Función para cargar los pacientes
  const fetchPatients = useCallback(async () => {
    if (!user || user.user_type !== 'psychologist' || !token) {
      return;
    }
    
    setLoading(true);
    setError(null);
    toastService.loading('Cargando pacientes...');
    
    // En modo desarrollo, podemos cargar siempre los datos de ejemplo
    if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS === 'true') {
      console.log('Cargando datos de ejemplo para desarrollo (forzado)...');
      loadMockPatients();
      return;
    }
    
    try {
      // URL del backend - usamos una URL fija para mayor confiabilidad
      const backendUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:8000/api' 
        : 'https://186.64.113.186/api';
      
      // Endpoint que sabemos que funciona correctamente
      const endpoint = `${backendUrl}/appointments/psychologist_patients/`;
      
      // Verificar que el token sea válido
      if (!token || token.trim() === '') {
        throw new Error('Token de autenticación no disponible o vacío');
      }
      
      // Headers para la solicitud
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      // Realizar la solicitud
      const response = await fetch(endpoint, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al cargar los datos (${response.status}): ${errorText || 'Sin detalles'}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Formato de datos inválido: se esperaba un array');
      }
      
      setPatients(data); // Guardamos los datos sin ordenar para aplicar filtros después
      toastService.success(`${data.length} pacientes cargados correctamente`);
    } catch (err) {
      console.error('Error al cargar pacientes:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      toastService.error(`No se pudieron cargar los pacientes: ${errorMessage}`);
      
      // Si no hay datos y estamos en desarrollo, mostrar ejemplos
      if (import.meta.env.DEV) {
        console.log('Cargando datos de ejemplo para desarrollo...');
        loadMockPatients();
      }
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  // Función para cargar datos mock
  const loadMockPatients = () => {
    const mockPatients: Patient[] = [
      {
        id: 1,
        user: {
          id: 101,
          first_name: 'María',
          last_name: 'González',
          email: 'maria.gonzalez@example.com',
          is_active: true
        },
        profile_image: '/default-avatar.png',
        rut: '12.345.678-9',
        region: 'Metropolitana',
        last_appointment_date: '2024-05-05',
        last_appointment_status: 'COMPLETED',
        next_appointment_date: '2024-05-20',
        next_appointment_status: 'CONFIRMED',
        total_appointments: 5
      },
      {
        id: 2,
        user: {
          id: 102,
          first_name: 'Juan',
          last_name: 'Pérez',
          email: 'juan.perez@example.com',
          is_active: true
        },
        profile_image: null,
        rut: '9.876.543-2',
        region: 'Valparaíso',
        last_appointment_date: '2024-04-28',
        last_appointment_status: 'COMPLETED',
        next_appointment_date: null,
        next_appointment_status: null,
        total_appointments: 3
      },
      {
        id: 3,
        user: {
          id: 103,
          first_name: 'Ana',
          last_name: 'Martínez',
          email: 'ana.martinez@example.com',
          is_active: true
        },
        profile_image: null,
        rut: '15.432.987-6',
        region: 'Biobío',
        last_appointment_date: null,
        last_appointment_status: null,
        next_appointment_date: '2024-05-15',
        next_appointment_status: 'PAYMENT_VERIFIED',
        total_appointments: 1
      },
      {
        id: 4,
        user: {
          id: 104,
          first_name: 'Carlos',
          last_name: 'Rodríguez',
          email: 'carlos.rodriguez@example.com',
          is_active: true
        },
        profile_image: null,
        rut: '18.765.432-1',
        region: 'Metropolitana',
        last_appointment_date: '2024-05-12',
        last_appointment_status: 'CANCELLED',
        next_appointment_date: '2024-06-02',
        next_appointment_status: 'PENDING_PAYMENT',
        total_appointments: 8
      },
      {
        id: 5,
        user: {
          id: 105,
          first_name: 'Laura',
          last_name: 'Sánchez',
          email: 'laura.sanchez@example.com',
          is_active: true
        },
        profile_image: null,
        rut: '22.345.678-5',
        region: 'O\'Higgins',
        last_appointment_date: '2024-05-10',
        last_appointment_status: 'NO_SHOW',
        next_appointment_date: '2024-05-24',
        next_appointment_status: 'PAYMENT_UPLOADED',
        total_appointments: 2
      },
      {
        id: 6,
        user: {
          id: 106,
          first_name: 'Diego',
          last_name: 'Muñoz',
          email: 'diego.munoz@example.com',
          is_active: true
        },
        profile_image: null,
        rut: '17.234.567-8',
        region: 'Maule',
        last_appointment_date: '2024-05-08',
        last_appointment_status: 'COMPLETED',
        next_appointment_date: '2024-05-29',
        next_appointment_status: 'CONFIRMED',
        total_appointments: 4
      }
    ];
    setPatients(mockPatients);
    toastService.success('Datos de ejemplo cargados (modo desarrollo)');
    setLoading(false);
  };

  // Cargar pacientes al montar el componente
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Aplicar filtros y búsqueda a los pacientes
  const filteredAndSortedPatients = useMemo(() => {
    // Primero aplicamos el filtro de búsqueda
    let result = patients.filter(
      (patient) =>
        patient.user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.rut && patient.rut.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    // Luego aplicamos el filtro de próxima cita
    if (filters.hasNextAppointment !== null) {
      result = result.filter((patient) => 
        Boolean(patient.next_appointment_date) === filters.hasNextAppointment
      );
    }
    
    // Finalmente aplicamos el ordenamiento
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'name':
          comparison = `${a.user.first_name} ${a.user.last_name}`.localeCompare(
            `${b.user.first_name} ${b.user.last_name}`
          );
          break;
        case 'appointments':
          comparison = a.total_appointments - b.total_appointments;
          break;
        case 'nextAppointment':
          // Si ambos tienen próxima cita, ordenar por fecha
          if (a.next_appointment_date && b.next_appointment_date) {
            comparison = new Date(a.next_appointment_date).getTime() - new Date(b.next_appointment_date).getTime();
          } else if (a.next_appointment_date) {
            return -1; // a tiene próxima cita, b no
          } else if (b.next_appointment_date) {
            return 1; // b tiene próxima cita, a no
          }
          break;
      }
      
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return result;
  }, [patients, searchTerm, filters]);

  // Función para obtener las iniciales de un nombre
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Función para obtener el color de fondo para las iniciales
  const getInitialsBackgroundColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 
      'bg-red-500', 'bg-teal-500'
    ];
    // Generar un índice basado en el nombre
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  // Función para obtener el color del badge según el estado de la cita
  const getAppointmentStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING_PAYMENT':
        return 'bg-yellow-100 text-yellow-800';
      case 'PAYMENT_UPLOADED':
        return 'bg-blue-100 text-blue-800';
      case 'PAYMENT_VERIFIED':
        return 'bg-indigo-100 text-indigo-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-purple-100 text-purple-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'NO_SHOW':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-500';
    }
  };

  // Función para obtener el texto a mostrar para el estado de la cita
  const getAppointmentStatusText = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING_PAYMENT':
        return 'Pago pendiente';
      case 'PAYMENT_UPLOADED':
        return 'Pago subido';
      case 'PAYMENT_VERIFIED':
        return 'Pago verificado';
      case 'CONFIRMED':
        return 'Confirmada';
      case 'COMPLETED':
        return 'Completada';
      case 'CANCELLED':
        return 'Cancelada';
      case 'NO_SHOW':
        return 'No asistió';
      default:
        return status || 'Desconocido';
    }
  };

  // Formatear fecha para mostrar
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'No hay cita programada';
    try {
      const date = new Date(dateString);
      return format(date, "d 'de' MMMM, yyyy", { locale: es });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Resetear filtros
  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      hasNextAppointment: null,
      sortBy: 'nextAppointment',
      sortOrder: 'asc'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#2A6877]">Mis Pacientes</h1>
        
        <button
          onClick={fetchPatients}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-[#2A6877] hover:bg-[#2A6877]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A6877]"
          aria-label="Actualizar lista de pacientes"
        >
          <ArrowPathIcon className="h-4 w-4 mr-1" />
          Actualizar
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-700" role="alert">
          <p className="font-medium">Error al cargar pacientes</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={fetchPatients}
            className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-md text-sm transition-colors"
            aria-label="Reintentar carga de pacientes"
          >
            Reintentar
          </button>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        {/* Filtros y buscador */}
        <div className="mb-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-800">Filtros</h2>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Buscador */}
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2A6877] focus:border-transparent"
                placeholder="Buscar por nombre, email o RUT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Buscar pacientes"
              />
            </div>

            {/* Filtro por próxima cita */}
            <div className="relative min-w-[180px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FunnelIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <select 
                value={filters.hasNextAppointment === null ? 'all' : filters.hasNextAppointment ? 'upcoming' : 'none'}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters(prev => ({
                    ...prev,
                    hasNextAppointment: value === 'all' ? null : value === 'upcoming'
                  }));
                }}
                className="block w-full pl-10 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2A6877] focus:border-transparent rounded-md appearance-none bg-white text-sm"
                aria-label="Filtrar por próxima cita"
              >
                <option value="all">Todos los pacientes</option>
                <option value="upcoming">Con próxima cita</option>
                <option value="none">Sin cita programada</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Ordenamiento */}
            <div className="relative min-w-[180px]">
              <select 
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  setFilters(prev => ({
                    ...prev,
                    sortBy: sortBy as any,
                    sortOrder: sortOrder as any
                  }));
                }}
                className="block w-full px-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2A6877] focus:border-transparent rounded-md appearance-none bg-white text-sm"
                aria-label="Ordenar pacientes"
              >
                <option value="nextAppointment-asc">Próxima cita (más cercana)</option>
                <option value="name-asc">Nombre (A-Z)</option>
                <option value="name-desc">Nombre (Z-A)</option>
                <option value="appointments-desc">Mayor número de citas</option>
                <option value="appointments-asc">Menor número de citas</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>
              {filteredAndSortedPatients.length} {filteredAndSortedPatients.length === 1 ? 'paciente' : 'pacientes'} encontrados
              {filteredAndSortedPatients.length !== patients.length && ` de ${patients.length} total`}
            </span>
            
            {(searchTerm || filters.hasNextAppointment !== null || filters.sortBy !== 'nextAppointment' || filters.sortOrder !== 'asc') && (
              <button 
                onClick={resetFilters}
                className="text-[#2A6877] hover:text-[#1d4e5f] text-xs font-medium"
                aria-label="Limpiar filtros"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Estado de carga */}
        {loading && (
          <div className="flex justify-center items-center h-32" aria-live="polite" aria-busy="true">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#2A6877]"></div>
            <span className="sr-only">Cargando...</span>
          </div>
        )}

        {/* Vista móvil: tarjetas de pacientes */}
        {!loading && (
          <div className="grid grid-cols-1 gap-4 sm:hidden">
            {filteredAndSortedPatients.length > 0 ? (
              filteredAndSortedPatients.map((patient) => (
                <div key={patient.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center mb-3">
                    <div className="h-12 w-12 flex-shrink-0">
                      {patient.profile_image ? (
                        <img
                          className="h-12 w-12 rounded-full object-cover"
                          src={patient.profile_image}
                          alt={`Foto de perfil de ${patient.user.first_name} ${patient.user.last_name}`}
                          loading="lazy"
                        />
                      ) : (
                        <div 
                          className={`h-12 w-12 rounded-full flex items-center justify-center text-white ${getInitialsBackgroundColor(`${patient.user.first_name} ${patient.user.last_name}`)}`}
                          aria-label={`Iniciales de ${patient.user.first_name} ${patient.user.last_name}`}
                        >
                          {getInitials(patient.user.first_name, patient.user.last_name)}
                        </div>
                      )}
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
                        {patient.last_appointment_date && patient.last_appointment_status && (
                          <span className={`mt-1 px-2 py-0.5 inline-flex text-xs leading-4 rounded-full ${getAppointmentStatusColor(patient.last_appointment_status)}`}>
                            {getAppointmentStatusText(patient.last_appointment_status)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 flex">
                      <span className="font-medium w-28">Próxima cita:</span>
                      <div className="flex flex-col">
                        <span className={patient.next_appointment_date ? "text-[#2A6877]" : ""}>
                          {formatDate(patient.next_appointment_date)}
                        </span>
                        {patient.next_appointment_date && patient.next_appointment_status && (
                          <span className={`mt-1 px-2 py-0.5 inline-flex text-xs leading-4 rounded-full ${getAppointmentStatusColor(patient.next_appointment_status)}`}>
                            {getAppointmentStatusText(patient.next_appointment_status)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 flex">
                      <span className="font-medium w-28">Total de citas:</span>
                      <span>{patient.total_appointments}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500" aria-live="polite">
                {searchTerm ? 
                  `No se encontraron pacientes que coincidan con "${searchTerm}"` : 
                  "No se encontraron pacientes"}
              </div>
            )}
          </div>
        )}

        {/* Vista desktop: tabla */}
        {!loading && (
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
                {filteredAndSortedPatients.length > 0 ? (
                  filteredAndSortedPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {patient.profile_image ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={patient.profile_image}
                                alt={`Foto de perfil de ${patient.user.first_name} ${patient.user.last_name}`}
                                loading="lazy"
                              />
                            ) : (
                              <div 
                                className={`h-10 w-10 rounded-full flex items-center justify-center text-white ${getInitialsBackgroundColor(`${patient.user.first_name} ${patient.user.last_name}`)}`}
                                aria-label={`Iniciales de ${patient.user.first_name} ${patient.user.last_name}`}
                              >
                                {getInitials(patient.user.first_name, patient.user.last_name)}
                              </div>
                            )}
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
                          {patient.last_appointment_date && patient.last_appointment_status && (
                            <span className={`px-2 py-0.5 inline-flex text-xs leading-4 rounded-full ${getAppointmentStatusColor(patient.last_appointment_status)}`}>
                              {getAppointmentStatusText(patient.last_appointment_status)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col space-y-1">
                          <span className={patient.next_appointment_date ? "text-[#2A6877]" : "text-gray-500"}>
                            {formatDate(patient.next_appointment_date)}
                          </span>
                          {patient.next_appointment_date && patient.next_appointment_status && (
                            <span className={`px-2 py-0.5 inline-flex text-xs leading-4 rounded-full ${getAppointmentStatusColor(patient.next_appointment_status)}`}>
                              {getAppointmentStatusText(patient.next_appointment_status)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {patient.total_appointments}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                      {searchTerm ? 
                        `No se encontraron pacientes que coincidan con "${searchTerm}"` : 
                        "No se encontraron pacientes"}
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