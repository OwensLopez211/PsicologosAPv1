// ExperienceCard.tsx - Individual experience card component
import { motion } from 'framer-motion';
import { TrashIcon } from '@heroicons/react/24/outline';
import { Experience, formatDate, getExperienceTypeLabel } from '../../../../types/experience';

interface ExperienceCardProps {
  experience: Experience;
  isEditing: boolean;
  onDelete: (id: number | undefined) => void;
}

export const ExperienceCard = ({ experience, isEditing, onDelete }: ExperienceCardProps) => {
  return (
    <motion.div 
      className="bg-white p-4 rounded-md border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-gray-800">{experience.role}</h4>
          <p className="text-gray-600 text-sm">{experience.institution}</p>
          <div className="mt-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {getExperienceTypeLabel(experience.experience_type)}
            </span>
          </div>
          <p className="text-gray-500 text-xs mt-2">
            {formatDate(experience.start_date)} - {experience.end_date ? formatDate(experience.end_date) : 'Presente'}
          </p>
          {experience.description && (
            <p className="mt-2 text-sm text-gray-600">{experience.description}</p>
          )}
        </div>
        
        {isEditing && (
          <div className="flex space-x-2">
            <button 
              onClick={() => onDelete(experience.id)}
              className="text-gray-400 hover:text-red-500"
              title="Eliminar"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
