import { useState } from 'react';
import { CalendarIcon, AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface AppointmentFiltersProps {
  onFilterChange: (filters: FilterValues) => void;
  showStatusFilter?: boolean;
  showPsychologistFilter?: boolean;
}

export interface FilterValues {
  start_date?: string;
  end_date?: string;
  status?: string;
  psychologist_id?: number;
}

const AppointmentFilters = ({ 
  onFilterChange, 
  showStatusFilter = true}: AppointmentFiltersProps) => {
  const [filters, setFilters] = useState<FilterValues>({});
  const [isExpanded, setIsExpanded] = useState(true);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Formato especial para fechas
    if ((name === 'start_date' || name === 'end_date') && value) {
      // Mantener el formato YYYY-MM-DD sin ajustes de zona horaria
      processedValue = value; // ya está en formato correcto del input date
    }
    
    const newFilters = { 
      ...filters,
      [name]: processedValue 
    };
    
    // Si el valor está vacío, eliminarlo del objeto de filtros
    if (!processedValue) {
      delete newFilters[name as keyof FilterValues];
    }
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  // Contador de filtros activos
  const activeFiltersCount = Object.keys(filters).length;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all duration-300">
      {/* Cabecera con toggle para expandir/colapsar */}
      <div 
        className="flex items-center justify-between px-5 py-4 cursor-pointer bg-gradient-to-r from-[#2A6877]/5 to-transparent"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <AdjustmentsHorizontalIcon className="h-5 w-5 text-[#2A6877]" />
          <span className="text-lg font-medium text-gray-800">Filtros</span>
          {activeFiltersCount > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-[#2A6877] rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          {isExpanded ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
      
      {/* Contenido del filtro - visible solo si está expandido */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Fecha inicio */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-[#2A6877] transition-colors">
                Fecha inicio
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-400 group-hover:text-[#2A6877] transition-colors" />
                </div>
                <input
                  type="date"
                  name="start_date"
                  value={filters.start_date || ''}
                  onChange={handleFilterChange}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#2A6877]/20 focus:border-[#2A6877] sm:text-sm transition-all"
                />
                {filters.start_date && (
                  <button
                    onClick={() => {
                      const newFilters = {...filters};
                      delete newFilters.start_date;
                      setFilters(newFilters);
                      onFilterChange(newFilters);
                    }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Fecha fin */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-[#2A6877] transition-colors">
                Fecha fin
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-400 group-hover:text-[#2A6877] transition-colors" />
                </div>
                <input
                  type="date"
                  name="end_date"
                  value={filters.end_date || ''}
                  onChange={handleFilterChange}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#2A6877]/20 focus:border-[#2A6877] sm:text-sm transition-all"
                />
                {filters.end_date && (
                  <button
                    onClick={() => {
                      const newFilters = {...filters};
                      delete newFilters.end_date;
                      setFilters(newFilters);
                      onFilterChange(newFilters);
                    }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Filtro de estado - solo si se solicita */}
            {showStatusFilter && (
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-[#2A6877] transition-colors">
                  Estado
                </label>
                <div className="relative">
                  <select
                    name="status"
                    value={filters.status || ''}
                    onChange={handleFilterChange}
                    className="block w-full px-3 py-2.5 pr-8 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#2A6877]/20 focus:border-[#2A6877] sm:text-sm appearance-none transition-all"
                  >
                    <option value="">Todos los estados</option>
                    <option value="PAYMENT_UPLOADED">Comprobante Subido</option>
                    <option value="PAYMENT_VERIFIED">Pago Verificado</option>
                    <option value="CONFIRMED">Confirmada</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  {filters.status && (
                    <button
                      onClick={() => {
                        const newFilters = {...filters};
                        delete newFilters.status;
                        setFilters(newFilters);
                        onFilterChange(newFilters);
                      }}
                      className="absolute inset-y-0 right-0 pr-8 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Resumen de filtros activos y botón para limpiar */}
          <div className="mt-5 flex flex-wrap items-center justify-between">
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
              {activeFiltersCount > 0 ? (
                <>
                  <span>Filtros activos:</span>
                  {filters.start_date && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#2A6877]/10 text-[#2A6877]">
                      Desde: {filters.start_date}
                    </span>
                  )}
                  {filters.end_date && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#2A6877]/10 text-[#2A6877]">
                      Hasta: {filters.end_date}
                    </span>
                  )}
                  {filters.status && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#2A6877]/10 text-[#2A6877]">
                      Estado: {filters.status === 'PAYMENT_UPLOADED' ? 'Comprobante Subido' : 
                              filters.status === 'PAYMENT_VERIFIED' ? 'Pago Verificado' : 
                              filters.status === 'CONFIRMED' ? 'Confirmada' : filters.status}
                    </span>
                  )}
                </>
              ) : (
                <span>Sin filtros activos</span>
              )}
            </div>
            
            <button
              onClick={clearFilters}
              disabled={activeFiltersCount === 0}
              className={`mt-3 sm:mt-0 px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A6877] transition-all ${
                activeFiltersCount > 0
                  ? 'text-white bg-[#2A6877] hover:bg-[#235A68] shadow-sm'
                  : 'text-gray-500 bg-gray-100 cursor-not-allowed opacity-60'
              }`}
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentFilters;