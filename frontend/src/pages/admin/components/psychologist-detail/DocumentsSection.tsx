import React from 'react';
import DocumentCard from './DocumentCard';

interface Document {
  id: number;
  document_type: string;
  file: string;
  description: string | null;
  verification_status: string;
  rejection_reason: string | null;
  uploaded_at: string;
}

interface DocumentsSectionProps {
  documents: Document[] | null;
  onViewDocument: (documentUrl: string) => void;
  onDownloadDocument: (documentId: number, fileName: string) => void;
  onVerifyDocument: (documentId: number, status: string) => void;
  onRejectDocument: (documentId: number) => void;
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  documents,
  onViewDocument,
  onDownloadDocument,
  onVerifyDocument,
  onRejectDocument
}) => {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
        Documentos de Verificación
      </h2>
      
      {documents && documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((document, index) => (
            <DocumentCard
              key={index}
              document={document}
              onView={onViewDocument}
              onDownload={onDownloadDocument}
              onVerify={onVerifyDocument}
              onReject={onRejectDocument}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No hay documentos de verificación disponibles</p>
      )}
    </div>
  );
};

export default DocumentsSection;