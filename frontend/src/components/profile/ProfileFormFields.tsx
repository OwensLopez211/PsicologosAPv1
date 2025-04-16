//  import { useState } from 'react';
import { motion } from 'framer-motion';
import GenderDropdown from './GenderDropdown';
import { UserIcon, EnvelopeIcon, PhoneIcon, IdentificationIcon, MapPinIcon } from '@heroicons/react/24/outline';

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
  optional = false,
  icon
}: { 
  id: string; 
  label: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  disabled: boolean; 
  type?: string;
  optional?: boolean;
  icon?: React.ReactNode;
}) => (
  <div className="relative">
    {disabled ? (
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 h-full">
        <div className="flex items-start">
          {icon && <div className="mt-0.5 mr-3 text-[#2A6877]">{icon}</div>}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
            <p className="text-gray-900 font-medium">
              {value || <span className="text-gray-400 italic text-sm">No especificado</span>}
            </p>
          </div>
        </div>
      </div>
    ) : (
      <div className="space-y-1">
        <label htmlFor={id} className="flex items-center text-sm font-medium text-gray-700">
          {icon && <span className="mr-2 text-[#2A6877]">{icon}</span>}
          {label} {optional && <span className="text-gray-500 text-xs ml-1">(opcional)</span>}
        </label>
        <div className="relative">
          <input
            type={type}
            id={id}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2A6877] focus:ring-[#2A6877] transition-all duration-200 hover:border-[#2A6877]"
            placeholder={`Ingrese ${label.toLowerCase()}`}
          />
        </div>
      </div>
    )}
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
      console.log('Updating gender to:', value); // Add logging
      onChange({
        ...formData,
        gender: value
      });
    }
  };

  return (
    <motion.div 
      className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 p-5 sm:p-6 bg-white rounded-xl shadow-sm"
      initial={{ opacity: 1, height: 'auto' }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, layout: { duration: 0.2 } }}
      layout
    >
      <div className="col-span-1 md:col-span-2 mb-1 sm:mb-2">
        <h3 className="text-md font-medium text-gray-700 border-b border-gray-200 pb-2 flex items-center">
          <UserIcon className="w-5 h-5 mr-2 text-[#2A6877]" />
          Información Personal
        </h3>
      </div>

      <FormField
        id="first_name"
        label="Nombre"
        value={formData.first_name}
        onChange={handleChange}
        disabled={!isEditing}
        icon={<UserIcon className="w-4 h-4" />}
      />

      <FormField
        id="last_name"
        label="Apellido"
        value={formData.last_name}
        onChange={handleChange}
        disabled={!isEditing}
        icon={<UserIcon className="w-4 h-4" />}
      />

      <FormField
        id="rut"
        label="RUT"
        value={formData.rut}
        onChange={handleChange}
        disabled={!isEditing || disabledFields.includes('rut')}
        optional={true}
        icon={<IdentificationIcon className="w-4 h-4" />}
      />

      <div className={isEditing ? "" : "bg-white rounded-lg p-4 shadow-sm border border-gray-100 h-full"}>
        {isEditing ? (
          <GenderDropdown 
            value={formData.gender}
            onChange={handleGenderChange}
            isEditing={isEditing && !disabledFields.includes('gender')}
          />
        ) : (
          <div className="flex items-start">
            <div className="mt-0.5 mr-3 text-[#2A6877]">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Género</p>
              <p className="text-gray-900 font-medium">
                {formData.gender === 'MALE' ? 'Masculino' : 
                 formData.gender === 'FEMALE' ? 'Femenino' : 
                 formData.gender === 'OTHER' ? 'Otro' : 
                 formData.gender === 'PREFER_NOT_TO_SAY' ? 'Prefiero no decir' : 
                 <span className="text-gray-400 italic text-sm">No especificado</span>}
              </p>
            </div>
          </div>
        )}
      </div>

      <FormField
        id="email"
        label="Correo Electrónico"
        value={formData.email}
        onChange={handleChange}
        disabled={true} // Email is always disabled
        type="email"
        icon={<EnvelopeIcon className="w-4 h-4" />}
      />

      <FormField
        id="phone"
        label="Teléfono"
        value={formData.phone}
        onChange={handleChange}
        disabled={!isEditing || disabledFields.includes('phone')}
        optional={true}
        icon={<PhoneIcon className="w-4 h-4" />}
      />

      <div className="col-span-1 md:col-span-2 mt-3 sm:mt-4 mb-1 sm:mb-2">
        <h3 className="text-md font-medium text-gray-700 border-b border-gray-200 pb-2 flex items-center">
          <MapPinIcon className="w-5 h-5 mr-2 text-[#2A6877]" />
          Ubicación
        </h3>
      </div>

      <FormField
        id="region"
        label="Región"
        value={formData.region}
        onChange={handleChange}
        disabled={!isEditing || disabledFields.includes('region')}
        optional={true}
        icon={<MapPinIcon className="w-4 h-4" />}
      />

      <FormField
        id="city"
        label="Ciudad"
        value={formData.city}
        onChange={handleChange}
        disabled={!isEditing || disabledFields.includes('city')}
        optional={true}
        icon={<MapPinIcon className="w-4 h-4" />}
      />
    </motion.div>
  );
};

export default ProfileFormFields;