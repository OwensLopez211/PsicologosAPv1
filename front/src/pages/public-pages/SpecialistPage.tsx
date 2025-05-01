import { useState, useEffect } from 'react';
import axios from 'axios';
import HeaderPage from '../../components/public-components/HeaderPage';
import PageTransition from '../../components/animations/PageTransition';
import SpecialistList from '../../components/specialist-list/SpecialistList';
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
  gender?: string;
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
    const fetchSpecialists = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/profiles/public/psychologists/', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        const responseData = response.data;
        
        if (Array.isArray(responseData)) {
          setSpecialists(responseData);
        } else if (responseData && Array.isArray(responseData.results)) {
          setSpecialists(responseData.results);
        } else {
          console.error('API response is not in expected format:', responseData);
          setSpecialists([]);
          setError('Formato de datos incorrecto. Por favor, contacte al administrador.');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching specialists:', err);
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

  const filteredSpecialists = specialists.length > 0 ? specialists.filter(specialist => {
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
          <SpecialistList specialists={filteredSpecialists} />
        </div>
      </section>
    </PageTransition>
  );
};

export default SpecialistPage;