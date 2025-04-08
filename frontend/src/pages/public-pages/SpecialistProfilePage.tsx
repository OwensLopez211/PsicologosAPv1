import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import PageTransition from '../../components/animations/PageTransition';
import ScheduleModal from '../../components/scheduling/ScheduleModal';
import ProfileHeader from '../../components/specialist-profile/ProfileHeader';
import PresentationVideo from '../../components/specialist-profile/PresentationVideo';
import Specialties from '../../components/specialist-profile/Specialties';
import Education from '../../components/specialist-profile/Education';
import ScheduleSection from '../../components/specialist-profile/ScheduleSection';
import ProfessionalExperience from '../../components/specialist-profile/ProfessionalExperience';

interface Document {
  id: number;
  document_type: string;
  file: string;
  verification_status: string;
  uploaded_at: string;
}

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
  schedule_config: any; // Update this to match the schedule structure
  verification_documents?: Document[];
}

const SpecialistProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [specialist, setSpecialist] = useState<Specialist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [presentationVideoUrl, setPresentationVideoUrl] = useState('');
  
  // Remove the comment that was added by the previous update
  useEffect(() => {
    const fetchSpecialist = async () => {
      try {
        setLoading(true);
        try {
          const response = await axios.get(`/api/profiles/public/psychologists/${id}/`, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          
          console.log('Specialist data:', response.data);
          
          // Process the response data
          const specialistData = response.data;
          
          // Create a properly formatted specialist object
          const formattedSpecialist: Specialist = {
            id: specialistData.id,
            name: `${specialistData.user?.first_name || ''} ${specialistData.user?.last_name || ''}`.trim(),
            professional_title: specialistData.professional_title || '',
            health_register_number: specialistData.health_register_number || '',
            profile_image: specialistData.profile_image || '',
            specialties: specialistData.specialties || [],
            target_populations: specialistData.target_populations || [],
            intervention_areas: specialistData.intervention_areas || [],
            university: specialistData.university || '',
            graduation_year: specialistData.graduation_year || 0,
            experience_description: specialistData.experience_description || '',
            verification_status: specialistData.verification_status || '',
            schedule_config: specialistData.schedule_config || {}, // Update this line
            verification_status: specialistData.verification_status || '',
          };
          
          // Make sure we're getting the presentation_video_url from the response
          if (specialistData.presentation_video_url) {
            console.log('Found presentation video:', specialistData.presentation_video_url);
            setPresentationVideoUrl(specialistData.presentation_video_url);
            // Add the URL to the specialist object as well
            formattedSpecialist.presentation_video_url = specialistData.presentation_video_url;
          } else if (specialistData.verification_documents) {
            // Try to find the presentation video in verification documents
            const videoDoc = specialistData.verification_documents.find(
              (doc: Document) => doc.document_type === 'presentation_video' && doc.verification_status === 'verified'
            );
            
            if (videoDoc && videoDoc.file) {
              console.log('Found presentation video in documents:', videoDoc.file);
              setPresentationVideoUrl(videoDoc.file);
              formattedSpecialist.presentation_video_url = videoDoc.file;
            }
          }
          
          setSpecialist(formattedSpecialist);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching specialist by ID:', error);
          setError('No se pudo cargar la información del especialista. Por favor, intenta de nuevo más tarde.');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in fetchSpecialist:', error);
        setError('No se pudo cargar la información del especialista. Por favor, intenta de nuevo más tarde.');
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
              {/* Use the presentationVideoUrl state variable instead of the specialist object property */}
              <PresentationVideo videoUrl={presentationVideoUrl} />
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
                schedule={{ schedule_config: specialist.schedule_config }}
                onSchedule={() => setIsScheduleModalOpen(true)}
              />
            </div>
          </div>
        </div>
      </div>
      
      {isScheduleModalOpen && (
        <ScheduleModal 
          specialistId={profileId}
          specialistName={specialist.name || 'Especialista'}
          onClose={() => setIsScheduleModalOpen(false)}
        />
      )}
    </PageTransition>
  );
};

export default SpecialistProfilePage;