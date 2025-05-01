import { FC } from 'react';
import { motion } from 'framer-motion';

interface EducationProps {
  university: string;
  graduationYear: string;
  targetPopulations?: string[];
  academicDistinction?: boolean;
  researchParticipation?: boolean;
  teachingAssistantships?: Array<{
    subject: string;
    period: string;
  }>;
  professionalTitle?: string;
}

const Education: FC<EducationProps> = ({
  university,
  graduationYear,
  targetPopulations = [],
  academicDistinction = false,
  researchParticipation = false,
  teachingAssistantships = [],
  professionalTitle = ''
}) => {
  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
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
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
          </svg>
        </motion.div>
        <h2 className="text-xl font-bold text-gray-800">Formación Académica</h2>
      </div>
      
      <div className="space-y-6">
        {/* Main Education Card */}
        <motion.div 
          className="bg-gradient-to-r from-gray-50 to-white p-5 rounded-lg border border-gray-200 shadow-sm"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {/* Professional Title Section */}
          {professionalTitle && (
            <motion.div 
              className="mb-5 pb-4 border-b border-gray-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <div className="w-7 h-7 rounded-full bg-[#2A6877]/15 flex items-center justify-center mr-2 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#2A6877]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </div>
                Título Profesional
              </h3>
              <div className="ml-9 text-gray-700 font-medium">{professionalTitle}</div>
            </motion.div>
          )}
          
          {/* University Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <div className="w-7 h-7 rounded-full bg-[#2A6877]/15 flex items-center justify-center mr-2 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#2A6877]" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                  <path d="M3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zm6.67 7.176A9.032 9.032 0 016 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </div>
              Universidad
            </h3>
            <div className="ml-9 text-gray-700 font-medium">
              {university || 'No especificado'} 
              {graduationYear && <span className="text-[#2A6877] ml-2 font-semibold">({graduationYear})</span>}
            </div>
          </motion.div>
          
          {/* Distinctions Section */}
          {(academicDistinction || researchParticipation) && (
            <motion.div 
              className="mt-4 ml-9 flex flex-wrap gap-2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {academicDistinction && (
                <motion.div 
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200 shadow-sm"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Distinción Académica
                </motion.div>
              )}
              {researchParticipation && (
                <motion.div 
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                  Participación en Investigaciones
                </motion.div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Target Populations Section */}
        {targetPopulations && targetPopulations.length > 0 && (
          <motion.div
            className="bg-gradient-to-r from-[#2A6877]/10 to-transparent p-5 rounded-lg border border-[#2A6877]/10"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <div className="w-7 h-7 rounded-full bg-[#2A6877]/15 flex items-center justify-center mr-2 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#2A6877]" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <span>Poblaciones Objetivo</span>
            </h3>
            
            <motion.div
              className="flex flex-wrap gap-2 ml-9"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {targetPopulations.map((population, index) => (
                <motion.span
                  key={index}
                  className="px-3 py-1.5 bg-[#2A6877]/15 text-[#2A6877] rounded-full text-sm font-medium shadow-sm hover:bg-[#2A6877]/25 transition-colors flex items-center"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2A6877] mr-1.5"></span>
                  {population}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Teaching Assistantships Section */}
        {teachingAssistantships && teachingAssistantships.length > 0 && (
          <motion.div
            className="bg-gradient-to-r from-[#2A6877]/10 to-transparent p-5 rounded-lg border border-[#2A6877]/10"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <div className="w-7 h-7 rounded-full bg-[#2A6877]/15 flex items-center justify-center mr-2 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#2A6877]" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                  <path d="M3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zm6.67 7.176A9.032 9.032 0 016 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </div>
              <span>Ayudantías Académicas</span>
            </h3>
            
            <div className="ml-9 space-y-3">
              {teachingAssistantships.map((assistantship, index) => (
                <motion.div 
                  key={index} 
                  className="bg-white p-3 rounded-md border border-gray-100 shadow-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + (index * 0.1) }}
                >
                  <div className="font-medium text-gray-800">{assistantship.subject}</div>
                  <div className="text-gray-500 text-sm mt-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-[#2A6877]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    {assistantship.period}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
};

export default Education;