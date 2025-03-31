import { FC } from 'react';

interface EducationProps {
  university: string;
  graduationYear: string;
  academicDistinction: boolean;
  researchParticipation: boolean;
  teachingAssistantships: Array<{
    subject: string;
    period: string;
  }>;
  previousExperience: Array<{
    role: string;
    institution: string;
    period: string;
  }>;
}

const Education: FC<EducationProps> = ({
  university,
  graduationYear,
  academicDistinction,
  researchParticipation,
  teachingAssistantships,
  previousExperience
}) => (
  <section className="bg-white rounded-lg shadow-sm p-6">
    <h2 className="text-xl font-semibold mb-4">Formación y Experiencia</h2>
    <div className="space-y-6">
      <div>
        <h3 className="font-medium text-gray-900 mb-2">Formación Académica</h3>
        <p className="text-gray-600">
          {university} ({graduationYear})
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
    </div>
  </section>
);

export default Education;