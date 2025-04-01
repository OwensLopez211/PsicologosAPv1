import { useState, useEffect } from 'react';
import axios from 'axios';
import HeaderPage from '../../components/public-components/HeaderPage';
import PageTransition from '../../components/public-components/PageTransition';
import SpecialistCard from '../../components/public-components/SpecialistCard';
import SpecialistFilters from '../../components/specialist-list/SpecialistFilters';

interface Specialist {
  id: number;
  name: string;
  university: string;
  specialties: string[];
  experience: string;
  profile_image?: string;
  verification_status: string;
  professional_title?: string;
}

const SpecialistPage = () => {
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    specialty: '',
    sort: ''
  });

  useEffect(() => {
    // In your fetchSpecialists function, update the API endpoint path
    const fetchSpecialists = async () => {
      try {
        setLoading(true);
        // Update this URL to match your Django URL configuration
        const response = await axios.get('/api/profiles/public/psychologists/', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        // Check if the response contains data property
        const responseData = response.data;
        
        if (Array.isArray(responseData)) {
          setSpecialists(responseData);
        } else if (responseData && Array.isArray(responseData.results)) {
          // Some APIs wrap the array in a results property
          setSpecialists(responseData.results);
        } else {
          console.error('API response is not in expected format:', responseData);
          setSpecialists([]);
          setError('Formato de datos incorrecto. Por favor, contacte al administrador.');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching specialists:', err);
        // For debugging, log more details about the error
        if (axios.isAxiosError(err)) {
          console.error('Response:', err.response?.data);
          console.error('Status:', err.response?.status);
        }
        setError('No se pudieron cargar los especialistas. Por favor, intenta de nuevo más tarde.');
        setLoading(false);
      }
    };

    fetchSpecialists();
  }, []);

  // Rest of the component remains the same
  const filteredSpecialists = specialists.length > 0 ? specialists.filter(specialist => {
    // Only include specialists with specialties that match the filter
    if (filters.specialty && specialist.specialties) {
      return specialist.specialties.some(specialty => 
        specialty.toLowerCase().includes(filters.specialty.toLowerCase())
      );
    }
    return true;
  }).sort((a, b) => {
    if (filters.sort === 'experience') {
      const aYears = parseInt(a.experience);
      const bYears = parseInt(b.experience);
      return isNaN(aYears) || isNaN(bYears) ? 0 : bYears - aYears;
    }
    if (filters.sort === 'name') {
      return a.name.localeCompare(b.name);
    }
    return 0;
  }) : [];

  const handleFilterChange = (type: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
  };

  if (loading) {
    return (
      <PageTransition>
        <HeaderPage 
          title="Nuestros Especialistas"
          description="Encuentra el psicólogo ideal para ti entre nuestros profesionales certificados y con amplia experiencia"
        />
        <div className="container mx-auto px-6 py-12 flex justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#2A6877]"></div>
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <HeaderPage 
          title="Nuestros Especialistas"
          description="Encuentra el psicólogo ideal para ti entre nuestros profesionales certificados y con amplia experiencia"
        />
        <div className="container mx-auto px-6 py-12 text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </PageTransition>
    );
  }

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
          {filteredSpecialists.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredSpecialists.map((specialist) => (
                <SpecialistCard
                  key={specialist.id}
                  id={specialist.id}
                  name={specialist.name}
                  university={specialist.university || ''}
                  specialties={Array.isArray(specialist.specialties) ? specialist.specialties.join(', ') : ''}
                  experience={specialist.experience || ''}
                  imageUrl={specialist.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(specialist.name)}&background=2A6877&color=fff&size=300`}
                  verification_status={specialist.verification_status}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">No se encontraron especialistas</h3>
              <p className="text-gray-500">No hay especialistas verificados que coincidan con tus criterios de búsqueda.</p>
            </div>
          )}
        </div>
      </section>
    </PageTransition>
  );
};

export default SpecialistPage;