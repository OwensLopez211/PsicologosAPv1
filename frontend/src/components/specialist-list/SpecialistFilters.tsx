import { FC } from 'react';

interface SpecialistFiltersProps {
  totalSpecialists: number;
  onFilterChange: (type: string, value: string) => void;
}

const SpecialistFilters: FC<SpecialistFiltersProps> = ({ totalSpecialists, onFilterChange }) => (
  <div className="p-6 border-b border-gray-100">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <h2 className="text-xl font-semibold text-gray-900">
        {totalSpecialists} {totalSpecialists === 1 ? 'Especialista verificado' : 'Especialistas verificados'}
      </h2>
      <div className="flex flex-wrap gap-2">
        <select 
          className="text-sm border rounded-md px-3 py-1.5 bg-white hover:border-[#2A6877] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2A6877] focus:border-transparent"
          onChange={(e) => onFilterChange('specialty', e.target.value)}
        >
          <option value="">Todas las especialidades</option>
          <option value="Terapia Individual">Terapia Individual</option>
          <option value="Terapia Familiar">Terapia Familiar</option>
          <option value="Terapia Infantil">Terapia Infantil</option>
          <option value="Ansiedad">Ansiedad</option>
          <option value="Depresión">Depresión</option>
          <option value="Trauma">Trauma</option>
          <option value="TDAH">TDAH</option>
          <option value="Gerontología">Gerontología</option>
        </select>
        <select 
          className="text-sm border rounded-md px-3 py-1.5 bg-white hover:border-[#2A6877] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2A6877] focus:border-transparent"
          onChange={(e) => onFilterChange('sort', e.target.value)}
        >
          <option value="">Ordenar por</option>
          <option value="experience">Experiencia (mayor a menor)</option>
          <option value="name">Nombre (A-Z)</option>
        </select>
      </div>
    </div>
    <div className="mt-4 text-sm text-gray-500">
      <p>Todos nuestros especialistas verificados cuentan con credenciales validadas y cumplen con nuestros estándares de calidad.</p>
    </div>
  </div>
);

export default SpecialistFilters;