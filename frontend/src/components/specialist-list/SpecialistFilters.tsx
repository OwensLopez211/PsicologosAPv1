import { FC } from 'react';

interface SpecialistFiltersProps {
  totalSpecialists: number;
  onFilterChange: (type: string, value: string) => void;
}

const SpecialistFilters: FC<SpecialistFiltersProps> = ({ totalSpecialists, onFilterChange }) => (
  <div className="p-6 border-b border-gray-100">
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold text-gray-900">
        {totalSpecialists} Especialistas disponibles
      </h2>
      <div className="flex gap-2">
        <select 
          className="text-sm border rounded-md px-3 py-1.5"
          onChange={(e) => onFilterChange('specialty', e.target.value)}
        >
          <option value="">Todas las especialidades</option>
          <option value="Terapia Individual">Terapia Individual</option>
          <option value="Terapia Familiar">Terapia Familiar</option>
          <option value="Terapia Infantil">Terapia Infantil</option>
        </select>
        <select 
          className="text-sm border rounded-md px-3 py-1.5"
          onChange={(e) => onFilterChange('sort', e.target.value)}
        >
          <option value="">Ordenar por</option>
          <option value="experience">Experiencia</option>
          <option value="name">Nombre</option>
        </select>
      </div>
    </div>
  </div>
);

export default SpecialistFilters;