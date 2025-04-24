import { useState } from 'react';
import { CalendarIcon } from '@heroicons/react/24/outline';

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
  showStatusFilter = true,
  showPsychologistFilter = false 
}: AppointmentFiltersProps) => {
  const [filters, setFilters] = useState<FilterValues>({});

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFilters = { 
      ...filters,
      [name]: value 
    };
    
    // Si el valor está vacío, eliminarlo del objeto de filtros
    if (!value) {
      delete newFilters[name as keyof FilterValues];
    }
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <div className="text-lg font-medium text-gray-800 mb-3">Filtros</div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Fecha inicio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha inicio
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              name="start_date"
              value={filters.start_date || ''}
              onChange={handleFilterChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#2A6877] focus:border-[#2A6877] sm:text-sm"
            />
          </div>
        </div>

        {/* Fecha fin */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha fin
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              name="end_date"
              value={filters.end_date || ''}
              onChange={handleFilterChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#2A6877] focus:border-[#2A6877] sm:text-sm"
            />
          </div>
        </div>

        {/* Filtro de estado - solo si se solicita */}
        {showStatusFilter && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              name="status"
              value={filters.status || ''}
              onChange={handleFilterChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#2A6877] focus:border-[#2A6877] sm:text-sm"
            >
              <option value="">Todos los estados</option>
              <option value="PAYMENT_UPLOADED">Comprobante Subido</option>
              <option value="PAYMENT_VERIFIED">Pago Verificado</option>
              <option value="CONFIRMED">Confirmada</option>
            </select>
          </div>
        )}
      </div>

      {/* Botón para limpiar filtros */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={clearFilters}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A6877]"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
};

export default AppointmentFilters; 