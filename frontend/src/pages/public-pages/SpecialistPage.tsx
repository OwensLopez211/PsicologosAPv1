import HeaderPage from '../../components/public-components/HeaderPage';
import PageTransition from '../../components/public-components/PageTransition';
import SpecialistCard from '../../components/public-components/SpecialistCard';

const SpecialistPage = () => {
  const specialists = [
    {
      id: 1,
      name: "Dra. María González",
      title: "Psicóloga Clínica",
      specialties: "Terapia Individual, Ansiedad, Depresión",
      experience: "8 años",
      imageUrl: "https://ui-avatars.com/api/?name=María+González&background=2A6877&color=fff&size=300"
    },
    {
      id: 2,
      name: "Dr. Carlos Mendoza",
      title: "Psicólogo Infantil",
      specialties: "Terapia Infantil, TDAH, Problemas de Aprendizaje",
      experience: "12 años",
      imageUrl: "https://ui-avatars.com/api/?name=Carlos+Mendoza&background=235A67&color=fff&size=300"
    },
    {
      id: 3,
      name: "Dra. Ana Silva",
      title: "Psicóloga Familiar",
      specialties: "Terapia Familiar, Relaciones de Pareja, Mediación",
      experience: "15 años",
      imageUrl: "https://ui-avatars.com/api/?name=Ana+Silva&background=3A7887&color=fff&size=300"
    },
    {
      id: 4,
      name: "Dr. Roberto Pérez",
      title: "Psicólogo Clínico",
      specialties: "Trauma, Estrés Post-traumático, Duelo",
      experience: "10 años",
      imageUrl: "https://ui-avatars.com/api/?name=Roberto+Pérez&background=1A5867&color=fff&size=300"
    },
    {
      id: 5,
      name: "Dra. Laura Martínez",
      title: "Psicóloga Adolescente",
      specialties: "Terapia Adolescente, Autoestima, Desarrollo Personal",
      experience: "9 años",
      imageUrl: "https://ui-avatars.com/api/?name=Laura+Martínez&background=4A8897&color=fff&size=300"
    },
    {
      id: 6,
      name: "Dr. Daniel Torres",
      title: "Psicólogo Adulto Mayor",
      specialties: "Gerontología, Deterioro Cognitivo, Adaptación",
      experience: "14 años",
      imageUrl: "https://ui-avatars.com/api/?name=Daniel+Torres&background=2A7887&color=fff&size=300"
    }
  ];

  return (
    <PageTransition>
      <HeaderPage 
        title="Nuestros Especialistas"
        description="Encuentra el psicólogo ideal para ti entre nuestros profesionales certificados y con amplia experiencia"
      />
      
      <section className="container mx-auto px-6 py-12">
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {specialists.length} Especialistas disponibles
              </h2>
              <div className="flex gap-2">
                <select className="text-sm border rounded-md px-3 py-1.5">
                  <option>Todas las especialidades</option>
                  <option>Terapia Individual</option>
                  <option>Terapia Familiar</option>
                  <option>Terapia Infantil</option>
                </select>
                <select className="text-sm border rounded-md px-3 py-1.5">
                  <option>Ordenar por</option>
                  <option>Experiencia</option>
                  <option>Nombre</option>
                </select>
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {specialists.map((specialist) => (
              <SpecialistCard
                key={specialist.id}
                {...specialist}
              />
            ))}
          </div>
        </div>
      </section>
    </PageTransition>
  );
};

export default SpecialistPage;