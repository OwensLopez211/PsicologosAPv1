import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { DocumentIcon, VideoCameraIcon, IdentificationIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import { uploadDocument, getDocuments } from '../../services/documentService';
import DocumentHeader from './DocumentsUpload/DocumentHeader';
import DocumentsList from './DocumentsUpload/DocumentsList';
import { Document } from './DocumentsUpload/types';

interface DocumentsUploadProps {
  profile?: any;
  onSave?: (data: any) => void;
  isLoading: boolean;
  onLoadingChange?: (loading: boolean) => void;
}

const DocumentsUpload = ({ isLoading, onLoadingChange }: DocumentsUploadProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [pendingUploads, setPendingUploads] = useState<Record<string, File>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [localLoading, setLocalLoading] = useState(false);

  // Define required documents
  const requiredDocumentTypes = [
    {
      type: 'presentation_video',
      name: 'Video de presentación',
      icon: <VideoCameraIcon className="h-6 w-6" />,
      description: 'Un breve video donde te presentas y hablas de tu experiencia profesional (máx. 2 minutos)'
    },
    {
      type: 'registration_certificate',
      name: 'Certificado de inscripción en Registro Nacional',
      icon: <ClipboardDocumentCheckIcon className="h-6 w-6" />,
      description: 'Certificado de inscripción en Registro Nacional de Prestadores Individuales de Salud'
    },
    {
      type: 'professional_id',
      name: 'Carnet profesional',
      icon: <IdentificationIcon className="h-6 w-6" />,
      description: 'Fotos del carnet profesional por ambos lados'
    },
    {
      type: 'specialty_document',
      name: 'Documento de especialidad',
      icon: <DocumentIcon className="h-6 w-6" />,
      description: 'Documento que describa el tipo de terapia que realizas, trastornos que tratas e información relevante para justificar tu tarifa'
    }
  ];

  // Modify the useEffect to add a loading flag to prevent multiple requests
  useEffect(() => {
    // Only load documents if not already loading
    if (!localLoading) {
      loadDocuments();
    }
    
    // Cleanup function
    return () => {
      // Set mounted flag to false when component unmounts
    };
  }, []);
  
  const loadDocuments = async () => {
    // Prevent multiple simultaneous requests
    if (localLoading) return;
    
    setLocalLoading(true);
    if (onLoadingChange) onLoadingChange(true);
    
    try {
      const data = await getDocuments();
      
      // Check if data is valid before setting state
      if (Array.isArray(data)) {
        setDocuments(data as Document[]);
        console.log("Documents loaded:", data);
      } else {
        // If data is not an array, set empty array
        console.log("Invalid document data received:", data);
        setDocuments([]);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('No se pudieron cargar los documentos');
      setDocuments([]); // Set empty array on error
    } finally {
      setLocalLoading(false);
      if (onLoadingChange) onLoadingChange(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Add file to pending uploads
    setPendingUploads(prev => ({
      ...prev,
      [documentType]: file
    }));
    
    // Mostrar información al usuario
    toast.info(`${file.name} listo para subir. Presiona "Guardar cambios" para confirmar.`);
  };

  const handleSaveChanges = async () => {
    // Si no hay cambios pendientes, salir del modo edición
    if (Object.keys(pendingUploads).length === 0) {
      toast.info('No hay cambios para guardar');
      setIsEditMode(false);
      return;
    }

    setLocalLoading(true);
    if (onLoadingChange) onLoadingChange(true);

    let uploadSuccess = true;

    try {
      // Subir sólo los documentos pendientes
      for (const [docType, file] of Object.entries(pendingUploads)) {
        setUploading(prev => ({ ...prev, [docType]: true }));

        const formData = new FormData();
        formData.append('file', file);
        formData.append('document_type', docType);
        formData.append('description', '');

        try {
          await uploadDocument(formData);
        } catch (error) {
          console.error(`Error uploading ${docType}:`, error);
          toast.error(`Error al subir ${docType}`);
          uploadSuccess = false;
        } finally {
          setUploading(prev => ({ ...prev, [docType]: false }));
        }
      }

      // Limpiar uploads pendientes
      setPendingUploads({});
      
      // Recargar documentos para mostrar los cambios
      await loadDocuments();
      
      // Salir del modo edición
      setIsEditMode(false);

      if (uploadSuccess) {
        toast.success('Documentos guardados correctamente');
      } else {
        toast.warning('Algunos documentos no se pudieron guardar. Por favor, intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error saving documents:', error);
      toast.error('Error al guardar los documentos');
    } finally {
      setLocalLoading(false);
      if (onLoadingChange) onLoadingChange(false);
    }
  };

  const cancelEdit = () => {
    // Limpiar uploads pendientes
    setPendingUploads({});
    // Salir del modo edición
    setIsEditMode(false);
    // Notificar al usuario
    toast.info('Cambios cancelados');
  };

  const getDocumentByType = (type: string): Document | undefined => {
    return documents.find(d => d.document_type === type);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <DocumentHeader 
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        cancelEdit={cancelEdit}
        handleSaveChanges={handleSaveChanges}
        isLoading={localLoading || isLoading}
        hasPendingUploads={Object.keys(pendingUploads).length > 0}
      />

      {localLoading || isLoading ? (
        <div className="flex justify-center py-6 sm:py-8">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-[#2A6877]"></div>
        </div>
      ) : (
        <>
          <DocumentsList 
            documents={documents}
            getDocumentByType={getDocumentByType}
            isEditMode={isEditMode}
            pendingUploads={pendingUploads}
            uploading={uploading}
            handleFileSelect={handleFileSelect}
          />

          <div className="bg-blue-50 p-2 sm:p-4 rounded-lg mt-4 sm:mt-6">
            <div className="flex">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-2 sm:ml-3">
                <h3 className="text-xs sm:text-sm font-medium text-blue-800">Información importante</h3>
                <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-blue-700">
                  <ul className="list-disc pl-4 sm:pl-5 space-y-0.5 sm:space-y-1">
                    <li>El video de presentación debe tener una duración máxima de 2 minutos.</li>
                    <li>Los documentos deben estar en formato PDF, JPG o PNG.</li>
                    <li>El tamaño máximo por archivo es de 5MB.</li>
                    <li>La verificación puede tomar hasta 48 horas hábiles.</li>
                    <li>Te notificaremos por correo electrónico cuando tu cuenta sea verificada.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DocumentsUpload;