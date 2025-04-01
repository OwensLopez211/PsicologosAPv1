//  import { useState } from 'react';
import { motion } from 'framer-motion';
import GenderDropdown from './GenderDropdown';
// import { Gender } from '../../types/psychologist';

// Update the interface to match the formData structure in BasicInfo.tsx
interface FormData {
  first_name: string;
  last_name: string;
  profile_image: string;
  rut: string;
  gender: string;
  email: string;
  phone: string;
  region: string;
  city: string;
}

interface ProfileFormFieldsProps {
  formData: FormData;
  isEditing: boolean;
  onChange: (formData: FormData) => void;
  disabledFields?: string[]; // Add this prop to support disabling specific fields
}

// Reusable form field component to maintain consistency
const FormField = ({ 
  id, 
  label, 
  value, 
  onChange, 
  disabled, 
  type = 'text', 
  optional = false 
}: { 
  id: string; 
  label: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  disabled: boolean; 
  type?: string;
  optional?: boolean;
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label} {optional && <span className="text-gray-500 text-xs">(opcional)</span>}
    </label>
    <div className="mt-1">
      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2A6877] focus:ring-[#2A6877] transition-colors
          ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'hover:border-[#2A6877]'}`}
      />
    </div>
  </div>
);

const ProfileFormFields = ({ formData, isEditing, onChange, disabledFields = [] }: ProfileFormFieldsProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    onChange({
      ...formData,
      [id]: value
    });
  };

  const handleGenderChange = (value: string) => {
    // Only update gender if it's not in the disabled fields
    if (!disabledFields.includes('gender')) {
      onChange({
        ...formData,
        gender: value
      });
    }
  };

  return (
    <motion.div 
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 p-6 bg-white/80 rounded-xl shadow-sm"
      initial={{ opacity: 1, height: 'auto' }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, layout: { duration: 0.2 } }}
      layout
    >
      <div className="col-span-2 mb-2">
        <h3 className="text-md font-medium text-gray-700 border-b border-gray-200 pb-2">
          Información Personal
        </h3>
      </div>

      <FormField
        id="first_name"
        label="Nombre"
        value={formData.first_name}
        onChange={handleChange}
        disabled={!isEditing}
      />

      <FormField
        id="last_name"
        label="Apellido"
        value={formData.last_name}
        onChange={handleChange}
        disabled={!isEditing}
      />

      <FormField
        id="rut"
        label="RUT"
        value={formData.rut}
        onChange={handleChange}
        disabled={!isEditing}
        optional={true}
      />

      <GenderDropdown 
        value={formData.gender}
        onChange={handleGenderChange}
        isEditing={isEditing && !disabledFields.includes('gender')}
      />
      
      {/* Keep the existing note for when gender is disabled */}
      {isEditing && disabledFields.includes('gender') && (
        <div className="col-span-2 -mt-4">
          <p className="text-xs text-gray-500 italic">
            El género no se puede modificar ya que afecta al título profesional
          </p>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="col-span-2 mt-4 mb-2"
      >
        <h3 className="text-md font-medium text-gray-700 border-b border-gray-200 pb-2">
          Información de Contacto
        </h3>
      </motion.div>

      <FormField
        id="email"
        label="Email"
        value={formData.email}
        onChange={handleChange}
        disabled={true}
        type="email"
      />

      <FormField
        id="phone"
        label="Teléfono"
        value={formData.phone}
        onChange={handleChange}
        disabled={!isEditing}
        type="tel"
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="col-span-2 mt-4 mb-2"
      >
        <h3 className="text-md font-medium text-gray-700 border-b border-gray-200 pb-2">
          Ubicación
        </h3>
      </motion.div>

      <FormField
        id="region"
        label="Región"
        value={formData.region}
        onChange={handleChange}
        disabled={!isEditing}
      />

      <FormField
        id="city"
        label="Ciudad"
        value={formData.city}
        onChange={handleChange}
        disabled={!isEditing}
      />
    </motion.div>
  );
};

export default ProfileFormFields;