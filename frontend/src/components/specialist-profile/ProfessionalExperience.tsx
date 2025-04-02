import { FC } from 'react';
import { motion } from 'framer-motion';

interface ProfessionalExperienceProps {
  experienceDescription: string;
}

const ProfessionalExperience: FC<ProfessionalExperienceProps> = ({ experienceDescription }) => {
  if (!experienceDescription) {
    return null;
  }

  return (
    <motion.section 
      className="bg-white rounded-lg shadow-sm p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">💼</span>
        <h2 className="text-xl font-semibold">Experiencia Profesional</h2>
      </div>
      
      <div className="prose max-w-none">
        {/* Split the text by paragraphs and render each one */}
        {experienceDescription.split('\n').map((paragraph, index) => (
          paragraph.trim() ? (
            <p key={index} className="text-gray-700 mb-3">{paragraph}</p>
          ) : null
        ))}
      </div>
    </motion.section>
  );
};

export default ProfessionalExperience;