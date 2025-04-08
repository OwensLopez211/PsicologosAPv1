import React, { useState } from 'react';

interface RejectDocumentModalProps {
  isOpen: boolean;
  documentId: number | null;
  documentName: string;
  onClose: () => void;
  onConfirm: (documentId: number, rejectionReason: string) => void;
}

const RejectDocumentModal: React.FC<RejectDocumentModalProps> = ({
  isOpen,
  documentId,
  documentName,
  onClose,
  onConfirm
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rejectionReason.trim()) {
      setError('Por favor, ingrese un motivo de rechazo');
      return;
    }
    
    if (documentId !== null) {
      onConfirm(documentId, rejectionReason);
      setRejectionReason('');
      setError(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="border-b px-6 py-4">
          <h3 className="text-lg font-medium text-gray-900">Rechazar Documento</h3>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4">
            <p className="text-sm text-gray-600 mb-4">
              Está a punto de rechazar el documento: <span className="font-medium">{documentName}</span>
            </p>
            
            <div className="mb-4">
              <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-1">
                Motivo de rechazo <span className="text-red-500">*</span>
              </label>
              <textarea
                id="rejectionReason"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2A6877] focus:border-[#2A6877]"
                placeholder="Explique el motivo por el cual rechaza este documento..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>
          </div>
          
          <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Rechazar Documento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectDocumentModal;