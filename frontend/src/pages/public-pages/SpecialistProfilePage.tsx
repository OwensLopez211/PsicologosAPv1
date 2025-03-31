import { useParams } from 'react-router-dom';
import { useState } from 'react';
import PageTransition from '../../components/public-components/PageTransition';
import ScheduleModal from '../../components/scheduling/ScheduleModal';
import ProfileHeader from '../../components/specialist-profile/ProfileHeader';
import PresentationVideo from '../../components/specialist-profile/PresentationVideo';
import Specialties from '../../components/specialist-profile/Specialties';
import Education from '../../components/specialist-profile/Education';
import ScheduleSection from '../../components/specialist-profile/ScheduleSection';

const SpecialistProfilePage = () => {
  const { id } = useParams();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  
  const specialist = {
    name: "Dra. María González",
    title: "Psicóloga Clínica",
    registrationNumber: "PSI-12345", // Certificado de inscripción
    profileImage: `https://ui-avatars.com/api/?name=María+González&background=2A6877&color=fff&size=400`,
    presentationVideo: "https://www.youtube.com/embed/example", // Video de presentación
    therapeuticApproaches: [ // Enfoques terapéuticos
      "Terapia Cognitivo-Conductual",
      "Terapia Humanista",
      "Mindfulness"
    ],
    specialtyDisorders: [ // Trastornos de especialidad
      "Trastornos de Ansiedad",
      "Depresión",
      "Trastornos del Estado de Ánimo"
    ],
    education: {
      university: "Universidad Nacional Autónoma", // Universidad de egreso
      graduationYear: "2015"
    },
    teachingAssistantships: [ // Ayudantías realizadas
      {
        subject: "Psicología Clínica",
        period: "2013-2014"
      },
      {
        subject: "Evaluación Psicológica",
        period: "2014-2015"
      }
    ],
    previousExperience: [ // Experiencias previas
      {
        role: "Psicóloga Clínica",
        institution: "Centro de Salud Mental",
        period: "2015-2020"
      },
      {
        role: "Terapeuta",
        institution: "Consulta Privada",
        period: "2020-Presente"
      }
    ],
    academicDistinction: true, // Distinción académica
    researchParticipation: true, // Participación en estudios/investigaciones
    schedule: {
      availability: ["Lunes a Viernes: 9:00 AM - 6:00 PM", "Sábados: 9:00 AM - 2:00 PM"],
      sessionDuration: "50 minutos",
    },
    ratings: {
      average: 4.8,
      total: 127
    }
  };

  return (
    <PageTransition>
      <div className="bg-gray-50 min-h-screen">
        <ProfileHeader
          name={specialist.name}
          title={specialist.title}
          registrationNumber={specialist.registrationNumber}
          profileImage={specialist.profileImage}
          onSchedule={() => setIsScheduleModalOpen(true)}
        />

        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <PresentationVideo videoUrl={specialist.presentationVideo} />
              
              <Specialties
                therapeuticApproaches={specialist.therapeuticApproaches}
                specialtyDisorders={specialist.specialtyDisorders}
              />
              
              <Education
                university={specialist.education.university}
                graduationYear={specialist.education.graduationYear}
                academicDistinction={specialist.academicDistinction}
                researchParticipation={specialist.researchParticipation}
                teachingAssistantships={specialist.teachingAssistantships}
                previousExperience={specialist.previousExperience}
              />
            </div>

            <div className="md:sticky md:top-6">
              <ScheduleSection
                availability={specialist.schedule.availability}
                onSchedule={() => setIsScheduleModalOpen(true)}
              />
            </div>
          </div>
        </div>

        <ScheduleModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          specialistId={Number(id)}
          specialistName={specialist.name}
        />
      </div>
    </PageTransition>
  );
};

export default SpecialistProfilePage;