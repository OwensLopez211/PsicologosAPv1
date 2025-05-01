import { useState, useEffect } from 'react';
import { updateBankInfo } from '../../services/profileService';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import BankInfoForm from './bankinfo/BankInfoForm';

interface BankInfoProps {
  profile: any;
  onSave: (data: any) => Promise<void>;
  isLoading: boolean;
  onProfileUpdate?: (updatedProfile: any) => void; // Add this prop to handle profile updates
}

const BankInfo = ({ profile, isLoading, onProfileUpdate }: Omit<BankInfoProps, 'onSave'>) => {
  const { user } = useAuth();
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

  useEffect(() => {
    if (profile) {
      setFormData({
        bank_account_number: profile.bank_account_number || '',
        bank_account_type: profile.bank_account_type || '',
        bank_account_owner: profile.bank_account_owner || '',
        bank_account_owner_rut: profile.bank_account_owner_rut || '',
        bank_account_owner_email: profile.bank_account_owner_email || '',
        bank_name: profile.bank_name || '', // Fixed duplicate key
      });
      
      // Set disclaimer to true if profile already has bank info
      if (profile.bank_account_number) {
        setDisclaimer(true);
      }
    }
  }, [profile]);

  // Format RUT as user types (XX.XXX.XXX-X)
  const formatRut = (rut: string) => {
    // Remove all non-alphanumeric characters
    let value = rut.replace(/[^0-9kK]/g, '');
    
    if (value.length > 1) {
      // Extract verification digit
      const dv = value.slice(-1);
      // Get the main part of the RUT
      let rutBody = value.slice(0, -1);
      
      // Add thousands separators
      rutBody = rutBody.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      
      // Combine parts with hyphen
      value = rutBody + '-' + dv;
    }
    
    return value;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'bank_account_owner_rut') {
      // Format RUT as user types
      setFormData(prev => ({
        ...prev,
        [name]: formatRut(value)
      }));
    } else if (name === 'bank_account_number') {
      // Only allow numbers for account number
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
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

  // Get description text based on user type
  const getDescriptionText = () => {
    switch(user?.user_type) {
      case 'psychologist':
        return 'Esta información será utilizada para realizar transferencias por tus servicios profesionales.';
      case 'client':
        return 'Esta información será utilizada para procesar reembolsos o devoluciones si fuera necesario.';
      case 'admin':
        return 'Esta información será utilizada para procesar transacciones administrativas.';
      default:
        return 'Esta información será utilizada para realizar transferencias.';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-6 border border-gray-100"
    >
      <div className="flex items-center mb-6">
        <div className="bg-[#2A6877]/10 p-2 rounded-full mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#2A6877]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-800">Información Bancaria</h2>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6 border-l-4 border-blue-500">
        <p className="text-gray-700">
          {getDescriptionText()} Por favor, asegúrate de que los datos sean correctos.
        </p>
      </div>
      
      <BankInfoForm 
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        disclaimer={disclaimer}
        setDisclaimer={setDisclaimer}
        saving={saving}
        isLoading={isLoading}
      />
    </motion.div>
  );
};

export default BankInfo;