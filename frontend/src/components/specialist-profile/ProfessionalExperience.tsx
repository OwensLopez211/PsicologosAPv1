import { FC } from 'react';
import { motion } from 'framer-motion';

interface ProfessionalExperienceProps {
  experienceDescription: string;
}

const ProfessionalExperience: FC<ProfessionalExperienceProps> = ({ experienceDescription }) => {
  if (!experienceDescription) {
    return null;
  }

  // Animation variants for paragraph staggering
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  // Split and filter paragraphs
  const paragraphs = experienceDescription
    .split('\n')
    .filter(paragraph => paragraph.trim().length > 0);

  return (
    <motion.section 
      className="bg-white rounded-lg shadow-md p-6 border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="flex items-center mb-6">
        <motion.div
          className="w-10 h-10 rounded-full bg-[#2A6877]/10 flex items-center justify-center mr-3"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#2A6877]" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
            <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
          </svg>
        </motion.div>
        <h2 className="text-xl font-bold text-gray-800">Experiencia Profesional</h2>
      </div>
      
      <div className="ml-3">
        <div className="relative pl-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-[#2A6877]/20 space-y-4">
          <motion.div 
            className="prose max-w-none"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {paragraphs.map((paragraph, index) => (
              <motion.div 
                key={index} 
                className="relative"
                variants={itemVariants}
              >
                <div className="absolute -left-10 mt-1.5 w-3 h-3 rounded-full bg-[#2A6877]"></div>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {paragraph}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
      
      {paragraphs.length === 0 && (
        <div className="bg-gray-50 border border-gray-100 rounded-md p-4 text-gray-500 italic text-center mt-4">
          No hay información sobre experiencia profesional disponible.
        </div>
      )}
    </motion.section>
  );
};

export default ProfessionalExperience;