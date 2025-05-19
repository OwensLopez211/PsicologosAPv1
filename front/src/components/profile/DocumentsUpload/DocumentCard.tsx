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
    if (!doc) return 'not_uploaded';
    
    // Mapear los estados a valores permitidos
    switch (doc.verification_status) {
      case 'pending': return 'pending';
      case 'approved': return 'approved';
      case 'verified': return 'approved'; // 'verified' se mapea a 'approved'
      case 'rejected': return 'rejected';
      default: return 'not_uploaded';
    }
  };

  const status = getDocumentStatus(docType.type);
  const hasPendingUpload = !!pendingUpload;
  
  // Verificar si el documento puede ser editado (solo si está rechazado o no se ha subido)
  const canEdit = !existingDoc || status === 'rejected';
  
  // Determinar el texto del botón según el estado
  const getButtonText = () => {
    if (isUploading) return 'Subiendo...';
    if (hasPendingUpload) return 'Cambiar archivo';
    if (existingDoc) {
      if (status === 'rejected') return 'Reemplazar documento';
      return 'No se puede reemplazar';
    }
    return 'Seleccionar archivo';
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="p-2 sm:p-4 border-b bg-gray-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="text-[#2A6877]">{docType.icon}</div>
            <h3 className="font-medium text-sm sm:text-base">{docType.name}</h3>
          </div>
          {hasPendingUpload ? (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-1.5 sm:px-2.5 py-0.5 rounded whitespace-nowrap">
              Pendiente de guardar
            </span>
          ) : (
            <DocumentStatusBadge status={status} />
          )}
        </div>
      </div>
      
      <div className="p-2 sm:p-4">
        <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-4">{docType.description}</p>
        
        {/* Mostrar documento existente si está disponible y no hay una carga pendiente */}
        {existingDoc && existingDoc.file_url && !hasPendingUpload && (
          <div className="mb-2 sm:mb-4">
            <a 
              href={existingDoc.file_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-xs sm:text-sm flex items-center"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Ver documento
            </a>
          </div>
        )}
        
        {/* Mostrar nombre de archivo pendiente */}
        {hasPendingUpload && (
          <div className="mb-2 sm:mb-4">
            <p className="text-xs sm:text-sm text-blue-600">
              Archivo seleccionado: {pendingUpload.name}
            </p>
          </div>
        )}
        
        {/* Input de archivo solo visible en modo edición y si el documento puede ser editado */}
        <div className="relative">
          <input
            type="file"
            id={`file-${docType.type}`}
            onChange={(e) => onFileSelect(e, docType.type)}
            className="hidden"
            accept={docType.type === 'presentation_video' ? 'video/*' : '.pdf,.jpg,.jpeg,.png'}
            disabled={!isEditMode || isUploading || !canEdit}
          />
          {isEditMode && (
            <label
              htmlFor={`file-${docType.type}`}
              className={`w-full flex items-center justify-center px-2 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium 
                ${isUploading || !canEdit
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 cursor-pointer'}`}
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Subiendo...
                </>
              ) : !canEdit ? (
                <>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  No se puede reemplazar
                </>
              ) : (
                getButtonText()
              )}
            </label>
          )}
        </div>
        
        {/* Mostrar mensaje informativo si el documento no se puede reemplazar */}
        {isEditMode && existingDoc && !canEdit && (
          <div className="mt-2 text-xs text-gray-600 italic">
            Este documento no puede ser reemplazado mientras esté en revisión o aprobado.
          </div>
        )}
        
        {/* Mostrar motivo de rechazo si corresponde */}
        {status === 'rejected' && existingDoc?.rejection_reason && (
          <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-red-600">
            <p>Motivo de rechazo: {existingDoc.rejection_reason}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentCard;