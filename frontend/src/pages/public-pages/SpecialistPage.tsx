import { useState, useMemo } from 'react';
import HeaderPage from '../../components/public-components/HeaderPage';
import PageTransition from '../../components/public-components/PageTransition';
import SpecialistCard from '../../components/public-components/SpecialistCard';
import SpecialistFilters from '../../components/specialist-list/SpecialistFilters';

const SpecialistPage = () => {
  const [filters, setFilters] = useState({
    specialty: '',
    sort: ''
  });

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
      title: "Psicólogo Clínico",
      specialties: "Terapia Infantil, TDAH, Problemas de Aprendizaje",
      experience: "12 años",
      imageUrl: "https://ui-avatars.com/api/?name=Carlos+Mendoza&background=235A67&color=fff&size=300"
    },
    {
      id: 3,
      name: "Dra. Ana Silva",
      title: "Psicólogo Clínico",
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
      title: "Psicólogo Clínico",
      specialties: "Terapia Adolescente, Autoestima, Desarrollo Personal",
      experience: "9 años",
      imageUrl: "https://ui-avatars.com/api/?name=Laura+Martínez&background=4A8897&color=fff&size=300"
    },
    {
      id: 6,
      name: "Dr. Daniel Torres",
      title: "Psicólogo Clínico",
      specialties: "Gerontología, Deterioro Cognitivo, Adaptación",
      experience: "14 años",
      imageUrl: "https://ui-avatars.com/api/?name=Daniel+Torres&background=2A7887&color=fff&size=300"
    }
  ];

  const filteredSpecialists = useMemo(() => {
    let result = [...specialists];

    // Apply specialty filter
    if (filters.specialty) {
      result = result.filter(specialist => 
        specialist.specialties.includes(filters.specialty)
      );
    }

    // Apply sorting
    if (filters.sort) {
      result.sort((a, b) => {
        if (filters.sort === 'experience') {
          const aYears = parseInt(a.experience);
          const bYears = parseInt(b.experience);
          return bYears - aYears;
        }
        if (filters.sort === 'name') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
    }

    return result;
  }, [specialists, filters]);

  const handleFilterChange = (type: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
  };

  return (
    <PageTransition>
      <HeaderPage 
        title="Nuestros Especialistas"
        description="Encuentra el psicólogo ideal para ti entre nuestros profesionales certificados y con amplia experiencia"
      />
      
      <section className="container mx-auto px-6 py-12">
        <div className="bg-white rounded-xl shadow-sm">
          <SpecialistFilters
            totalSpecialists={filteredSpecialists.length}
            onFilterChange={handleFilterChange}
          />
          <div className="divide-y divide-gray-100">
            {filteredSpecialists.map((specialist) => (
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