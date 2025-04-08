import React from 'react';

interface Document {
  id: number;
  document_type: string;
  file: string;
  description: string | null;
  verification_status: string;
  rejection_reason: string | null;
  uploaded_at: string;
}

interface DocumentCardProps {
  document: Document;
  onView: (documentUrl: string) => void;
  onDownload: (documentId: number, fileName: string) => void;
  onVerify: (documentId: number, status: string) => void;
  onReject: (documentId: number) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onView,
  onDownload,
  onVerify,
  onReject
}) => {
  // Helper function to detect video files
  const isVideoFile = (filename: string) => {
    const videoExtensions = ['mp4', 'mov', 'avi', 'webm', 'mkv', '3gp'];
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    return videoExtensions.includes(extension);
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm">
      <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
        <h3 className="font-medium text-gray-700">
          {document.document_type === 'professional_title' && 'Título Profesional'}
          {document.document_type === 'id_card' && 'Cédula de Identidad'}
          {document.document_type === 'professional_license' && 'Licencia Profesional'}
          {document.document_type === 'presentation_video' && 'Video de Presentación'}
          {document.document_type === 'registration_certificate' && 'Certificado de Inscripción'}
          {document.document_type === 'professional_id' && 'Cédula Profesional'}
          {document.document_type === 'specialty_document' && 'Documento de Especialidad'}
          {document.document_type === 'other' && 'Otro Documento'}
        </h3>
        <span className={`px-2 py-1 text-xs rounded-full ${
          document.verification_status === 'verified' 
            ? 'bg-green-100 text-green-800' 
            : document.verification_status === 'rejected'
            ? 'bg-red-100 text-red-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {document.verification_status === 'verified' && 'Verificado'}
          {document.verification_status === 'rejected' && 'Rechazado'}
          {document.verification_status === 'pending' && 'Pendiente'}
        </span>
      </div>
      
      <div className="p-4">
        {/* Document filename display */}
        <div className="mb-3 bg-gray-50 p-2 rounded border">
          <p className="text-sm font-medium text-gray-700 mb-1">Archivo:</p>
          <p className="text-sm break-all">{document.file.split('/').pop() || `documento_${document.id}`}</p>
        </div>
        
        <div className="mb-3">
          <p className="text-sm text-gray-500 mb-1">Descripción:</p>
          <p className="text-sm">
            {document.description || (
              <>
                <span className="text-gray-700 font-medium">
                  {document.document_type === 'professional_title' && 'Título profesional universitario del psicólogo'}
                  {document.document_type === 'id_card' && 'Cédula de identidad o documento nacional de identificación'}
                  {document.document_type === 'professional_license' && 'Licencia o certificado de inscripción profesional'}
                  {document.document_type === 'presentation_video' && 'Video de presentación del psicólogo'}
                  {document.document_type === 'registration_certificate' && 'Certificado de inscripción profesional'}
                  {document.document_type === 'professional_id' && 'Cédula de identidad profesional'}
                  {document.document_type === 'specialty_document' && 'Documento de especialidad o certificación adicional'}
                  {document.document_type === 'cv' && 'Currículum Vitae del profesional'}
                  {document.document_type === 'certification' && 'Certificación o diploma de especialización'}
                  {document.document_type === 'other' && (
                    isVideoFile(document.file) 
                      ? 'Video de presentación del psicólogo' 
                      : 'Documento adicional de verificación'
                  )}
                </span>
                <span className="text-gray-500 italic"> - Subido el {new Date(document.uploaded_at).toLocaleDateString()}</span>
              </>
            )}
          </p>
        </div>
        
        {document.rejection_reason && (
          <div className="mb-3">
            <p className="text-sm text-red-500 mb-1">Motivo de rechazo:</p>
            <p className="text-sm">{document.rejection_reason}</p>
          </div>
        )}
        
        <div className="flex justify-between items-center mt-4">
          <div className="flex space-x-2">
            <button 
              onClick={() => onView(document.file)}
              className="px-3 py-1 bg-[#2A6877] text-white text-sm rounded hover:bg-[#1d4e5f] inline-flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Ver
            </button>
            <button 
              onClick={() => onDownload(document.id, document.file.split('/').pop() || `documento_${document.id}`)}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 inline-flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Descargar
            </button>
          </div>
          
          {/* Modified: Show appropriate action buttons based on document status */}
          <div className="flex space-x-2">
            {document.verification_status !== 'verified' && (
              <button 
                onClick={() => onVerify(document.id, 'verified')}
                className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
              >
                Aprobar
              </button>
            )}
            {/* Always show the reject button, regardless of verification status */}
            <button 
              onClick={() => onReject(document.id)}
              className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
            >
              Rechazar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;