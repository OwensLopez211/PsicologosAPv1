import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BankInfoFormProps {
  formData: {
    bank_account_number: string;
    bank_account_type: string;
    bank_account_owner: string;
    bank_account_owner_rut: string;
    bank_account_owner_email: string;
    bank_name: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  disclaimer: boolean;
  setDisclaimer: (value: boolean) => void;
  saving: boolean;
  isLoading: boolean;
}

const BankInfoForm: React.FC<BankInfoFormProps> = ({
  formData,
  onChange,
  onSubmit,
  disclaimer,
  setDisclaimer,
  saving,
  isLoading
}) => {
  const [isEditing, setIsEditing] = useState(false);
  
  // Lista de bancos en Chile
  const chileanBanks = [
    { value: 'BANCO_DE_CHILE', label: 'Banco de Chile' },
    { value: 'BANCO_ESTADO', label: 'Banco Estado' },
    { value: 'BANCO_SANTANDER', label: 'Banco Santander' },
    { value: 'BANCO_BCI', label: 'Banco BCI' },
    { value: 'BANCO_SCOTIABANK', label: 'Banco Scotiabank' },
    { value: 'BANCO_ITAU', label: 'Banco Itaú' },
    { value: 'BANCO_FALABELLA', label: 'Banco Falabella' },
    { value: 'BANCO_SECURITY', label: 'Banco Security' },
    { value: 'BANCO_BICE', label: 'Banco BICE' },
    { value: 'BANCO_INTERNACIONAL', label: 'Banco Internacional' },
    { value: 'BANCO_CONSORCIO', label: 'Banco Consorcio' },
    { value: 'BANCO_RIPLEY', label: 'Banco Ripley' },
    { value: 'BANCO_BTG_PACTUAL', label: 'Banco BTG Pactual' },
    { value: 'HSBC_BANK', label: 'HSBC Bank' },
    { value: 'COOPEUCH', label: 'Coopeuch' },
    { value: 'BANCO_EDWARDS', label: 'Banco Edwards' },
    { value: 'TENPO', label: 'Tenpo' },
    { value: 'MACH', label: 'MACH' },
  ];

  // Function to handle form submission with edit mode
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing) {
      await onSubmit(e);
      if (!saving) {
        setIsEditing(false);
      }
    } else {
      setIsEditing(true);
    }
  };

  // Function to cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  // Format bank name for display
  const getBankDisplayName = (value: string) => {
    const bank = chileanBanks.find(bank => bank.value === value);
    return bank ? bank.label : 'No seleccionado';
  };

  // Format account type for display
  const getAccountTypeDisplayName = (value: string) => {
    switch (value) {
      case 'CORRIENTE': return 'Cuenta Corriente';
      case 'AHORRO': return 'Cuenta de Ahorro';
      case 'VISTA': return 'Cuenta Vista';
      case 'RUT': return 'Cuenta RUT';
      default: return 'No seleccionado';
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="editing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label htmlFor="bank_name" className="block text-sm font-medium text-gray-700">
                  Nombre del Banco
                </label>
                <select
                  id="bank_name"
                  name="bank_name"
                  value={formData.bank_name}
                  onChange={onChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A6877] focus:border-transparent transition-all duration-200 bg-white"
                >
                  <option value="">Seleccionar banco</option>
                  {chileanBanks.map(bank => (
                    <option key={bank.value} value={bank.value}>
                      {bank.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-1">
                <label htmlFor="bank_account_type" className="block text-sm font-medium text-gray-700">
                  Tipo de Cuenta
                </label>
                <select
                  id="bank_account_type"
                  name="bank_account_type"
                  value={formData.bank_account_type}
                  onChange={onChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A6877] focus:border-transparent transition-all duration-200 bg-white"
                >
                  <option value="">Seleccionar tipo de cuenta</option>
                  <option value="CORRIENTE">Cuenta Corriente</option>
                  <option value="AHORRO">Cuenta de Ahorro</option>
                  <option value="VISTA">Cuenta Vista</option>
                  <option value="RUT">Cuenta RUT</option>
                </select>
              </div>
              
              <div className="space-y-1">
                <label htmlFor="bank_account_number" className="block text-sm font-medium text-gray-700">
                  Número de Cuenta
                </label>
                <input
                  type="text"
                  id="bank_account_number"
                  name="bank_account_number"
                  value={formData.bank_account_number}
                  onChange={onChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A6877] focus:border-transparent transition-all duration-200"
                  placeholder="Ej: 00012345678"
                />
              </div>
              
              <div className="space-y-1">
                <label htmlFor="bank_account_owner" className="block text-sm font-medium text-gray-700">
                  Nombre del Titular
                </label>
                <input
                  type="text"
                  id="bank_account_owner"
                  name="bank_account_owner"
                  value={formData.bank_account_owner}
                  onChange={onChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A6877] focus:border-transparent transition-all duration-200"
                  placeholder="Ej: Juan Pérez González"
                />
              </div>
              
              <div className="space-y-1">
                <label htmlFor="bank_account_owner_rut" className="block text-sm font-medium text-gray-700">
                  RUT del Titular
                </label>
                <input
                  type="text"
                  id="bank_account_owner_rut"
                  name="bank_account_owner_rut"
                  value={formData.bank_account_owner_rut}
                  onChange={onChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A6877] focus:border-transparent transition-all duration-200"
                  placeholder="Ej: 12.345.678-9"
                />
              </div>
              
              <div className="space-y-1">
                <label htmlFor="bank_account_owner_email" className="block text-sm font-medium text-gray-700">
                  Correo Electrónico del Titular
                </label>
                <input
                  type="email"
                  id="bank_account_owner_email"
                  name="bank_account_owner_email"
                  value={formData.bank_account_owner_email}
                  onChange={onChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A6877] focus:border-transparent transition-all duration-200"
                  placeholder="Ej: correo@ejemplo.com"
                />
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="disclaimer"
                    name="disclaimer"
                    type="checkbox"
                    checked={disclaimer}
                    onChange={(e) => setDisclaimer(e.target.checked)}
                    className="h-4 w-4 text-[#2A6877] border-gray-300 rounded focus:ring-[#2A6877]"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="disclaimer" className="font-medium text-gray-700">
                    Confirmo que la cuenta bancaria está a mi nombre
                  </label>
                  <p className="text-gray-500 mt-1">
                    Para procesar los pagos, la cuenta bancaria debe estar a nombre del titular del perfil.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <motion.button
                type="button"
                onClick={handleCancelEdit}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-all duration-200 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancelar
              </motion.button>
              
              <motion.button
                type="submit"
                disabled={saving || isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2 bg-[#2A6877] text-white rounded-lg hover:bg-[#1e4e5a] focus:outline-none focus:ring-2 focus:ring-[#2A6877] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 flex items-center"
              >
                {(saving || isLoading) ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Guardar Información Bancaria
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="viewing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Read-only view */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Nombre del Banco</h3>
                <p className="text-gray-900 font-medium">
                  {formData.bank_name ? getBankDisplayName(formData.bank_name) : 'No especificado'}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Tipo de Cuenta</h3>
                <p className="text-gray-900 font-medium">
                  {formData.bank_account_type ? getAccountTypeDisplayName(formData.bank_account_type) : 'No especificado'}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Número de Cuenta</h3>
                <p className="text-gray-900 font-medium">
                  {formData.bank_account_number || 'No especificado'}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Nombre del Titular</h3>
                <p className="text-gray-900 font-medium">
                  {formData.bank_account_owner || 'No especificado'}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">RUT del Titular</h3>
                <p className="text-gray-900 font-medium">
                  {formData.bank_account_owner_rut || 'No especificado'}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Correo Electrónico del Titular</h3>
                <p className="text-gray-900 font-medium">
                  {formData.bank_account_owner_email || 'No especificado'}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end pt-6">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2 bg-[#2A6877] text-white rounded-lg hover:bg-[#1e4e5a] focus:outline-none focus:ring-2 focus:ring-[#2A6877] focus:ring-offset-2 transition-all duration-200 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Editar Información
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
};

export default BankInfoForm;