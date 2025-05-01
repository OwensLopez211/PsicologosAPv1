import React from 'react';

interface DocumentHeaderProps {
  isEditMode: boolean;
  setIsEditMode: (value: boolean) => void;
  cancelEdit: () => void;
  handleSaveChanges: () => void;
  isLoading: boolean;
  hasPendingUploads: boolean;
}

const DocumentHeader: React.FC<DocumentHeaderProps> = ({
  isEditMode,
  setIsEditMode,
  cancelEdit,
  handleSaveChanges,
  isLoading,
  hasPendingUploads
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-xl font-semibold mb-2">Documentos para Verificación</h2>
        <p className="text-gray-600">
          Para validar tu perfil como psicólogo, necesitamos que subas los siguientes documentos. 
          Estos serán revisados por nuestro equipo administrativo.
        </p>
      </div>
      
      {!isEditMode ? (
        <button
          onClick={() => setIsEditMode(true)}
          className="px-4 py-2 bg-[#2A6877] text-white rounded-md hover:bg-[#1d4b56] transition-colors"
          disabled={isLoading}
        >
          Editar documentos
        </button>
      ) : (
        <div className="flex space-x-2">
          <button
            onClick={cancelEdit}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveChanges}
            className="px-4 py-2 bg-[#2A6877] text-white rounded-md hover:bg-[#1d4b56] transition-colors"
            disabled={isLoading || !hasPendingUploads}
          >
            Guardar cambios
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentHeader;