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
}

const SpecialistProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [specialist, setSpecialist] = useState<Specialist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [presentationVideoUrl, setPresentationVideoUrl] = useState('');
  
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
        
        // Process response data
        const specialistData = response.data;
        
        // Create formatted specialist object
        const formattedSpecialist: Specialist = {
          ...specialistData
        };
        
        // Handle presentation video URL
        if (specialistData.presentation_video_url) {
          console.log('Found presentation video:', specialistData.presentation_video_url);
          setPresentationVideoUrl(specialistData.presentation_video_url);
        } else if (specialistData.verification_documents) {
          // Try to find presentation video in verification documents
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

  // Loading state with enhanced animation
  if (loading) {
    return (
      <PageTransition>
        <div className="container mx-auto px-6 py-16 flex flex-col items-center justify-center min-h-[60vh]">
          <motion.div 
            className="flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-[#2A6877] opacity-25"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#2A6877]"></div>
            </div>
            <p className="mt-6 text-gray-600 font-medium">Cargando perfil del especialista...</p>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  // Error state with improved UI
  if (error || !specialist) {
    return (
      <PageTransition>
        <div className="container mx-auto px-6 py-16 flex flex-col items-center justify-center min-h-[60vh]">
          <motion.div 
            className="bg-red-50 p-8 rounded-xl text-center max-w-md border border-red-100 shadow-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <ExclamationCircleIcon className="h-14 w-14 text-red-500 mx-auto mb-5" />
            <h2 className="text-xl font-semibold text-red-800 mb-3">No se pudo cargar el perfil</h2>
            <p className="text-red-600 mb-5">{error || 'No se encontró el especialista solicitado.'}</p>
            <button 
              onClick={() => navigate('/especialistas')}
              className="px-5 py-2.5 bg-[#2A6877] text-white rounded-lg hover:bg-[#1d4e5a] transition-colors flex items-center justify-center mx-auto shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Ver otros especialistas
            </button>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  // Verification status check with improved UI
  if (specialist.verification_status !== 'VERIFIED') {
    return (
      <PageTransition>
        <div className="container mx-auto px-6 py-16 flex flex-col items-center justify-center min-h-[60vh]">
          <motion.div 
            className="bg-yellow-50 p-8 rounded-xl text-center max-w-md border border-yellow-100 shadow-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <ExclamationCircleIcon className="h-14 w-14 text-yellow-500 mx-auto mb-5" />
            <h2 className="text-xl font-semibold text-yellow-800 mb-3">Especialista no disponible</h2>
            <p className="text-yellow-700 mb-5">Este especialista no está disponible actualmente. Por favor, consulta nuestro directorio de especialistas verificados.</p>
            <button 
              onClick={() => navigate('/especialistas')}
              className="px-5 py-2.5 bg-[#2A6877] text-white rounded-lg hover:bg-[#1d4e5a] transition-colors flex items-center justify-center mx-auto shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Ver otros especialistas
            </button>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  // Ensure all arrays are defined
  const specialties = specialist.specialties || [];
  const interventionAreas = specialist.intervention_areas || [];
  const targetPopulations = specialist.target_populations || [];

  // Get specialist's full name
  const specialistName = specialist.user ? 
    `${specialist.user.first_name} ${specialist.user.last_name}`.trim() : 
    'Especialista';

  // Animation variants for staggered content
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 pt-6 pb-10">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Back Navigation - Repositioned to top */}
            <motion.div 
              className="mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <button 
                onClick={() => navigate('/especialistas')}
                className="flex items-center px-4 py-2 bg-white border border-[#2A6877]/20 rounded-lg shadow-sm hover:bg-[#2A6877]/5 transition-colors text-[#2A6877] font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Volver a Especialistas
              </button>
            </motion.div>
            
            {/* Header */}
            <ProfileHeader 
              name={specialistName}
              title={specialist.professional_title || 'Psicólogo'}
              registrationNumber={specialist.health_register_number || 'No disponible'}
              profileImage={specialist.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(specialistName)}&background=2A6877&color=fff&size=400`}
              psychologistId={specialist.id}
              verificationStatus={specialist.verification_status}
            />
            
            {/* Main Content */}
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Left Column - Video and Experience */}
              <motion.div 
                className="lg:col-span-2 space-y-6"
                variants={itemVariants}
              >
                <PresentationVideo videoUrl={presentationVideoUrl} />
                {/* Using the enhanced ProfessionalExperience component */}
                <ProfessionalExperience experienceDescription={specialist.experience_description || ''} />
              </motion.div>
              
              {/* Right Column - Specialties and Education */}
              <motion.div 
                className="space-y-6"
                variants={itemVariants}
              >
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
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default SpecialistProfilePage;