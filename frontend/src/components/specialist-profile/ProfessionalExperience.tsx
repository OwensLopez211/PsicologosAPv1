import { FC } from 'react';
import { motion } from 'framer-motion';

interface Experience {
  id: number;
  experience_type: string;
  institution: string;
  role: string;
  start_date: string;
  end_date: string | null;
  description: string;
}

interface ProfessionalExperienceProps {
  experiences: Experience[];
}

const ProfessionalExperience: FC<ProfessionalExperienceProps> = ({ experiences = [] }) => {
  if (!experiences || experiences.length === 0) {
    return null;
  }

  // Animation variants for experience items
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
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  // Formatear fecha: YYYY-MM-DD -> Mes YYYY
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Presente';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric'
    });
  };

  // Obtener el ícono según el tipo de experiencia
  const getExperienceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'clinical':
      case 'clínica':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#2A6877]" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        );
      case 'research':
      case 'investigación':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#2A6877]" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        );
      case 'academic':
      case 'académica':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#2A6877]" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#2A6877]" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
            <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
          </svg>
        );
    }
  };

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
        <div className="relative pl-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-[#2A6877]/20 space-y-8">
          <motion.div 
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {experiences.map((experience) => (
              <motion.div 
                key={experience.id} 
                className="relative"
                variants={itemVariants}
              >
                {/* Dot marker on timeline */}
                <div className="absolute -left-10 mt-1.5 w-3 h-3 rounded-full bg-[#2A6877] ring-4 ring-white"></div>
                
                {/* Experience card */}
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  {/* Institution and period */}
                  <div className="flex justify-between items-start flex-wrap mb-3">
                    <h3 className="text-base font-bold text-gray-800 flex items-center">
                      {experience.institution}
                      <span className="ml-2 px-2 py-0.5 text-xs bg-[#2A6877]/10 text-[#2A6877] rounded-full font-medium">
                        {experience.experience_type}
                      </span>
                    </h3>
                    <span className="text-sm text-gray-500 flex items-center mt-1 sm:mt-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-[#2A6877]" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      {formatDate(experience.start_date)} - {formatDate(experience.end_date)}
                    </span>
                  </div>
                  
                  {/* Role */}
                  <div className="mb-3">
                    <h4 className="text-[#2A6877] font-semibold flex items-center">
                      <div className="w-6 h-6 rounded-full bg-[#2A6877]/10 flex items-center justify-center mr-2">
                        {getExperienceIcon(experience.experience_type)}
                      </div>
                      {experience.role}
                    </h4>
                  </div>
                  
                  {/* Description */}
                  {experience.description && (
                    <p className="text-gray-700 mt-2 text-sm leading-relaxed">
                      {experience.description}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
      
      {experiences.length === 0 && (
        <div className="bg-gray-50 border border-gray-100 rounded-md p-4 text-gray-500 italic text-center mt-4">
          No hay información sobre experiencia profesional disponible.
        </div>
      )}
    </motion.section>
  );
};

export default ProfessionalExperience;