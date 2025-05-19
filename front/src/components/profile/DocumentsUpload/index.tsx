import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { uploadDocument, getDocuments } from '../../../services/documentService';
import DocumentHeader from './DocumentHeader';
import DocumentsList from './DocumentsList';
import InfoBox from './InfoBox';
import { Document } from './types';
import { requiredDocumentTypes } from '../DocumentsUpload';

interface DocumentsUploadProps {
  profile?: any;
  onSave?: (data: any) => void;
  isLoading: boolean;
  onLoadingChange?: (loading: boolean) => void;
}

const DocumentsUpload = ({  isLoading, onLoadingChange, onSave }: DocumentsUploadProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [localLoading, setLocalLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [pendingUploads, setPendingUploads] = useState<Record<string, File>>({});

  useEffect(() => {
    if (!localLoading) {
      loadDocuments();
    }
  }, []);
  
  const loadDocuments = async () => {
    if (localLoading) return;
    
    setLocalLoading(true);
    if (onLoadingChange) onLoadingChange(true);
    
    try {
      const data = await getDocuments();
      
      if (Array.isArray(data)) {
        setDocuments(data);
        console.log("Documents loaded:", data);
      } else {
        console.log("Invalid document data received:", data);
        setDocuments([]);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('No se pudieron cargar los documentos');
      setDocuments([]);
    } finally {
      setLocalLoading(false);
      if (onLoadingChange) onLoadingChange(false);
    }
  };

  // Verificar si hay documentos que pueden ser editados (rechazados o no subidos)
  const hasEditableDocuments = () => {
    // Obtener todos los tipos de documentos requeridos
    const requiredTypes = requiredDocumentTypes.map(doc => doc.type);
    
    // Verificar si hay documentos rechazados
    const hasRejectedDocs = documents.some(doc => doc.verification_status === 'rejected');
    
    // Verificar si hay documentos pendientes de subir
    const uploadedDocTypes = documents.map(doc => doc.document_type);
    const hasPendingDocs = requiredTypes.some(type => !uploadedDocTypes.includes(type));
    
    return hasRejectedDocs || hasPendingDocs;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setPendingUploads(prev => ({
      ...prev,
      [documentType]: file
    }));
    
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        // Preview logic if needed
      };
      reader.readAsDataURL(file);
    }
    
    toast.info(`${file.name} listo para subir. Presiona "Guardar cambios" para confirmar.`);
  };

  const handleSaveChanges = async () => {
    if (Object.keys(pendingUploads).length === 0) {
      toast.info('No hay cambios para guardar');
      setIsEditMode(false);
      return;
    }
    
    setLocalLoading(true);
    if (onLoadingChange) onLoadingChange(true);
    
    try {
      for (const [documentType, file] of Object.entries(pendingUploads)) {
        setUploading(prev => ({ ...prev, [documentType]: true }));
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('document_type', documentType);
        formData.append('description', '');
        
        await uploadDocument(formData);
      }
      
      toast.success('Documentos guardados correctamente');
      setPendingUploads({});
      await loadDocuments();
      setIsEditMode(false);
      
      if (onSave) {
        onSave(documents);
      }
    } catch (error) {
      console.error('Error uploading documents:', error);
      toast.error('Error al guardar los documentos');
    } finally {
      setUploading({});
      setLocalLoading(false);
      if (onLoadingChange) onLoadingChange(false);
    }
  };

  const cancelEdit = () => {
    setPendingUploads({});
    setIsEditMode(false);
    toast.info('Cambios cancelados');
  };

  const getDocumentByType = (type: string) => {
    return documents.find(d => d.document_type === type);
  };

  return (
    <div className="space-y-6">
      <DocumentHeader 
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        cancelEdit={cancelEdit}
        handleSaveChanges={handleSaveChanges}
        isLoading={localLoading || isLoading}
        hasPendingUploads={Object.keys(pendingUploads).length > 0}
        canEdit={hasEditableDocuments()}
      />

      {localLoading || isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2A6877]"></div>
        </div>
      ) : (
        <DocumentsList 
          documents={documents}
          getDocumentByType={getDocumentByType}
          isEditMode={isEditMode}
          pendingUploads={pendingUploads}
          uploading={uploading}
          handleFileSelect={handleFileSelect}
        />
      )}

      <InfoBox />
    </div>
  );
};

export default DocumentsUpload;