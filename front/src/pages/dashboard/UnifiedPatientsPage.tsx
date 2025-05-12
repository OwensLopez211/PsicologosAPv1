import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import toastService from '../../services/toastService';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { Patient, FilterOptions } from '../../types/patients';
import PatientListFilters from '../../components/patients/PatientListFilters';
import PatientList from '../../components/patients/PatientList';
import { usePatients } from '../../hooks/usePatients';

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

const UnifiedPatientsPage = () => {
  const { user, token } = useAuth();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // 300ms debounce
  const [filters, setFilters] = useState<FilterOptions>({
    hasNextAppointment: null,
    sortBy: 'nextAppointment',
    sortOrder: 'asc'
  });
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Determinar el tipo de usuario
  const userType = user?.user_type || 'client';
  const isAdmin = userType === 'admin';
  
  // Para debugging
  console.log('UnifiedPatientsPage rendering', { userType, token: !!token, path: location.pathname });

  // Obtener pacientes usando el hook unificado
  const { patients, loading, error, refetch } = usePatients({ 
    userType,
    useMocks: import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS === 'true'
  });
  
  // Marcar cuando la carga inicial esté completa
  useEffect(() => {
    if (!loading && !initialLoadComplete) {
      setInitialLoadComplete(true);
    }
  }, [loading, initialLoadComplete]);
  
  // Al montar el componente, verificar si tenemos el token y cargar los datos
  useEffect(() => {
    if (token && !initialLoadComplete) {
      console.log('Initial page load - fetching patients data');
      refetch();
    }
  }, [token, initialLoadComplete, refetch]);

  // Escuchar eventos de recarga
  useEffect(() => {
    const handleDataRefresh = (event: CustomEvent) => {
      if (event.detail && event.detail.module === 'patients') {
        console.log('Refresh event received - reloading patients');
        // Añadir notificación visual del proceso de recarga
        toastService.info('Actualizando lista de pacientes...');
        refetch();
      }
    };

    // Asegurarse de que el tipo de evento es correcto
    window.addEventListener('refreshData', handleDataRefresh as EventListener);
    
    // Si tenemos token al montar el componente, cargar datos inmediatamente
    if (token) {
      console.log('Component mounted with valid token - loading patients');
      refetch();
    }
    
    return () => {
      window.removeEventListener('refreshData', handleDataRefresh as EventListener);
    };
  }, [refetch, token]);

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
  
  // Función para manejar la actualización manual
  const handleRefresh = useCallback(() => {
    toastService.info('Actualizando lista de pacientes...');
    refetch();
  }, [refetch]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#2A6877]">
          {isAdmin ? 'Pacientes' : 'Mis Pacientes'}
        </h1>
        
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-[#2A6877] hover:bg-[#2A6877]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A6877] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowPathIcon className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-700" role="alert">
          <p className="font-medium">Error al cargar pacientes</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-md text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          error={error}
        />
      </div>
    </div>
  );
};

export default UnifiedPatientsPage; 