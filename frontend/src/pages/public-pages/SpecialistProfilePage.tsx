import { useParams } from 'react-router-dom';
import PageTransition from '../../components/public-components/PageTransition';
import { StarIcon, CalendarIcon, ClockIcon, AcademicCapIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import ScheduleModal from '../../components/scheduling/ScheduleModal';

const SpecialistProfilePage = () => {
  const { id } = useParams();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  
  const specialist = {
    name: "Dra. María González",
    title: "Psicóloga Clínica",
    specialties: ["Terapia Individual", "Ansiedad", "Depresión"],
    experience: "8 años",
    education: [
      {
        degree: "Doctorado en Psicología Clínica",
        institution: "Universidad Nacional Autónoma",
        year: "2015"
      },
      {
        degree: "Maestría en Terapia Cognitivo-Conductual",
        institution: "Universidad de Barcelona",
        year: "2012"
      }
    ],
    about: "Soy una psicóloga clínica con más de 8 años de experiencia ayudando a personas a superar desafíos emocionales y mentales. Mi enfoque se centra en crear un espacio seguro y de confianza donde mis pacientes puedan explorar sus pensamientos y sentimientos libremente.",
    approach: "Mi método terapéutico combina técnicas cognitivo-conductuales con un enfoque humanista, adaptando cada sesión a las necesidades específicas de cada paciente.",
    schedule: {
      availability: ["Lunes a Viernes: 9:00 AM - 6:00 PM", "Sábados: 9:00 AM - 2:00 PM"],
      sessionDuration: "50 minutos",
      // Removed modalities array since it's online-only
    },
    ratings: {
      average: 4.8,
      total: 127,
      distribution: [
        { stars: 5, count: 98 },
        { stars: 4, count: 20 },
        { stars: 3, count: 7 },
        { stars: 2, count: 1 },
        { stars: 1, count: 1 }
      ]
    },
    reviews: [
      {
        id: 1,
        author: "María L.",
        rating: 5,
        date: "Hace 2 semanas",
        comment: "Excelente profesional. Me ayudó muchísimo con mi ansiedad."
      },
      // ... more reviews
    ]
  };

  const placeholderImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(specialist.name)}&background=2A6877&color=fff&size=400`;

  return (
    <PageTransition>
      <div className="bg-gray-50 min-h-screen">
        {/* Hero Section */}
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-6 py-8">
            <div className="md:flex md:items-center md:gap-12">
              <div className="md:w-1/4">
                <img 
                  src={placeholderImage}
                  alt={specialist.name}
                  className="w-48 h-48 rounded-full object-cover mx-auto shadow-lg"
                />
              </div>
              <div className="md:w-3/4 mt-6 md:mt-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-semibold text-gray-900">{specialist.name}</h1>
                    <p className="text-[#2A6877] font-medium mt-1">{specialist.title}</p>
                    {/* Add specialties tags */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {specialist.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-[#2A6877] bg-opacity-10 text-[#2A6877] rounded-full text-sm font-medium"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button 
                    className="bg-[#2A6877] text-white px-6 py-2 rounded-md hover:bg-[#235A67] transition-colors"
                    onClick={() => setIsScheduleModalOpen(true)}
                  >
                    Agendar Consulta
                  </button>
                </div>
                <div className="mt-4 flex items-center gap-6">
                  <div className="flex items-center">
                    <StarIcon className="h-5 w-5 text-yellow-400" />
                    <span className="ml-1 text-lg font-semibold">{specialist.ratings.average}</span>
                    <span className="ml-1 text-gray-500">({specialist.ratings.total} valoraciones)</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <ClockIcon className="h-5 w-5 mr-1" />
                    <span>{specialist.schedule.sessionDuration}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Column - Main Info */}
            <div className="md:col-span-2 space-y-8">
              <section className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Sobre mí</h2>
                <p className="text-gray-600 leading-relaxed">{specialist.about}</p>
              </section>

              <section className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Enfoque terapéutico</h2>
                <p className="text-gray-600 leading-relaxed">{specialist.approach}</p>
              </section>

              <section className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Formación académica</h2>
                <div className="space-y-4">
                  {specialist.education.map((edu, index) => (
                    <div key={index} className="flex gap-4">
                      <AcademicCapIcon className="h-6 w-6 text-[#2A6877] flex-shrink-0" />
                      <div>
                        <h3 className="font-medium">{edu.degree}</h3>
                        <p className="text-gray-500 text-sm">{edu.institution}, {edu.year}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Valoraciones y comentarios</h2>
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">{specialist.ratings.average}</div>
                    <div className="flex items-center justify-center">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className={`h-5 w-5 ${i < Math.floor(specialist.ratings.average) ? 'text-yellow-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{specialist.ratings.total} valoraciones</div>
                  </div>
                  <div className="flex-1">
                    {specialist.ratings.distribution.reverse().map((dist) => (
                      <div key={dist.stars} className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 w-6">{dist.stars}</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-yellow-400 rounded-full"
                            style={{ width: `${(dist.count / specialist.ratings.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-500 w-8">{dist.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  {specialist.reviews.map((review) => (
                    <div key={review.id} className="border-t pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-medium">{review.author}</span>
                          <span className="text-gray-500 text-sm ml-2">{review.date}</span>
                        </div>
                        <div className="flex">
                          {[...Array(review.rating)].map((_, i) => (
                            <StarIcon key={i} className="h-4 w-4 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column - Schedule & Contact */}
            <div className="md:sticky md:top-6">
              <section className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Horarios disponibles</h2>
                <div className="space-y-4">
                  {specialist.schedule.availability.map((time, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CalendarIcon className="h-5 w-5 text-[#2A6877] flex-shrink-0" />
                      <span className="text-gray-600">{time}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Modalidad de atención</h3>
                  <span className="bg-[#2A6877] bg-opacity-10 text-[#2A6877] px-3 py-1 rounded-full text-sm inline-flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Consulta Online
                  </span>
                </div>
                <button 
                  className="w-full bg-[#2A6877] text-white px-6 py-3 rounded-md hover:bg-[#235A67] transition-colors mt-6"
                  onClick={() => setIsScheduleModalOpen(true)}
                >
                  Agendar Consulta
                </button>
              </section>
            </div>
          </div>
        </div>
      </div>
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        specialistId={Number(id)}
        specialistName={specialist.name}
      />
    </PageTransition>
  );
};

export default SpecialistProfilePage;