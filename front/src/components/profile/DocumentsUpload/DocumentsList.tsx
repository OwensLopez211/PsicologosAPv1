import React from 'react';
import { DocumentIcon, VideoCameraIcon, IdentificationIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import DocumentCard from './DocumentCard';
import { Document, DocumentType } from './types';

interface DocumentsListProps {
  documents: Document[];
  getDocumentByType: (type: string) => Document | undefined;
  isEditMode: boolean;
  pendingUploads: Record<string, File>;
  uploading: Record<string, boolean>;
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>, documentType: string) => void;
}

const DocumentsList: React.FC<DocumentsListProps> = ({
  documents,
  getDocumentByType,
  isEditMode,
  pendingUploads,
  uploading,
  handleFileSelect
}) => {
  // Define required documents
  const requiredDocumentTypes: DocumentType[] = [
    {
      type: 'presentation_video',
      name: 'Video de presentación',
      icon: <VideoCameraIcon className="h-5 w-5 sm:h-6 sm:w-6" />,
      description: 'Un breve video donde te presentas y hablas de tu experiencia profesional (máx. 2 minutos)'
    },
    {
      type: 'registration_certificate',
      name: 'Certificado de inscripción en Registro Nacional',
      icon: <ClipboardDocumentCheckIcon className="h-5 w-5 sm:h-6 sm:w-6" />,
      description: 'Certificado de inscripción en Registro Nacional de Prestadores Individuales de Salud'
    },
    {
      type: 'professional_id',
      name: 'Carnet profesional',
      icon: <IdentificationIcon className="h-5 w-5 sm:h-6 sm:w-6" />,
      description: 'Fotos del carnet profesional por ambos lados'
    },
    {
      type: 'specialty_document',
      name: 'Documento de especialidad',
      icon: <DocumentIcon className="h-5 w-5 sm:h-6 sm:w-6" />,
      description: 'Documento que describa el tipo de terapia que realizas, trastornos que tratas e información relevante para justificar tu tarifa'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mt-4 sm:mt-6">
      {requiredDocumentTypes.map((docType) => (
        <DocumentCard
          key={docType.type}
          docType={docType}
          existingDoc={getDocumentByType(docType.type)}
          isEditMode={isEditMode}
          pendingUpload={pendingUploads[docType.type]}
          isUploading={uploading[docType.type]}
          onFileSelect={handleFileSelect}
          documents={documents}
        />
      ))}
    </div>
  );
};

export default DocumentsList;