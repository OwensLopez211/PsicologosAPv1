import { FC, useState } from 'react';
import { specialtyOptions, populationOptions } from '../../types/options-data';

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
    population?: string;
  };
}

const sortOptions: FilterOption[] = [
  { id: 'default', label: 'Ordenar por', value: '' },
  { id: 'experience', label: 'Experiencia (mayor a menor)', value: 'experience' },
  { id: 'name', label: 'Nombre (A-Z)', value: 'name' },
  { id: 'rating', label: 'Valoración (mayor a menor)', value: 'rating' },
];

const SpecialistFilters: FC<SpecialistFiltersProps> = ({ 
  totalSpecialists, 
  onFilterChange,
  initialFilters = {}
}) => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  const handleFilterChange = (type: string, value: string) => {
    onFilterChange(type, value);
    
    if (value) {
      if (!activeFilters.includes(type)) {
        setActiveFilters([...activeFilters, type]);
      }
    } else {
      setActiveFilters(activeFilters.filter(filter => filter !== type));
    }
  };
  
  const handleClearFilters = () => {
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
      select.value = '';
    });
    
    onFilterChange('specialty', '');
    onFilterChange('sort', '');
    onFilterChange('population', '');
    
    setActiveFilters([]);
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-4 sm:p-6">
        {/* Header con contador e información - Más compacto en móvil */}
        <div className="flex flex-col space-y-4 sm:space-y-6">
          <div className="flex items-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#2A6877]/10 flex items-center justify-center mr-2 sm:mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-[#2A6877]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-gray-900">
                {totalSpecialists} {totalSpecialists === 1 ? 'Especialista verificado' : 'Especialistas verificados'}
              </h2>
            </div>
          </div>
          
          {/* Contenedor de filtros con grid responsivo - Más compacto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            {/* Filtro de especialidad */}
            <div className="relative">
              <select
                className="w-full appearance-none text-xs sm:text-sm border border-gray-200 rounded-md sm:rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 bg-white hover:border-[#2A6877] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2A6877] focus:border-transparent"
                onChange={(e) => handleFilterChange('specialty', e.target.value)}
                defaultValue={initialFilters.specialty || ''}
              >
                <option value="">Todos los enfoques terapéuticos</option>
                {specialtyOptions.map((specialty, index) => (
                  <option key={index} value={specialty}>{specialty}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>

            {/* Filtro de población */}
            <div className="relative">
              <select
                className="w-full appearance-none text-xs sm:text-sm border border-gray-200 rounded-md sm:rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 bg-white hover:border-[#2A6877] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2A6877] focus:border-transparent"
                onChange={(e) => handleFilterChange('population', e.target.value)}
                defaultValue={initialFilters.population || ''}
              >
                <option value="">Todas las edades</option>
                {populationOptions.map((population, index) => (
                  <option key={index} value={population}>{population}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
            
            {/* Filtro de ordenamiento */}
            <div className="relative">
              <select
                className="w-full appearance-none text-xs sm:text-sm border border-gray-200 rounded-md sm:rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 bg-white hover:border-[#2A6877] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2A6877] focus:border-transparent"
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                defaultValue={initialFilters.sort || ''}
              >
                {sortOptions.map(option => (
                  <option key={option.id} value={option.value}>{option.label}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
            
            {/* Botón de limpiar filtros */}
            {activeFilters.length > 0 && (
              <button
                onClick={handleClearFilters}
                className="w-full text-xs sm:text-sm text-[#2A6877] border border-[#2A6877] rounded-md sm:rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 bg-white hover:bg-[#2A6877]/10 transition-colors flex items-center justify-center gap-1 sm:gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
        
        {/* Indicadores de filtros activos - Más compactos */}
        {activeFilters.length > 0 && (
          <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-1 sm:gap-2">
            <div className="text-xs sm:text-sm text-gray-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtros activos:
            </div>
            {activeFilters.includes('specialty') && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#2A6877]/10 text-[#2A6877]">
                Enfoque terapéutico
              </span>
            )}
            {activeFilters.includes('population') && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#2A6877]/10 text-[#2A6877]">
                Edad
              </span>
            )}
            {activeFilters.includes('sort') && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#2A6877]/10 text-[#2A6877]">
                Ordenamiento
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Texto informativo - Más compacto */}
      <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:py-4 border-t border-gray-100">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-[#2A6877]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-2 sm:ml-3">
            <p className="text-xs sm:text-sm text-gray-600">
              Todos nuestros especialistas verificados cuentan con credenciales validadas y cumplen con nuestros estándares de calidad.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialistFilters;