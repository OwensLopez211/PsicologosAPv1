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
  onDownload,
  onVerify,
  onReject
}) => {
  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof onDownload === 'function') {
      const fileName = document.file.split('/').pop() || `documento_${document.id}`;
      onDownload(document.id, fileName);
    } else {
      console.error('onDownload is not a function');
    }
  };

  const handleVerify = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof onVerify === 'function') {
      onVerify(document.id, 'verified');
    } else {
      console.error('onVerify is not a function');
    }
  };

  const handleReject = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof onReject === 'function') {
      onReject(document.id);
    } else {
      console.error('onReject is not a function');
    }
  };

  // Get filename from URL
  const fileName = document.file.split('/').pop() || `documento_${document.id}`;

  // Determinar el estado real del documento para la lógica de UI
  const isVerifiedOrApproved = document.verification_status === 'verified' || 
                             document.verification_status === 'approved';
  const isRejected = document.verification_status === 'rejected';

  // Estado para mostrar en la UI
  let displayStatus = '';
  let statusClass = '';

  if (isVerifiedOrApproved) {
    displayStatus = 'Verificado';
    statusClass = 'bg-green-100 text-green-800';
  } else if (isRejected) {
    displayStatus = 'Rechazado';
    statusClass = 'bg-red-100 text-red-800';
  } else {
    displayStatus = 'Pendiente';
    statusClass = 'bg-yellow-100 text-yellow-800';
  }

  console.log(`Documento ID ${document.id}: Estado=${document.verification_status}, Mostrado=${displayStatus}`);

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="bg-gray-50 px-3 sm:px-4 py-1.5 sm:py-2 border-b flex justify-between items-center">
        <h3 className="font-medium text-gray-700 text-xs sm:text-sm">
          {document.document_type === 'professional_title' && 'Título Profesional'}
          {document.document_type === 'id_card' && 'Cédula de Identidad'}
          {document.document_type === 'professional_license' && 'Licencia Profesional'}
          {document.document_type === 'presentation_video' && 'Video de Presentación'}
          {document.document_type === 'registration_certificate' && 'Certificado de Inscripción'}
          {document.document_type === 'professional_id' && 'Cédula Profesional'}
          {document.document_type === 'specialty_document' && 'Documento de Especialidad'}
          {document.document_type === 'other' && 'Otro Documento'}
        </h3>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
          {displayStatus}
        </span>
      </div>
      
      <div className="p-3 sm:p-4">
        {/* Document filename display */}
        <div className="mb-2 sm:mb-3 bg-gray-50 p-1.5 sm:p-2 rounded border">
          <p className="text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1">Archivo:</p>
          <p className="text-xs sm:text-sm break-all">{fileName}</p>
        </div>
        
        <div className="mb-2 sm:mb-3">
          <p className="text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">Descripción:</p>
          <p className="text-xs sm:text-sm">
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
                  {document.document_type === 'other' && 'Documento adicional'}
                </span>
              </>
            )}
          </p>
        </div>
        
        {document.rejection_reason && (
          <div className="mb-2 sm:mb-3 bg-red-50 p-1.5 sm:p-2 rounded border border-red-200">
            <p className="text-xs sm:text-sm font-medium text-red-700 mb-0.5 sm:mb-1">Motivo de rechazo:</p>
            <p className="text-xs sm:text-sm text-red-600">{document.rejection_reason}</p>
          </div>
        )}
        
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3 sm:mt-4">
          <button 
            onClick={handleDownload}
            className="px-2 sm:px-3 py-1 bg-gray-50 text-gray-600 rounded border border-gray-200 text-xs sm:text-sm hover:bg-gray-100 transition-colors"
          >
            Descargar
          </button>
          
          {/* Solo mostrar botón de aprobar si está pendiente o rechazado */}
          {!isVerifiedOrApproved && (
            <button 
              onClick={handleVerify}
              className="px-2 sm:px-3 py-1 bg-green-50 text-green-600 rounded border border-green-200 text-xs sm:text-sm hover:bg-green-100 transition-colors"
            >
              Aprobar
            </button>
          )}
          
          {/* Solo mostrar botón de rechazar si está pendiente o aprobado */}
          {!isRejected && (
            <button 
              onClick={handleReject}
              className="px-2 sm:px-3 py-1 bg-red-50 text-red-600 rounded border border-red-200 text-xs sm:text-sm hover:bg-red-100 transition-colors"
            >
              Rechazar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;