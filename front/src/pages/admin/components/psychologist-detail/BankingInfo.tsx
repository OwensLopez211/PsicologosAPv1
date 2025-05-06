import React, { useState } from 'react';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  BanknotesIcon,
  BuildingLibraryIcon
} from '@heroicons/react/24/solid';

interface BankingInfoProps {
  bankAccountNumber: string;
  bankAccountOwner: string;
  bankAccountOwnerRut: string;
  bankAccountOwnerEmail: string;
  bankAccountType: string;
  bankAccountTypeDisplay: string;
  bankName: string;
}

const BankingInfo: React.FC<BankingInfoProps> = ({
  bankAccountNumber,
  bankAccountOwner,
  bankAccountOwnerRut,
  bankAccountOwnerEmail,
  bankAccountType,
  bankAccountTypeDisplay,
  bankName
}) => {
  const [showDetails, setShowDetails] = useState(false);

  // Verificar si hay datos bancarios completos
  const hasBankingInfo = 
    bankAccountNumber && 
    bankAccountOwner && 
    bankAccountOwnerRut && 
    bankName;

  // Formatear el RUT con puntos y guión
  const formatRut = (rut: string) => {
    if (!rut) return '';
    
    // Eliminar puntos y guiones existentes
    const cleanRut = rut.replace(/\./g, '').replace(/-/g, '');
    
    // Separar el dígito verificador
    const body = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1);
    
    // Formatear con puntos cada tres dígitos
    let formattedBody = '';
    for (let i = body.length - 1; i >= 0; i--) {
      formattedBody = body[i] + formattedBody;
      if ((body.length - i) % 3 === 0 && i !== 0) {
        formattedBody = '.' + formattedBody;
      }
    }
    
    return `${formattedBody}-${dv}`;
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <span className="bg-[#2A6877]/10 p-1.5 rounded-md mr-2">
            <BuildingLibraryIcon className="h-5 w-5 text-[#2A6877]" />
          </span>
          Información Bancaria
        </h2>
        
        <div className="flex items-center space-x-3">
          {hasBankingInfo ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Completa
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Incompleta
            </span>
          )}
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center text-sm font-medium text-[#2A6877] hover:text-[#1d4e5f] transition-colors"
            aria-label={showDetails ? "Ocultar detalles bancarios" : "Ver detalles bancarios"}
          >
            {showDetails ? (
              <>
                <EyeSlashIcon className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Ocultar</span>
              </>
            ) : (
              <>
                <EyeIcon className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Ver detalles</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="flex items-center mb-3">
        <div className="mr-3 p-2 bg-[#2A6877]/5 rounded-full">
          <BanknotesIcon className="h-5 w-5 text-[#2A6877]" />
        </div>
        <div>
          <p className="text-gray-500 text-sm">Datos bancarios {hasBankingInfo ? 'completos' : 'incompletos'}</p>
          <p className="text-gray-700 font-medium">{bankName || 'No hay banco especificado'}</p>
        </div>
      </div>
      
      {showDetails && (
        <div className="mt-4 space-y-4 text-sm border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <div className="flex items-center mb-1.5">
                <BanknotesIcon className="w-4 h-4 text-[#2A6877] mr-2" />
                <span className="text-sm font-medium text-gray-500">Banco</span>
              </div>
              <span className="text-gray-800 pl-6">
                {bankName || <span className="text-gray-400 italic">No especificado</span>}
              </span>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center mb-1.5">
                <BanknotesIcon className="w-4 h-4 text-[#2A6877] mr-2" />
                <span className="text-sm font-medium text-gray-500">Tipo de cuenta</span>
              </div>
              <span className="text-gray-800 pl-6">
                {bankAccountTypeDisplay || bankAccountType || <span className="text-gray-400 italic">No especificado</span>}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center mb-1.5">
              <BanknotesIcon className="w-4 h-4 text-[#2A6877] mr-2" />
              <span className="text-sm font-medium text-gray-500">Número de cuenta</span>
            </div>
            <span className="font-mono text-gray-800 pl-6 break-all">
              {bankAccountNumber || <span className="text-gray-400 italic">No especificado</span>}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <div className="flex items-center mb-1.5">
                <BanknotesIcon className="w-4 h-4 text-[#2A6877] mr-2" />
                <span className="text-sm font-medium text-gray-500">Titular de la cuenta</span>
              </div>
              <span className="text-gray-800 pl-6">
                {bankAccountOwner || <span className="text-gray-400 italic">No especificado</span>}
              </span>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center mb-1.5">
                <BanknotesIcon className="w-4 h-4 text-[#2A6877] mr-2" />
                <span className="text-sm font-medium text-gray-500">RUT del titular</span>
              </div>
              <span className="text-gray-800 pl-6">
                {bankAccountOwnerRut ? 
                  formatRut(bankAccountOwnerRut) : 
                  <span className="text-gray-400 italic">No especificado</span>
                }
              </span>
            </div>
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center mb-1.5">
              <BanknotesIcon className="w-4 h-4 text-[#2A6877] mr-2" />
              <span className="text-sm font-medium text-gray-500">Email del titular</span>
            </div>
            <span className="text-gray-800 pl-6 break-all">
              {bankAccountOwnerEmail || <span className="text-gray-400 italic">No especificado</span>}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankingInfo;