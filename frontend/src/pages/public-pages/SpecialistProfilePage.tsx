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
import { useAuth } from '../../context/AuthContext';

interface Document {
  id: number;
  document_type: string;
  file: string;
  verification_status: string;
  uploaded_at: string;
}

// Actualizar la interfaz para que coincida con la estructura real de los datos
interface TimeBlock {
  endTime: string;
  startTime: string;
  length?: number;
}

interface DaySchedule {
  enabled: boolean;
  timeBlocks: TimeBlock[];
}

interface ScheduleConfig {
  sunday?: DaySchedule;
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
}

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
  schedule_config: ScheduleConfig;
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
}

const SpecialistProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [specialist, setSpecialist] = useState<Specialist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [presentationVideoUrl, setPresentationVideoUrl] = useState('');
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchSpecialist = async () => {
      try {
        setLoading(true);
        // Corregir la URL para evitar el doble /api/
        const response = await axios.get(`/api/profiles/public/psychologists/${id}/`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Specialist data:', response.data);
        
        // Procesar los datos de respuesta
        const specialistData = response.data;
        
        // Asegurarse de que schedule_config tenga el formato correcto
        const formattedScheduleConfig: ScheduleConfig = {};
        
        // Procesar cada día de la semana si existe en los datos
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        days.forEach(day => {
          if (specialistData.schedule_config && specialistData.schedule_config[day]) {
            formattedScheduleConfig[day] = {
              enabled: specialistData.schedule_config[day].enabled || false,
              timeBlocks: specialistData.schedule_config[day].timeBlocks || []
            };
          }
        });
        
        // Crear un objeto especialista con formato adecuado
        const formattedSpecialist: Specialist = {
          ...specialistData,
          schedule_config: formattedScheduleConfig
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

  // Solo mostrar especialistas verificados
  if (specialist.verification_status !== 'VERIFIED') {
    return (
      <PageTransition>
        <div className="container mx-auto px-6 py-12 text-center">
          <p className="text-red-500">Este especialista no está disponible actualmente.</p>
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

  return (
    <PageTransition>
      <div className="container mx-auto px-6 py-12">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <ProfileHeader 
            name={specialistName}
            title={specialist.professional_title || 'Psicólogo'}
            registrationNumber={specialist.health_register_number || 'No disponible'}
            profileImage={specialist.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(specialistName)}&background=2A6877&color=fff&size=400`}
            onSchedule={() => setIsScheduleModalOpen(true)}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            <div className="md:col-span-2 space-y-6">
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
                onSchedule={() => {
                  if (user && user.user_type === 'client') {
                    setIsScheduleModalOpen(true);
                  } else if (!user) {
                    // Redirigir a login o mostrar mensaje
                    alert('Debes iniciar sesión como cliente para agendar una cita');
                  } else {
                    alert('Solo los clientes pueden agendar citas');
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {isScheduleModalOpen && (
        <ScheduleModal 
          // Asegúrate de que estás pasando el ID del perfil, no el ID del usuario
          specialistId={specialist.id} // Debería ser el ID del perfil (9)
          specialistName={specialistName}
          schedule={{ schedule_config: specialist.schedule_config }}
          onClose={() => setIsScheduleModalOpen(false)}
        />
      )}
    </PageTransition>
  );
};

export default SpecialistProfilePage;