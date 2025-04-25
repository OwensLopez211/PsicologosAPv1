// ExperienceList.tsx - List component for experiences
import { motion, AnimatePresence } from 'framer-motion';
import { ExperienceCard } from './ExperienceCard';
import { Experience } from '../../../../types/experience';

interface ExperienceListProps {
  experiences: Experience[];
  isEditing: boolean;
  onDeleteExperience: (id: number | undefined) => void;
}

export const ExperienceList = ({ experiences, isEditing, onDeleteExperience }: ExperienceListProps) => {
  return (
    <div className="space-y-4 mb-4">
      <AnimatePresence>
        {experiences.map((exp) => (
          <ExperienceCard 
            key={exp.id || `exp-${exp.role}`} 
            experience={exp} 
            isEditing={isEditing}
            onDelete={onDeleteExperience}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
