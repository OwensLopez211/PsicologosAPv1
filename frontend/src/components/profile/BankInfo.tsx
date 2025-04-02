import { useState, useEffect } from 'react';
import { updateBankInfo } from '../../services/profileService';
import { toast } from 'react-hot-toast';

interface BankInfoProps {
  profile: any;
  onSave: (data: any) => Promise<void>;
  isLoading: boolean;
  onProfileUpdate?: (updatedProfile: any) => void; // Add this prop to handle profile updates
}

const BankInfo = ({ profile, isLoading, onProfileUpdate }: Omit<BankInfoProps, 'onSave'>) => {
  const [formData, setFormData] = useState({
    bank_account_number: '',
    bank_account_type: '',
    bank_account_owner: '',
    bank_account_owner_rut: '',
    bank_account_owner_email: '',
    bank_name: '',
  });
  
  const [saving, setSaving] = useState(false);
  const [disclaimer, setDisclaimer] = useState(false);

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

  useEffect(() => {
    if (profile) {
      setFormData({
        bank_account_number: profile.bank_account_number || '',
        bank_account_type: profile.bank_account_type || '',
        bank_account_owner: profile.bank_account_owner || '',
        bank_account_owner_rut: profile.bank_account_owner_rut || '',
        bank_account_owner_email: profile.bank_account_owner_email || '',
        bank_name: profile.bank_name || '',
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!disclaimer) {
      toast.error('Debes aceptar que la cuenta bancaria está a tu nombre');
      return;
    }
    
    setSaving(true);
    try {
      // Get the updated data from the server response
      const updatedData = await updateBankInfo(formData);
      
      // Update the local state with the response data
      if (updatedData) {
        setFormData({
          bank_account_number: updatedData.bank_account_number || formData.bank_account_number,
          bank_account_type: updatedData.bank_account_type || formData.bank_account_type,
          bank_account_owner: updatedData.bank_account_owner || formData.bank_account_owner,
          bank_account_owner_rut: updatedData.bank_account_owner_rut || formData.bank_account_owner_rut,
          bank_account_owner_email: updatedData.bank_account_owner_email || formData.bank_account_owner_email,
          bank_name: updatedData.bank_name || formData.bank_name,
        });
        
        // If we have a callback to update the parent component, call it
        if (onProfileUpdate) {
          // Create an updated profile object that merges the current profile with the updated bank info
          const updatedProfile = {
            ...profile,
            ...updatedData
          };
          onProfileUpdate(updatedProfile);
        }
      }
      
      toast.success('Información bancaria actualizada correctamente');
    } catch (error) {
      console.error('Error saving bank info:', error);
      toast.error('Error al guardar la información bancaria');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Información Bancaria</h2>
      <p className="text-gray-600 mb-6">
        Esta información será utilizada para realizar transferencias por tus servicios.
        Por favor, asegúrate de que los datos sean correctos.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="bank_name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Banco
            </label>
            <select
              id="bank_name"
              name="bank_name"
              value={formData.bank_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2A6877]"
            >
              <option value="">Seleccionar banco</option>
              {chileanBanks.map(bank => (
                <option key={bank.value} value={bank.value}>
                  {bank.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="bank_account_type" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Cuenta
            </label>
            <select
              id="bank_account_type"
              name="bank_account_type"
              value={formData.bank_account_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2A6877]"
            >
              <option value="">Seleccionar tipo de cuenta</option>
              <option value="CORRIENTE">Cuenta Corriente</option>
              <option value="AHORRO">Cuenta de Ahorro</option>
              <option value="VISTA">Cuenta Vista</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="bank_account_number" className="block text-sm font-medium text-gray-700 mb-1">
              Número de Cuenta
            </label>
            <input
              type="text"
              id="bank_account_number"
              name="bank_account_number"
              value={formData.bank_account_number}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2A6877]"
              placeholder="Ej: 00012345678"
            />
          </div>
          
          <div>
            <label htmlFor="bank_account_owner" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Titular
            </label>
            <input
              type="text"
              id="bank_account_owner"
              name="bank_account_owner"
              value={formData.bank_account_owner}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2A6877]"
              placeholder="Ej: Juan Pérez González"
            />
          </div>
          
          <div>
            <label htmlFor="bank_account_owner_rut" className="block text-sm font-medium text-gray-700 mb-1">
              RUT del Titular
            </label>
            <input
              type="text"
              id="bank_account_owner_rut"
              name="bank_account_owner_rut"
              value={formData.bank_account_owner_rut}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2A6877]"
              placeholder="Ej: 12.345.678-9"
            />
          </div>
          
          <div>
            <label htmlFor="bank_account_owner_email" className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico del Titular
            </label>
            <input
              type="email"
              id="bank_account_owner_email"
              name="bank_account_owner_email"
              value={formData.bank_account_owner_email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2A6877]"
              placeholder="Ej: correo@ejemplo.com"
            />
          </div>
        </div>
        
        <div className="mt-4">
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
              <p className="text-gray-500">
                Para procesar los pagos, la cuenta bancaria debe estar a nombre del titular del perfil.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || isLoading}
            className="px-6 py-2 bg-[#2A6877] text-white rounded-md hover:bg-[#1e4e5a] focus:outline-none focus:ring-2 focus:ring-[#2A6877] focus:ring-offset-2 transition-colors disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar Información Bancaria'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BankInfo;