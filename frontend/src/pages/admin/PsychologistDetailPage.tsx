import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import PriceManagement from './components/psychologist-detail/PriceManagement';

const PsychologistDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [psychologist, setPsychologist] = useState<Psychologist | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchPsychologistData(parseInt(id));
    }
  }, [id]);

  const fetchPsychologistData = async (psychologistId: number) => {
    try {
      setLoading(true);
      const data = await PsychologistService.getPsychologistById(psychologistId);
      setPsychologist(data);
    } catch (error) {
      console.error('Error fetching psychologist details:', error);
      toast.error('Error al cargar los detalles del psicólogo');
    } finally {
      setLoading(false);
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

  const handleViewDocument = (documentUrl: string) => {
    // Make sure the URL is absolute and properly formatted
    if (!documentUrl.startsWith('http')) {
      // If it's a relative URL, convert it to absolute
      const baseUrl = window.location.origin;
      documentUrl = `${baseUrl}${documentUrl.startsWith('/') ? '' : '/'}${documentUrl}`;
    }
    
    // Open in a new tab
    window.open(documentUrl, '_blank');
  };

  const handleDownloadDocument = async (documentId: number, fileName: string) => {
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
      <div className="container mx-auto px-4 py-8">
        <button 
          onClick={() => navigate('/admin/dashboard/psychologists')}
          className="flex items-center text-[#2A6877] mb-6 hover:underline"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          Volver al listado
        </button>

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
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                suggested_price={psychologist.suggested_price}
              />
            </div>

            {/* Price Management Section - New Component */}
            <div className="mt-8">
              <PriceManagement 
                psychologistId={parseInt(id as string)}
                suggestedPrice={psychologist.suggested_price}
                onPriceUpdated={() => fetchPsychologistData(parseInt(id as string))}
              />
            </div>

            {/* Specialties and Target Populations */}
            <div className="mt-8">
              <SpecialtiesAndPopulations 
                specialties={psychologist.specialties}
                target_populations={psychologist.target_populations}
                intervention_areas={psychologist.intervention_areas}
                experience_description={psychologist.experience_description}
              />
            </div>

            {/* Documents Section */}
            <div className="mt-8">
              <DocumentsSection 
                documents={psychologist.verification_documents}
                onVerify={handleDocumentVerification}
                onReject={handleDocumentRejection}
                onDownload={handleDocumentDownload}
              />
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default PsychologistDetailPage;