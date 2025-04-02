import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import PageTransition from '../../components/public-components/PageTransition';
import ScheduleModal from '../../components/scheduling/ScheduleModal';
import ProfileHeader from '../../components/specialist-profile/ProfileHeader';
import PresentationVideo from '../../components/specialist-profile/PresentationVideo';
import Specialties from '../../components/specialist-profile/Specialties';
import Education from '../../components/specialist-profile/Education';
import ScheduleSection from '../../components/specialist-profile/ScheduleSection';
import ProfessionalExperience from '../../components/specialist-profile/ProfessionalExperience';

interface Specialist {
  id: number;
  profile_id?: number;
  name: string;
  professional_title: string;
  health_register_number: string;
  profile_image: string;
  specialties: string[];
  target_populations: string[];
  intervention_areas: string[];
  university: string;
  graduation_year: number;
  experience_description: string;
  verification_status: string;
  schedule: any;
}

const SpecialistProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [specialist, setSpecialist] = useState<Specialist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchSpecialist = async () => {
      try {
        setLoading(true);
        // Try to fetch using the ID directly (assuming it's a profile ID)
        try {
          const response = await axios.get(`/api/profiles/public/psychologists/${id}/`, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          
          // Filter out sensitive information before logging or setting state
          const specialistData = response.data;
          if (specialistData) {
            // Remove email and phone if they exist in the response
            const { email, phone, ...safeData } = specialistData;
            console.log('API Response:', safeData);
            setSpecialist(safeData);
          } else {
            console.log('API Response: No data received');
            setSpecialist(null);
          }
          setLoading(false);
        } catch (err) {
          // If that fails, it might be a user ID, so try with a different parameter
          if (axios.isAxiosError(err) && err.response?.status === 404) {
            console.log('Profile not found with ID, trying as user ID...');
            const userResponse = await axios.get(`/api/profiles/public/psychologists/${id}/`, {
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              params: {
                lookup_by: 'user_id'
              }
            });
            
            // Filter out sensitive information before logging or setting state
            const specialistData = userResponse.data;
            if (specialistData) {
              // Remove email and phone if they exist in the response
              const { email, phone, ...safeData } = specialistData;
              console.log('API Response (user lookup):', safeData);
              setSpecialist(safeData);
            } else {
              console.log('API Response (user lookup): No data received');
              setSpecialist(null);
            }
            setLoading(false);
          } else {
            throw err; // Re-throw if it's not a 404 error
          }
        }
      } catch (err) {
        console.error('Error fetching specialist:', err);
        if (axios.isAxiosError(err)) {
          // Don't log response data that might contain sensitive info
          console.error('Status:', err.response?.status);
          
          if (err.response?.status === 404) {
            setError('No se encontró el especialista solicitado. Verifique el ID e intente nuevamente.');
          } else {
            setError('No se pudo cargar la información del especialista. Por favor, intenta de nuevo más tarde.');
          }
        } else {
          setError('Ocurrió un error inesperado. Por favor, intenta de nuevo más tarde.');
        }
        setLoading(false);
      }
    };

    if (id) {
      fetchSpecialist();
    }
  }, [id]);

  // Loading and error handling remains the same
  if (loading) {
    return (
      <PageTransition>
        <div className="container mx-auto px-6 py-12 flex justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#2A6877]"></div>
        </div>
      </PageTransition>
    );
  }

  if (error || !specialist) {
    return (
      <PageTransition>
        <div className="container mx-auto px-6 py-12 text-center">
          <p className="text-red-500">{error || 'No se encontró el especialista solicitado.'}</p>
        </div>
      </PageTransition>
    );
  }

  // Only show verified specialists
  if (specialist.verification_status !== 'VERIFIED') {
    return (
      <PageTransition>
        <div className="container mx-auto px-6 py-12 text-center">
          <p className="text-red-500">Este especialista no está disponible actualmente.</p>
        </div>
      </PageTransition>
    );
  }

  // Ensure all arrays are defined
  const specialties = specialist.specialties || [];
  const interventionAreas = specialist.intervention_areas || [];
  const targetPopulations = specialist.target_populations || [];

  // Use the profile_id for scheduling if available, otherwise fall back to id
  const profileId = specialist.profile_id || specialist.id;

  return (
    <PageTransition>
      <div className="container mx-auto px-6 py-12">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <ProfileHeader 
            name={specialist.name || 'Especialista'}
            title={specialist.professional_title || 'Psicólogo'}
            registrationNumber={specialist.health_register_number || 'No disponible'}
            profileImage={specialist.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(specialist.name || 'Especialista')}&background=2A6877&color=fff&size=400`}
            onSchedule={() => setIsScheduleModalOpen(true)}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            <div className="md:col-span-2 space-y-6">
              {/* Replace this line with separate components for video and experience */}
              <PresentationVideo videoUrl="" />
              <ProfessionalExperience experienceDescription={specialist.experience_description || ''} />
              
              <Specialties 
                therapeuticApproaches={specialties}
                specialtyDisorders={interventionAreas}
              />
              
              <Education 
                university={specialist.university || ''}
                graduationYear={specialist.graduation_year?.toString() || ''}
                targetPopulations={targetPopulations}
                professionalTitle={specialist.professional_title || ''}
              />
            </div>
            
            <div className="md:col-span-1">
              <ScheduleSection 
                onSchedule={() => setIsScheduleModalOpen(true)}
                schedule={specialist.schedule || {}}
              />
            </div>
          </div>
        </div>
      </div>
      
      {isScheduleModalOpen && (
        <ScheduleModal 
          specialistId={profileId} // Use the profile ID here
          specialistName={specialist.name || 'Especialista'}
          onClose={() => setIsScheduleModalOpen(false)}
        />
      )}
    </PageTransition>
  );
};

export default SpecialistProfilePage;