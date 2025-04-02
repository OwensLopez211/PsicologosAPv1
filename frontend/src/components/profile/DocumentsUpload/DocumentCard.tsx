import React from 'react';
import DocumentStatusBadge from './DocumentStatusBadge';
import { Document, DocumentType } from './types';

interface DocumentCardProps {
  docType: DocumentType;
  existingDoc?: Document;
  isEditMode: boolean;
  pendingUpload?: File;
  isUploading?: boolean;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>, documentType: string) => void;
  documents: Document[];
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  docType,
  existingDoc,
  isEditMode,
  pendingUpload,
  isUploading,
  onFileSelect,
  documents
}) => {
  const getDocumentStatus = (type: string): 'pending' | 'approved' | 'rejected' | 'not_uploaded' => {
    const doc = documents.find(d => d.document_type === type);
    return doc?.verification_status || 'not_uploaded';
  };

  const status = getDocumentStatus(docType.type);
  const hasPendingUpload = !!pendingUpload;

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="p-4 border-b bg-gray-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="text-[#2A6877]">{docType.icon}</div>
            <h3 className="font-medium">{docType.name}</h3>
          </div>
          {hasPendingUpload ? (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
              Pendiente de guardar
            </span>
          ) : (
            <DocumentStatusBadge status={status} />
          )}
        </div>
      </div>
      
      <div className="p-4">
        <p className="text-sm text-gray-600 mb-4">{docType.description}</p>
        
        {/* Show existing document if available */}
        {existingDoc && existingDoc.file_url && !hasPendingUpload && (
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
        
        {/* Show pending upload filename if available */}
        {hasPendingUpload && (
          <div className="mb-4">
            <p className="text-sm text-blue-600">
              Archivo seleccionado: {pendingUpload.name}
            </p>
          </div>
        )}
        
        {/* File input only visible in edit mode */}
        <div className="relative">
          <input
            type="file"
            id={`file-${docType.type}`}
            onChange={(e) => onFileSelect(e, docType.type)}
            className="hidden"
            accept={docType.type === 'presentation_video' ? 'video/*' : '.pdf,.jpg,.jpeg,.png'}
            disabled={!isEditMode || isUploading}
          />
          {isEditMode && (
            <label
              htmlFor={`file-${docType.type}`}
              className={`w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium 
                ${isUploading 
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 cursor-pointer'}`}
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Subiendo...
                </>
              ) : hasPendingUpload ? (
                'Cambiar archivo'
              ) : existingDoc ? (
                'Reemplazar documento'
              ) : (
                'Seleccionar archivo'
              )}
            </label>
          )}
        </div>
        
        {status === 'rejected' && existingDoc?.rejection_reason && (
          <div className="mt-3 text-sm text-red-600">
            <p>Motivo de rechazo: {existingDoc.rejection_reason}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentCard;