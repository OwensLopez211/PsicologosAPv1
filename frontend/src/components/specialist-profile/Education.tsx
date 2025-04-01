import { FC } from 'react';

interface EducationProps {
  university: string;
  graduationYear: string;
  targetPopulations?: string[]; // Add this prop
  academicDistinction?: boolean;
  researchParticipation?: boolean;
  teachingAssistantships?: Array<{
    subject: string;
    period: string;
  }>;
  previousExperience?: Array<{
    role: string;
    institution: string;
    period: string;
  }>;
}

const Education: FC<EducationProps> = ({
  university,
  graduationYear,
  targetPopulations = [], // Add default value
  academicDistinction = false,
  researchParticipation = false,
  teachingAssistantships = [],
  previousExperience = []
}) => (
  <section className="bg-white rounded-lg shadow-sm p-6">
    <h2 className="text-xl font-semibold mb-4">Formación y Experiencia</h2>
    <div className="space-y-6">
      <div>
        <h3 className="font-medium text-gray-900 mb-2">Formación Académica</h3>
        <p className="text-gray-600">
          {university || 'No especificado'} {graduationYear ? `(${graduationYear})` : ''}
        </p>
        {academicDistinction && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-2">
            Distinción Académica
          </span>
        )}
        {researchParticipation && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2 ml-2">
            Participación en Investigaciones
          </span>
        )}
      </div>

      {/* Add target populations section */}
      {targetPopulations && targetPopulations.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-900 mb-2">Poblaciones Objetivo</h3>
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
          <h3 className="font-medium text-gray-900 mb-2">Ayudantías</h3>
          <div className="space-y-2">
            {teachingAssistantships.map((assistantship, index) => (
              <div key={index} className="text-gray-600">
                <span className="font-medium">{assistantship.subject}</span>
                <span className="text-gray-500"> • {assistantship.period}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {previousExperience && previousExperience.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-900 mb-2">Experiencia Profesional</h3>
          <div className="space-y-2">
            {previousExperience.map((experience, index) => (
              <div key={index} className="text-gray-600">
                <span className="font-medium">{experience.role}</span>
                <span className="text-gray-500"> • {experience.institution}</span>
                <span className="text-gray-500"> • {experience.period}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </section>
);

export default Education;