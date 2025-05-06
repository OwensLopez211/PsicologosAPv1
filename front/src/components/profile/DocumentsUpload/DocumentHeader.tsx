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
    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-0">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Documentos para Verificación</h2>
        <p className="text-xs sm:text-sm text-gray-600">
          Para validar tu perfil como psicólogo, necesitamos que subas los siguientes documentos. 
          Estos serán revisados por nuestro equipo administrativo.
        </p>
      </div>
      
      {!isEditMode ? (
        <button
          onClick={() => setIsEditMode(true)}
          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#2A6877] text-white text-xs sm:text-sm rounded-md hover:bg-[#1d4b56] transition-colors self-start sm:self-auto mt-1 sm:mt-0"
          disabled={isLoading}
        >
          Editar documentos
        </button>
      ) : (
        <div className="flex space-x-2 self-start sm:self-auto mt-1 sm:mt-0">
          <button
            onClick={cancelEdit}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-200 text-gray-800 text-xs sm:text-sm rounded-md hover:bg-gray-300 transition-colors"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveChanges}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#2A6877] text-white text-xs sm:text-sm rounded-md hover:bg-[#1d4b56] transition-colors"
            disabled={isLoading || !hasPendingUploads}
          >
            {hasPendingUploads ? 'Guardar cambios' : 'Finalizar edición'}
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentHeader;