import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { DocumentIcon, VideoCameraIcon, IdentificationIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import { uploadDocument, getDocuments, deleteDocument } from '../../services/documentService';

interface DocumentsUploadProps {
  profile?: any;
  onSave?: (data: any) => void;
  isLoading: boolean;
  onLoadingChange?: (loading: boolean) => void;
}

interface Document {
  id?: number;
  document_type: string;
  document_type_display?: string;
  file?: File | null;
  file_url?: string;
  description?: string;
  verification_status?: 'pending' | 'approved' | 'rejected' | 'not_uploaded';
  rejection_reason?: string | null;
  uploaded_at?: string;
}

const DocumentsUpload = ({ profile, isLoading, onLoadingChange }: DocumentsUploadProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
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
    // Use a ref to track if component is mounted
    const isMounted = true;
    
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
        setDocuments(data);
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Update uploading state
    setUploading(prev => ({ ...prev, [documentType]: true }));
    if (onLoadingChange) onLoadingChange(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', documentType);
      formData.append('description', ''); // Optional description
      
      await uploadDocument(formData);
      toast.success('Documento subido correctamente');
      
      // Reload documents to show the newly uploaded one
      await loadDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Error al subir el documento');
    } finally {
      setUploading(prev => ({ ...prev, [documentType]: false }));
      if (onLoadingChange) onLoadingChange(false);
    }
  };

  const getDocumentStatus = (type: string): 'pending' | 'approved' | 'rejected' | 'not_uploaded' => {
    const doc = documents.find(d => d.document_type === type);
    return doc?.verification_status || 'not_uploaded';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">Pendiente de revisión</span>;
      case 'approved':
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Aprobado</span>;
      case 'rejected':
        return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">Rechazado</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">No subido</span>;
    }
  };

  const getDocumentByType = (type: string) => {
    return documents.find(d => d.document_type === type);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Documentos para Verificación</h2>
        <p className="text-gray-600">
          Para validar tu perfil como psicólogo, necesitamos que subas los siguientes documentos. 
          Estos serán revisados por nuestro equipo administrativo.
        </p>
      </div>

      {localLoading || isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2A6877]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requiredDocumentTypes.map((docType) => {
            const existingDoc = getDocumentByType(docType.type);
            const status = getDocumentStatus(docType.type);
            
            return (
              <div key={docType.type} className="border rounded-lg overflow-hidden bg-white">
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="text-[#2A6877]">{docType.icon}</div>
                      <h3 className="font-medium">{docType.name}</h3>
                    </div>
                    {getStatusBadge(status)}
                  </div>
                </div>
                
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-4">{docType.description}</p>
                  
                  {existingDoc && existingDoc.file_url && (
                    <div className="mb-4">
                      <a 
                        href={existingDoc.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver documento
                      </a>
                    </div>
                  )}
                  
                  <div className="relative">
                    <input
                      type="file"
                      id={`file-${docType.type}`}
                      onChange={(e) => handleFileUpload(e, docType.type)}
                      className="hidden"
                      accept={docType.type === 'presentation_video' ? 'video/*' : '.pdf,.jpg,.jpeg,.png'}
                      disabled={uploading[docType.type]}
                    />
                    <label
                      htmlFor={`file-${docType.type}`}
                      className={`w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium 
                        ${uploading[docType.type] 
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                          : 'bg-white text-gray-700 hover:bg-gray-50 cursor-pointer'}`}
                    >
                      {uploading[docType.type] ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Subiendo...
                        </>
                      ) : existingDoc ? (
                        'Reemplazar documento'
                      ) : (
                        'Subir documento'
                      )}
                    </label>
                  </div>
                  
                  {status === 'rejected' && existingDoc?.rejection_reason && (
                    <div className="mt-3 text-sm text-red-600">
                      <p>Motivo de rechazo: {existingDoc.rejection_reason}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-lg mt-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Información importante</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc pl-5 space-y-1">
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
    </div>
  );
};

export default DocumentsUpload;