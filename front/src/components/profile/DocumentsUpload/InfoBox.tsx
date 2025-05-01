import React from 'react';

const InfoBox: React.FC = () => {
  return (
    <div className="bg-blue-50 p-4 rounded-lg mt-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">Información importante</h3>
          <div className="mt-2 text-sm text-blue-700">
            <ul className="list-disc pl-5 space-y-1">
              <li>El video de presentación debe tener una duración máxima de 2 minutos.</li>
              <li>Los documentos deben estar en formato PDF, JPG o PNG.</li>
              <li>El tamaño máximo por archivo es de 5MB.</li>
              <li>La verificación puede tomar hasta 48 horas hábiles.</li>
              <li>Te notificaremos por correo electrónico cuando tu cuenta sea verificada.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoBox;