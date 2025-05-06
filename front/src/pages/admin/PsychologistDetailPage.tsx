import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PsychologistService, { Psychologist } from '../../services/PsychologistService';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import PageTransition from '../../components/animations/PageTransition';

// Import modular components
import ProfileHeader from './components/psychologist-detail/ProfileHeader';
import PersonalInfo from './components/psychologist-detail/PersonalInfo';
import ProfessionalInfo from './components/psychologist-detail/ProfessionalInfo';
import SpecialtiesAndPopulations from './components/psychologist-detail/SpecialtiesAndPopulations';
import DocumentsSection from './components/psychologist-detail/DocumentsSection';
import PricingManagement from './components/psychologist-detail/PricingManagement';
import ProfessionalExperiences from './components/psychologist-detail/ProfessionalExperiences';
import PsychologistSchedule from './components/psychologist-detail/PsychologistSchedule';
import BankingInfo from './components/psychologist-detail/BankingInfo';

const PsychologistDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [psychologist, setPsychologist] = useState<Psychologist | null>(null);
  const [loading, setLoading] = useState(true);
  // Add these two state variables
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null);
  const [approvedPrice, setApprovedPrice] = useState<number | null>(null);
const { } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchPsychologistData(parseInt(id));
    }
  }, [id]);

  // Add this function to fetch pricing data
  const fetchPsychologistData = async (psychologistId: number) => {
    try {
      setLoading(true);
      const data = await PsychologistService.getPsychologistById(psychologistId);
      setPsychologist(data);
      
      // Fetch pricing data
      await fetchPricingData(psychologistId);
    } catch (error) {
      console.error('Error fetching psychologist details:', error);
      toast.error('Error al cargar los detalles del psicólogo');
    } finally {
      setLoading(false);
    }
  };
  
  // Add this new function to fetch pricing data separately
  const fetchPricingData = async (psychologistId: number) => {
    try {
      // Log the operation
      console.log(`Fetching pricing data for psychologist ID: ${psychologistId}`);
      
      // Fetch suggested price
      const suggestedPriceData = await PsychologistService.getPsychologistSuggestedPrice(psychologistId);
      setSuggestedPrice(suggestedPriceData.price);
      console.log(`Suggested price: ${suggestedPriceData.price}`);
      
      // Fetch approved price
      const approvedPriceData = await PsychologistService.getPsychologistApprovedPrice(psychologistId);
      setApprovedPrice(approvedPriceData.price);
      console.log(`Approved price: ${approvedPriceData.price}`);
    } catch (error) {
      console.error('Error fetching pricing data:', error);
      // Don't show error toast for pricing data - just set to null
      setSuggestedPrice(null);
      setApprovedPrice(null);
    }
  };
  
  // Add this handler for updating the approved price
  const handleUpdateApprovedPrice = async (price: number) => {
    if (!id) return;
    
    try {
      const response = await PsychologistService.updatePsychologistApprovedPrice(parseInt(id), price);
      setApprovedPrice(response.price);
      return Promise.resolve();
    } catch (error) {
      console.error('Error updating approved price:', error);
      return Promise.reject(error);
    }
  };
  
  // Add this handler for refreshing prices
  const handleRefreshPrices = async () => {
    if (!id) return Promise.reject(new Error('No psychologist ID'));
    
    try {
      await fetchPricingData(parseInt(id));
      return Promise.resolve();
    } catch (error) {
      console.error('Error refreshing prices:', error);
      return Promise.reject(error);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!psychologist || !id) return;
    
    try {
      await PsychologistService.updatePsychologistStatus(parseInt(id), newStatus);
      toast.success(`Estado actualizado a ${newStatus}`);
      // Refresh data
      fetchPsychologistData(parseInt(id));
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  const handleDocumentVerification = async (documentId: number, status: string) => {
    try {
      toast.loading('Actualizando estado del documento...');
      await PsychologistService.updateDocumentStatus(documentId, status);
      toast.dismiss();
      toast.success(`Documento ${status === 'verified' ? 'aprobado' : 'actualizado'} correctamente`);
      
      // Refresh data
      if (id) {
        fetchPsychologistData(parseInt(id));
      }
    } catch (error) {
      console.error('Error updating document status:', error);
      toast.dismiss();
      toast.error('Error al actualizar el estado del documento');
    }
  };

  // Updated to accept rejection reason from the modal
  const handleDocumentRejection = async (documentId: number, rejectionReason: string) => {
    try {
      toast.loading('Rechazando documento...');
      await PsychologistService.updateDocumentStatus(documentId, 'rejected', rejectionReason);
      toast.dismiss();
      toast.success('Documento rechazado correctamente');
      
      // Refresh data
      if (id) {
        fetchPsychologistData(parseInt(id));
      }
    } catch (error) {
      console.error('Error rejecting document:', error);
      toast.dismiss();
      toast.error('Error al rechazar el documento');
    }
  };

  // Add the async keyword here to fix the error
  // Rename the function to match what DocumentsSection expects
  const handleDocumentDownload = async (documentId: number, fileName: string) => {
    if (!psychologist || !psychologist.id) {
      toast.error('No se pudo obtener la información del psicólogo');
      return;
    }
    
    try {
      // Show loading indicator
      toast.loading('Descargando documento...');
      
      // Get the document blob with authentication
      const blob = await PsychologistService.downloadDocument(psychologist.id, documentId, fileName);
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      window.URL.revokeObjectURL(url);
      
      toast.dismiss();
      toast.success('Documento descargado correctamente');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.dismiss();
      toast.error('Error al descargar el documento');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2A6877]"></div>
      </div>
    );
  }

  if (!psychologist) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Psicólogo no encontrado</h2>
        <p className="text-gray-600 mb-6">No se pudo encontrar la información del psicólogo solicitado.</p>
        <button 
          onClick={() => navigate('/admin/dashboard/psychologists')}
          className="px-4 py-2 bg-[#2A6877] text-white rounded-md hover:bg-[#1d4e5f] transition-colors"
        >
          Volver al listado
        </button>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Botón "Volver a Especialistas" según la imagen */}
        <Link 
          to="/admin/dashboard/psychologists"
          className="flex items-center text-[#2A6877] mb-4 sm:mb-6 border border-gray-300 rounded-md px-3 py-2 w-fit shadow-sm hover:bg-gray-50 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Volver a Especialistas
        </Link>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <ProfileHeader 
            user={psychologist.user}
            profile_image={psychologist.profile_image}
            professional_title={psychologist.professional_title}
            verification_status={psychologist.verification_status}
            onStatusChange={handleStatusChange}
          />

          {/* Content */}
          <div className="p-3 sm:p-6">
            {/* Información personal y profesional en grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Personal Information */}
              <PersonalInfo 
                user={psychologist.user}
                phone={psychologist.phone}
                rut={psychologist.rut}
                city={psychologist.city}
                region={psychologist.region}
              />

              {/* Professional Information */}
              <ProfessionalInfo 
                university={psychologist.university}
                graduation_year={psychologist.graduation_year}
                health_register_number={psychologist.health_register_number}
              />
            </div>

            {/* Bloques de información con fondo gris entre ellos */}
            <div className="my-6 md:my-8 space-y-6 md:space-y-8">
              {/* Pricing Management */}
              <PricingManagement
                psychologistId={id ? parseInt(id) : 0}
                suggestedPrice={suggestedPrice}
                approvedPrice={approvedPrice}
                onUpdateApprovedPrice={handleUpdateApprovedPrice}
                onRefreshPrices={handleRefreshPrices}
              />

              {/* Banking Information */}
              <BankingInfo 
                bankAccountNumber={psychologist.bank_account_number}
                bankAccountOwner={psychologist.bank_account_owner}
                bankAccountOwnerRut={psychologist.bank_account_owner_rut}
                bankAccountOwnerEmail={psychologist.bank_account_owner_email}
                bankAccountType={psychologist.bank_account_type}
                bankAccountTypeDisplay={psychologist.bank_account_type_display}
                bankName={psychologist.bank_name}
              />

              {/* Professional Experiences */}
              <ProfessionalExperiences 
                experiences={psychologist.experiences || psychologist.professional_experiences || []}
              />

              {/* Horario del Psicólogo */}
              <PsychologistSchedule 
                psychologistId={id ? parseInt(id) : 0}
              />

              {/* Specialties and Target Populations */}
              <SpecialtiesAndPopulations 
                specialties={psychologist.specialties}
                target_populations={psychologist.target_populations}
                intervention_areas={psychologist.intervention_areas}
                experience_description={psychologist.experience_description}
              />

              {/* Documents Section */}
              <DocumentsSection 
                documents={psychologist.verification_documents}
                onVerifyDocument={handleDocumentVerification}
                onRejectDocument={handleDocumentRejection}
                onDownloadDocument={handleDocumentDownload}
              />
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default PsychologistDetailPage;