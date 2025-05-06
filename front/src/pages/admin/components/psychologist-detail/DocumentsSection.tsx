import React, { useState } from 'react';
import DocumentCard from './DocumentCard';
import RejectDocumentModal from './RejectDocumentModal';

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
  onDownloadDocument: (documentId: number, fileName: string) => void;
  onVerifyDocument: (documentId: number, status: string) => void;
  onRejectDocument: (documentId: number, rejectionReason: string) => void;
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  documents,
  onDownloadDocument,
  onVerifyDocument,
  onRejectDocument
}) => {
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [selectedDocumentName, setSelectedDocumentName] = useState('');

  const handleOpenRejectModal = (documentId: number) => {
    const document = documents?.find(doc => doc.id === documentId);
    if (document) {
      setSelectedDocumentId(documentId);
      setSelectedDocumentName(document.file.split('/').pop() || `documento_${documentId}`);
      setRejectModalOpen(true);
    }
  };

  const handleCloseRejectModal = () => {
    setRejectModalOpen(false);
    setSelectedDocumentId(null);
    setSelectedDocumentName('');
  };

  const handleConfirmReject = (documentId: number, rejectionReason: string) => {
    onRejectDocument(documentId, rejectionReason);
    handleCloseRejectModal();
  };

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 border-b pb-2">
        Documentos de Verificación
      </h2>
      
      {documents && documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {documents.map((document, index) => (
            <DocumentCard
              onView={() => {}} // Add missing required onView prop
              key={index}
              document={document}
              onDownload={onDownloadDocument}
              onVerify={onVerifyDocument}
              onReject={handleOpenRejectModal}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm sm:text-base text-gray-500">No hay documentos de verificación disponibles</p>
      )}

      <RejectDocumentModal
        isOpen={rejectModalOpen}
        documentId={selectedDocumentId}
        documentName={selectedDocumentName}
        onClose={handleCloseRejectModal}
        onConfirm={handleConfirmReject}
      />
    </div>
  );
};

export default DocumentsSection;