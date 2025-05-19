import { FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { FilterOptions } from '../../types/patients';

interface PatientListFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filters: FilterOptions;
  setFilters: (filters: React.SetStateAction<FilterOptions>) => void;
  totalPatients: number;
  filteredCount: number;
  resetFilters: () => void;
}

const PatientListFilters = ({
  searchTerm,
  setSearchTerm,
  filters,
  setFilters,
  totalPatients,
  filteredCount,
  resetFilters
}: PatientListFiltersProps) => {
  return (
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
              setFilters(prev => ({
                ...prev,
                hasNextAppointment: e.target.value === 'all' ? null : e.target.value === 'upcoming'
              }));
            }}
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2A6877] focus:border-transparent rounded-md appearance-none bg-white text-sm"
          >
            <option value="all">Todos los pacientes</option>
            <option value="upcoming">Con próxima cita</option>
            <option value="none">Sin cita programada</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              setFilters(prev => ({...prev, sortBy: sortBy as any, sortOrder: sortOrder as any}));
            }}
            className="block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2A6877] focus:border-transparent rounded-md appearance-none bg-white text-sm"
          >
            <option value="nextAppointment-asc">Próxima cita (más cercana)</option>
            <option value="name-asc">Nombre (A-Z)</option>
            <option value="name-desc">Nombre (Z-A)</option>
            <option value="appointments-desc">Mayor número de citas</option>
            <option value="appointments-asc">Menor número de citas</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>
          {filteredCount} {filteredCount === 1 ? 'paciente' : 'pacientes'} 
          {filteredCount !== totalPatients && ` de ${totalPatients} total`}
        </span>
        
        {(searchTerm || filters.hasNextAppointment !== null || filters.sortBy !== 'nextAppointment' || filters.sortOrder !== 'asc') && (
          <button 
            onClick={resetFilters}
            className="text-[#2A6877] hover:text-[#1d4e5f] text-xs font-medium"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
};

export default PatientListFilters; 