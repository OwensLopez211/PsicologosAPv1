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
  professionalTitle?: string; // Added professional title
}

const Education: FC<EducationProps> = ({
  university,
  graduationYear,
  targetPopulations = [],
  academicDistinction = false,
  researchParticipation = false,
  teachingAssistantships = [],
  professionalTitle = '' // Default value for professional title
}) => (
  <motion.section 
    className="bg-white rounded-lg shadow-sm p-6"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex items-center gap-2 mb-4">
      <span className="text-2xl">🎓</span>
      <h2 className="text-xl font-semibold">Formación Académica</h2>
    </div>
    
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
        {/* Professional Title Section */}
        {professionalTitle && (
          <div className="mb-4 pb-3 border-b border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">Título Profesional</h3>
            <div className="flex items-center">
              <span className="text-lg mr-2">📜</span>
              <p className="text-gray-700 font-medium">{professionalTitle}</p>
            </div>
          </div>
        )}
        
        {/* University Section */}
        <h3 className="font-medium text-gray-900 mb-2">Universidad</h3>
        <div className="flex items-center">
          <span className="text-lg mr-2">🏛️</span>
          <p className="text-gray-700 font-medium">
            {university || 'No especificado'} {graduationYear ? `(${graduationYear})` : ''}
          </p>
        </div>
        
        <div className="mt-3 flex flex-wrap gap-2">
          {academicDistinction && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <span className="mr-1">✨</span> Distinción Académica
            </span>
          )}
          {researchParticipation && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <span className="mr-1">🔬</span> Participación en Investigaciones
            </span>
          )}
        </div>
      </div>

      {targetPopulations && targetPopulations.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-900 mb-2 flex items-center">
            <span className="text-lg mr-2">👥</span>Poblaciones Objetivo
          </h3>
          <div className="flex flex-wrap gap-2">
            {targetPopulations.map((population, index) => (
              <span key={index} className="px-3 py-1 bg-[#2A6877] bg-opacity-10 text-[#2A6877] rounded-full text-sm">
                {population}
              </span>
            ))}
          </div>
        </div>
      )}

      {teachingAssistantships && teachingAssistantships.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-900 mb-2 flex items-center">
            <span className="text-lg mr-2">👨‍🏫</span>Ayudantías Académicas
          </h3>
          <div className="space-y-2 divide-y divide-gray-100">
            {teachingAssistantships.map((assistantship, index) => (
              <div key={index} className="py-2">
                <div className="font-medium text-gray-800">{assistantship.subject}</div>
                <div className="text-gray-500 text-sm">{assistantship.period}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </motion.section>
);

export default Education;