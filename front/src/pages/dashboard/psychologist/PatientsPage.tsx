import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import toastService from '../../../services/toastService';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { Patient, FilterOptions } from '../../../types/patients';
import PatientListFilters from '../../../components/patients/PatientListFilters';
import PatientList from '../../../components/patients/PatientList';

// Función para debouncing
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};

const PatientsPage = () => {
  const { user, token } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // 300ms debounce
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    hasNextAppointment: null,
    sortBy: 'nextAppointment',
    sortOrder: 'asc'
  });

  // Función para cargar los pacientes
  const fetchPatients = useCallback(async () => {
    if (!user || user.user_type !== 'psychologist' || !token) return;
    
    setLoading(true);
    setError(null);
    
    // En modo desarrollo, podemos cargar siempre los datos de ejemplo
    if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS === 'true') {
      loadMockPatients();
      return;
    }
    
    // Evitar cargar datos nuevamente si ya tenemos pacientes y no han pasado 5 minutos desde la última carga
    const lastLoadTime = sessionStorage.getItem('patientsLastLoadTime');
    const cachedPatients = sessionStorage.getItem('cachedPatients');
    const now = Date.now();
    const fiveMinutesMs = 5 * 60 * 1000;
    
    if (lastLoadTime && cachedPatients && now - parseInt(lastLoadTime) < fiveMinutesMs) {
      try {
        const parsedPatients = JSON.parse(cachedPatients);
        setPatients(parsedPatients);
        setLoading(false);
        return;
      } catch (err) {
        console.warn('Error al cargar datos de caché:', err);
        // Si hay error al parsear, continuamos con la carga normal
      }
    }
    
    try {
      // URL del backend
      const backendUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:8000/api' 
        : 'https://186.64.113.186/api';
      
      const endpoint = `${backendUrl}/appointments/psychologist_patients/`;
      
      if (!token || token.trim() === '') {
        throw new Error('Token de autenticación no disponible');
      }
      
      // Usar AbortController para cancelar la solicitud si tarda demasiado
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al cargar los datos (${response.status}): ${errorText || 'Sin detalles'}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Formato de datos inválido: se esperaba un array');
      }
      
      // Guardar en sessionStorage para caché
      sessionStorage.setItem('cachedPatients', JSON.stringify(data));
      sessionStorage.setItem('patientsLastLoadTime', now.toString());
      
      setPatients(data);
      toastService.success(`${data.length} pacientes cargados`);
    } catch (err) {
      console.error('Error al cargar pacientes:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      toastService.error(`No se pudieron cargar los pacientes: ${errorMessage.slice(0, 100)}${errorMessage.length > 100 ? '...' : ''}`);
      
      if (import.meta.env.DEV) {
        loadMockPatients();
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id, token]);

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

  // Función memoizada para filtrar por búsqueda
  const filteredBySearchPatients = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return patients;
    
    const searchLower = debouncedSearchTerm.toLowerCase();
    return patients.filter(
      (patient) =>
        patient.user.first_name?.toLowerCase().includes(searchLower) ||
        patient.user.last_name?.toLowerCase().includes(searchLower) ||
        patient.user.email?.toLowerCase().includes(searchLower) ||
        (patient.rut && patient.rut.toLowerCase().includes(searchLower))
    );
  }, [patients, debouncedSearchTerm]);

  // Función memoizada para aplicar filtros
  const filteredPatients = useMemo(() => {
    if (filters.hasNextAppointment === null) return filteredBySearchPatients;
    
    return filteredBySearchPatients.filter((patient) => 
      Boolean(patient.next_appointment_date) === filters.hasNextAppointment
    );
  }, [filteredBySearchPatients, filters.hasNextAppointment]);

  // Función memoizada para ordenar
  const filteredAndSortedPatients = useMemo(() => {
    // Crea una copia para no modificar el array original
    const sorted = [...filteredPatients];
    
    const sortFunctions = {
      name: (a: Patient, b: Patient) => `${a.user.first_name} ${a.user.last_name}`.localeCompare(`${b.user.first_name} ${b.user.last_name}`),
      appointments: (a: Patient, b: Patient) => a.total_appointments - b.total_appointments,
      nextAppointment: (a: Patient, b: Patient) => {
        // Si ambos tienen próxima cita, ordenar por fecha
        if (a.next_appointment_date && b.next_appointment_date) {
          return new Date(a.next_appointment_date).getTime() - new Date(b.next_appointment_date).getTime();
        } else if (a.next_appointment_date) {
          return -1; // a tiene próxima cita, b no
        } else if (b.next_appointment_date) {
          return 1; // b tiene próxima cita, a no
        }
        return 0;
      }
    };
    
    // Ordenar usando la función apropiada
    sorted.sort((a, b) => {
      const comparison = sortFunctions[filters.sortBy](a, b);
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  }, [filteredPatients, filters.sortBy, filters.sortOrder]);

  // Resetear filtros
  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setFilters({
      hasNextAppointment: null,
      sortBy: 'nextAppointment',
      sortOrder: 'asc'
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#2A6877]">Mis Pacientes</h1>
        
        <button
          onClick={fetchPatients}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-[#2A6877] hover:bg-[#2A6877]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A6877]"
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
          >
            Reintentar
          </button>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        {/* Filtros y buscador */}
        <PatientListFilters 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filters={filters}
          setFilters={setFilters}
          totalPatients={patients.length}
          filteredCount={filteredAndSortedPatients.length}
          resetFilters={resetFilters}
        />
        
        {/* Lista de pacientes */}
        <PatientList 
          patients={filteredAndSortedPatients} 
          loading={loading} 
          searchTerm={debouncedSearchTerm}
        />
      </div>
    </div>
  );
};

export default PatientsPage; 