import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import PageTransition from '../../components/animations/PageTransition';
import ProfileHeader from '../../components/specialist-profile/ProfileHeader';
import PresentationVideo from '../../components/specialist-profile/PresentationVideo';
import Specialties from '../../components/specialist-profile/Specialties';
import Education from '../../components/specialist-profile/Education';
import ProfessionalExperience from '../../components/specialist-profile/ProfessionalExperience';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface Document {
  id: number;
  document_type: string;
  file: string;
  verification_status: string;
  uploaded_at: string;
}

// Removed TimeBlock, DaySchedule, and ScheduleConfig interfaces

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

interface Specialist {
  id: number;
  user: User;
  profile_image: string;
  professional_title: string;
  health_register_number: string;
  specialties: string[];
  target_populations: string[];
  intervention_areas: string[];
  university: string;
  graduation_year: number;
  experience_description: string;
  verification_status: string;
  verification_documents?: Document[];
  presentation_video_url?: string;
  rut: string;
  phone: string;
  city: string;
  region: string;
  gender: string;
  bank_account_number?: string;
  bank_account_type?: string;
  bank_account_owner?: string;
  bank_account_owner_rut?: string;
  bank_account_owner_email?: string;
  bank_name?: string;
  // Removed schedule_config
}

const SpecialistProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [specialist, setSpecialist] = useState<Specialist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [presentationVideoUrl, setPresentationVideoUrl] = useState('');
// Remove unused user declaration since it's not being used
  
  useEffect(() => {
    const fetchSpecialist = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/profiles/public/psychologists/${id}/`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Specialist data:', response.data);
        
        // Procesar los datos de respuesta
        const specialistData = response.data;
        
        // Removed schedule_config formatting
        
        // Crear un objeto especialista con formato adecuado
        const formattedSpecialist: Specialist = {
          ...specialistData
          // Removed schedule_config
        };
        
        // Manejar la URL del video de presentación
        if (specialistData.presentation_video_url) {
          console.log('Found presentation video:', specialistData.presentation_video_url);
          setPresentationVideoUrl(specialistData.presentation_video_url);
        } else if (specialistData.verification_documents) {
          // Intentar encontrar el video de presentación en los documentos de verificación
          const videoDoc = specialistData.verification_documents.find(
            (doc: Document) => doc.document_type === 'presentation_video' && doc.verification_status === 'verified'
          );
          
          if (videoDoc && videoDoc.file) {
            console.log('Found presentation video in documents:', videoDoc.file);
            setPresentationVideoUrl(videoDoc.file);
            formattedSpecialist.presentation_video_url = videoDoc.file;
          }
        }
        
        // Add debug logging to clearly show the IDs
        console.log('Specialist profile ID:', specialistData.id);
        console.log('Specialist user ID:', specialistData.user.id);
        
        setSpecialist(formattedSpecialist);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching specialist by ID:', error);
        setError('No se pudo cargar la información del especialista. Por favor, intenta de nuevo más tarde.');
        setLoading(false);
      }
    };
  
    if (id) {
      fetchSpecialist();
    }
  }, [id]);

  // Loading and error handling
  if (loading) {
    return (
      <PageTransition>
        <div className="container mx-auto px-6 py-16 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#2A6877]"></div>
          <p className="mt-4 text-gray-600">Cargando perfil del especialista...</p>
        </div>
      </PageTransition>
    );
  }

  // Error state with improved UI
  if (error || !specialist) {
    return (
      <PageTransition>
        <div className="container mx-auto px-6 py-16 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="bg-red-50 p-6 rounded-xl text-center max-w-md">
            <ExclamationCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-red-800 mb-2">No se pudo cargar el perfil</h2>
            <p className="text-red-600 mb-4">{error || 'No se encontró el especialista solicitado.'}</p>
            <button 
              onClick={() => navigate('/specialists')}
              className="px-4 py-2 bg-[#2A6877] text-white rounded-md hover:bg-[#1d4e5a] transition-colors"
            >
              Ver otros especialistas
            </button>
          </div>
        </div>
      </PageTransition>
    );
  }

  // Verification status check with improved UI
  if (specialist.verification_status !== 'VERIFIED') {
    return (
      <PageTransition>
        <div className="container mx-auto px-6 py-16 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="bg-yellow-50 p-6 rounded-xl text-center max-w-md">
            <ExclamationCircleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-yellow-800 mb-2">Especialista no disponible</h2>
            <p className="text-yellow-700 mb-4">Este especialista no está disponible actualmente.</p>
            <button 
              onClick={() => navigate('/specialists')}
              className="px-4 py-2 bg-[#2A6877] text-white rounded-md hover:bg-[#1d4e5a] transition-colors"
            >
              Ver otros especialistas
            </button>
          </div>
        </div>
      </PageTransition>
    );
  }

  // Asegurar que todos los arrays estén definidos
  const specialties = specialist.specialties || [];
  const interventionAreas = specialist.intervention_areas || [];
  const targetPopulations = specialist.target_populations || [];

  // Obtener el nombre completo del especialista
  const specialistName = specialist.user ? 
    `${specialist.user.first_name} ${specialist.user.last_name}`.trim() : 
    'Especialista';

  // Removed handleScheduleClick function

  return (
    <PageTransition>
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <ProfileHeader 
            name={specialistName}
            title={specialist.professional_title || 'Psicólogo'}
            registrationNumber={specialist.health_register_number || 'No disponible'}
            profileImage={specialist.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(specialistName)}&background=2A6877&color=fff&size=400`}
            psychologistId={specialist.id} // Pass the specialist ID here
            verificationStatus={specialist.verification_status}
          />
          
          <div className="grid grid-cols-1 gap-6 p-4 sm:p-6">
            <div className="space-y-6">
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
          </div>
        </motion.div>
      </div>
      
      {/* Removed ScheduleModal */}
    </PageTransition>
  );
};

export default SpecialistProfilePage;