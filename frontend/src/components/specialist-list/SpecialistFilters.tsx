import { FC, useState } from 'react';

interface FilterOption {
  id: string;
  label: string;
  value: string;
}

interface SpecialistFiltersProps {
  totalSpecialists: number;
  onFilterChange: (type: string, value: string) => void;
  initialFilters?: {
    specialty?: string;
    sort?: string;
    availability?: string;
    gender?: string;
  };
}

const specialtyOptions: FilterOption[] = [
  { id: 'all-specialties', label: 'Todas las especialidades', value: '' },
  { id: 'individual', label: 'Terapia Individual', value: 'Terapia Individual' },
  { id: 'family', label: 'Terapia Familiar', value: 'Terapia Familiar' },
  { id: 'children', label: 'Terapia Infantil', value: 'Terapia Infantil' },
  { id: 'anxiety', label: 'Ansiedad', value: 'Ansiedad' },
  { id: 'depression', label: 'Depresión', value: 'Depresión' },
  { id: 'trauma', label: 'Trauma', value: 'Trauma' },
  { id: 'adhd', label: 'TDAH', value: 'TDAH' },
  { id: 'gerontology', label: 'Gerontología', value: 'Gerontología' },
];

const sortOptions: FilterOption[] = [
  { id: 'default', label: 'Ordenar por', value: '' },
  { id: 'experience', label: 'Experiencia (mayor a menor)', value: 'experience' },
  { id: 'name', label: 'Nombre (A-Z)', value: 'name' },
  { id: 'rating', label: 'Valoración (mayor a menor)', value: 'rating' },
];

const availabilityOptions: FilterOption[] = [
  { id: 'all-availability', label: 'Cualquier disponibilidad', value: '' },
  { id: 'available', label: 'Disponible ahora', value: 'available' },
  { id: 'this-week', label: 'Disponible esta semana', value: 'this-week' },
];

const genderOptions: FilterOption[] = [
  { id: 'all-genders', label: 'Todos los géneros', value: '' },
  { id: 'female', label: 'Mujer', value: 'female' },
  { id: 'male', label: 'Hombre', value: 'male' },
];

const SpecialistFilters: FC<SpecialistFiltersProps> = ({ 
  totalSpecialists, 
  onFilterChange,
  initialFilters = {}
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  const handleFilterChange = (type: string, value: string) => {
    onFilterChange(type, value);
    
    // Update active filters display
    if (value) {
      if (!activeFilters.includes(type)) {
        setActiveFilters([...activeFilters, type]);
      }
    } else {
      setActiveFilters(activeFilters.filter(filter => filter !== type));
    }
  };
  
  const handleClearFilters = () => {
    // Reset all dropdowns to their default values
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
      select.value = '';
    });
    
    // Notify parent component
    specialtyOptions.forEach(option => {
      if (option.value) onFilterChange('specialty', '');
    });
    sortOptions.forEach(option => {
      if (option.value) onFilterChange('sort', '');
    });
    availabilityOptions.forEach(option => {
      if (option.value) onFilterChange('availability', '');
    });
    genderOptions.forEach(option => {
      if (option.value) onFilterChange('gender', '');
    });
    
    setActiveFilters([]);
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        {/* Header with count and basic filters */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {totalSpecialists} {totalSpecialists === 1 ? 'Especialista verificado' : 'Especialistas verificados'}
              </h2>
              <p className="text-sm text-gray-500">
                Profesionales con credenciales validadas
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* Primary filters always visible */}
            <div className="relative">
              <select
                className="appearance-none text-sm border border-gray-200 rounded-lg px-4 py-2.5 pl-4 pr-10 bg-white hover:border-teal-500 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                onChange={(e) => handleFilterChange('specialty', e.target.value)}
                defaultValue={initialFilters.specialty || ''}
              >
                {specialtyOptions.map(option => (
                  <option key={option.id} value={option.value}>{option.label}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
            
            <div className="relative">
              <select
                className="appearance-none text-sm border border-gray-200 rounded-lg px-4 py-2.5 pl-4 pr-10 bg-white hover:border-teal-500 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                defaultValue={initialFilters.sort || ''}
              >
                {sortOptions.map(option => (
                  <option key={option.id} value={option.value}>{option.label}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
            
            {/* Advanced filters toggle button */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-sm border border-gray-200 rounded-lg px-4 py-2.5 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Filtros avanzados
              <svg className={`w-4 h-4 text-gray-500 transform transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            
            {/* Clear filters button - only show if there are active filters */}
            {activeFilters.length > 0 && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-teal-600 border border-teal-600 rounded-lg px-4 py-2.5 bg-white hover:bg-teal-50 transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
        
        {/* Advanced filters section */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Additional filter: Availability */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilidad</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none text-sm border border-gray-200 rounded-lg px-4 py-2.5 bg-white hover:border-teal-500 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    onChange={(e) => handleFilterChange('availability', e.target.value)}
                    defaultValue={initialFilters.availability || ''}
                  >
                    {availabilityOptions.map(option => (
                      <option key={option.id} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Additional filter: Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Género del especialista</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none text-sm border border-gray-200 rounded-lg px-4 py-2.5 bg-white hover:border-teal-500 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    onChange={(e) => handleFilterChange('gender', e.target.value)}
                    defaultValue={initialFilters.gender || ''}
                  >
                    {genderOptions.map(option => (
                      <option key={option.id} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Active filters display */}
        {activeFilters.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <div className="text-sm text-gray-600 mr-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtros activos:
            </div>
            {activeFilters.includes('specialty') && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                Especialidad
              </span>
            )}
            {activeFilters.includes('sort') && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Ordenamiento
              </span>
            )}
            {activeFilters.includes('availability') && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Disponibilidad
              </span>
            )}
            {activeFilters.includes('gender') && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Género
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Info text */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-gray-600">
              Todos nuestros especialistas verificados cuentan con credenciales validadas y cumplen con nuestros estándares de calidad.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialistFilters;