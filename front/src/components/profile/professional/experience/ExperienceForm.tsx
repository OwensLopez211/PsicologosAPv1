// ExperienceForm.tsx - Form component for adding new experiences
import { useState } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Experience, experienceTypes } from '../../../../types/experience';

interface ExperienceFormProps {
  onSave: (experience: Experience) => void;
  onCancel: () => void;
}

export const ExperienceForm = ({ onSave, onCancel }: ExperienceFormProps) => {
  const [newExperience, setNewExperience] = useState<Experience>({
    experience_type: '',
    institution: '',
    role: '',
    start_date: '',
    end_date: null,
    description: ''
  });

  // Función para manejar cambios en los campos del formulario
  const handleInputChange = (field: keyof Experience, value: string) => {
    setNewExperience({
      ...newExperience,
      [field]: value
    });
  };

  // Función para guardar una nueva experiencia
  const handleSave = () => {
    const isValid = newExperience.experience_type && 
                    newExperience.institution && 
                    newExperience.role && 
                    newExperience.start_date;
    
    if (!isValid) {
      alert('Por favor complete los campos obligatorios: Tipo de experiencia, Institución, Rol y Fecha de inicio.');
      return;
    }

    onSave(newExperience);
  };

  return (
    <motion.div 
      className="bg-white p-4 rounded-md border border-gray-200 shadow-md mt-4"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-medium text-gray-800">
          <span className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4 text-[#2A6877]" />
            Nueva Experiencia
          </span>
        </h4>
        <button 
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Experiencia *
          </label>
          <select
            value={newExperience.experience_type}
            onChange={(e) => handleInputChange('experience_type', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2A6877] focus:ring-[#2A6877] sm:text-sm"
            required
          >
            <option value="">Seleccionar tipo</option>
            {experienceTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Institución *
          </label>
          <input
            type="text"
            value={newExperience.institution}
            onChange={(e) => handleInputChange('institution', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2A6877] focus:ring-[#2A6877] sm:text-sm"
            placeholder="Ej: Universidad de Chile"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cargo/Rol *
          </label>
          <input
            type="text"
            value={newExperience.role}
            onChange={(e) => handleInputChange('role', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2A6877] focus:ring-[#2A6877] sm:text-sm"
            placeholder="Ej: Psicólogo Clínico"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Inicio *
          </label>
          <input
            type="date"
            value={newExperience.start_date}
            onChange={(e) => handleInputChange('start_date', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2A6877] focus:ring-[#2A6877] sm:text-sm"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Fin
          </label>
          <input
            type="date"
            value={newExperience.end_date || ''}
            onChange={(e) => handleInputChange('end_date', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2A6877] focus:ring-[#2A6877] sm:text-sm"
            placeholder="Dejar en blanco si es trabajo actual"
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción
        </label>
        <textarea
          value={newExperience.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2A6877] focus:ring-[#2A6877] sm:text-sm"
          placeholder="Describe brevemente tus responsabilidades y logros"
        />
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A6877]"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#2A6877] hover:bg-[#2A6877]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A6877] inline-flex items-center"
        >
          <CheckIcon className="h-4 w-4 mr-1.5" />
          Guardar
        </button>
      </div>
    </motion.div>
  );
};