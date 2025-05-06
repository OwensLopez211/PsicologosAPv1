// ExperienceField.tsx - Main component (add and delete, but no edit)
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon } from '@heroicons/react/24/outline';
import { ExperienceList } from './experience/ExperienceList';
import { ExperienceForm } from './experience/ExperienceForm';
import { Experience } from '../../../types/experience';

interface ExperienceFieldProps {
  experiences: Experience[];
  isEditing: boolean;
  onExperiencesChange: (experiences: Experience[]) => void;
}

const ExperienceField = ({ experiences = [], isEditing, onExperiencesChange }: ExperienceFieldProps) => {
  // Estado local para gestionar las experiencias
  const [localExperiences, setLocalExperiences] = useState<Experience[]>(experiences || []);
  const [showForm, setShowForm] = useState(false);

  // Actualizar el estado local cuando cambian las experiencias externas
  useEffect(() => {
    if (!showForm) {
      setLocalExperiences(experiences || []);
    }
  }, [experiences, showForm]);

  // Función para agregar una nueva experiencia
  const handleAddExperience = () => {
    setShowForm(true);
  };

  // Función para eliminar una experiencia
  const handleDeleteExperience = (id: number | undefined) => {
    if (id === undefined) return;
    
    const updatedExperiences = localExperiences.filter(exp => exp.id !== id);
    setLocalExperiences(updatedExperiences);
    
    // Notificar al componente padre sobre el cambio
    if (typeof onExperiencesChange === 'function') {
      onExperiencesChange(updatedExperiences);
    }
  };

  // Función para guardar una nueva experiencia
  const handleSaveExperience = (newExperience: Experience) => {
    // Crear un ID temporal negativo
    const tempId = -(Date.now());
    const experienceWithId = { ...newExperience, id: tempId };
    
    // Agregar la nueva experiencia a la lista
    const updatedExperiences = [...localExperiences, experienceWithId];
    setLocalExperiences(updatedExperiences);
    
    // Notificar al componente padre
    onExperiencesChange(updatedExperiences);
    
    // Cerrar el formulario
    setShowForm(false);
  };

  // Función para cancelar la adición
  const handleCancel = () => {
    setShowForm(false);
  };

  return (
    <motion.div 
      className="p-3 sm:p-5 bg-white rounded-lg border border-gray-100 shadow-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <motion.div
        className="mb-3 sm:mb-4 flex items-center justify-between"
        initial={{ x: -20 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-base sm:text-lg">📚</span>
          <h3 className="text-sm sm:text-lg font-medium text-gray-700">
            Experiencia Profesional
          </h3>
        </div>
        
        {isEditing && !showForm && (
          <button 
            onClick={handleAddExperience}
            className="inline-flex items-center px-2 sm:px-2.5 py-1 sm:py-1.5 border border-transparent text-xs font-medium rounded text-[#2A6877] bg-[#2A6877]/10 hover:bg-[#2A6877]/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A6877]"
          >
            <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
            Agregar
          </button>
        )}
      </motion.div>

      {/* Lista de experiencias */}
      {localExperiences.length === 0 && !showForm ? (
        <div className="text-center py-5 sm:py-8 text-gray-500 text-xs sm:text-sm">
          {isEditing ? (
            <p>No has añadido experiencias profesionales. Haz clic en "Agregar" para comenzar.</p>
          ) : (
            <p>No hay experiencias profesionales para mostrar.</p>
          )}
        </div>
      ) : (
        <ExperienceList 
          experiences={localExperiences} 
          isEditing={isEditing} 
          onDeleteExperience={handleDeleteExperience}
        />
      )}

      {/* Formulario para agregar nueva experiencia */}
      <AnimatePresence>
        {showForm && (
          <ExperienceForm
            onSave={handleSaveExperience}
            onCancel={handleCancel}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ExperienceField;