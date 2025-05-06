import { motion } from 'framer-motion';
import { UserIcon, EnvelopeIcon, PhoneIcon, IdentificationIcon, MapPinIcon } from '@heroicons/react/24/outline';

// Interface para los datos del formulario
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
  disabledFields?: string[];
}

// Componente para campo de formulario
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
  <motion.div 
    className="relative"
    initial={{ opacity: 0, y: 5 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    {disabled ? (
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100 hover:border-gray-200 transition-all duration-300 h-full">
        <div className="flex items-start">
          {icon && <div className="mt-0.5 mr-2 sm:mr-3 text-[#2A6877]">{icon}</div>}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-0.5 sm:mb-1">{label}</p>
            <p className="text-gray-900 font-medium text-sm sm:text-base">
              {value || <span className="text-gray-400 italic text-xs sm:text-sm">No especificado</span>}
            </p>
          </div>
        </div>
      </div>
    ) : (
      <div className="space-y-1">
        <label htmlFor={id} className="flex items-center text-xs sm:text-sm font-medium text-gray-700">
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
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2A6877] focus:ring-[#2A6877] transition-all duration-200 hover:border-[#2A6877] text-sm py-1.5 sm:py-2"
            placeholder={`Ingrese ${label.toLowerCase()}`}
          />
        </div>
      </div>
    )}
  </motion.div>
);

// Componente GenderDropdown integrado
const GenderDropdown = ({ value, onChange, isEditing }: { value: string, onChange: (value: string) => void, isEditing: boolean }) => {
  const genderOptions = [
    { value: 'MALE', label: 'Masculino' },
    { value: 'FEMALE', label: 'Femenino' },
    { value: 'OTHER', label: 'Otro' },
    { value: 'PREFER_NOT_TO_SAY', label: 'Prefiero no decir' }
  ];

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log('Gender dropdown changed to:', e.target.value); // Añadir log para depuración
    onChange(e.target.value);
  };

  const getGenderLabel = (value: string) => {
    const option = genderOptions.find(opt => opt.value === value);
    return option ? option.label : 'No especificado';
  };

  if (!isEditing) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100 hover:border-gray-200 transition-all duration-300 h-full">
        <div className="flex items-start">
          <div className="mt-0.5 mr-2 sm:mr-3 text-[#2A6877]">
            <UserIcon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-0.5 sm:mb-1">Género</p>
            <p className="text-gray-900 font-medium text-sm sm:text-base">
              {value ? getGenderLabel(value) : <span className="text-gray-400 italic text-xs sm:text-sm">No especificado</span>}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <label className="flex items-center text-xs sm:text-sm font-medium text-gray-700">
        <span className="mr-2 text-[#2A6877]"><UserIcon className="w-4 h-4" /></span>
        Género
      </label>
      <select
        value={value}
        onChange={handleSelectChange}
        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2A6877] focus:ring-[#2A6877] transition-all duration-200 hover:border-[#2A6877] text-sm py-1.5 sm:py-2"
      >
        <option value="">Seleccione su género</option>
        {genderOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const ProfileFormFields = ({ formData, isEditing, onChange, disabledFields = [] }: ProfileFormFieldsProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    onChange({
      ...formData,
      [id]: value
    });
  };

  const handleGenderChange = (value: string) => {
    if (!disabledFields.includes('gender')) {
      console.log('Actualizando género a:', value); // Añadir log para depuración
      onChange({
        ...formData,
        gender: value
      });
    }
  };

  // Animaciones para el contenedor
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.07 } 
    }
  };

  return (
    <motion.div 
      className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 md:grid-cols-2 p-3 sm:p-5 md:p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-50"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      layout
    >
      {/* Sección Información Personal */}
      <motion.div className="col-span-1 md:col-span-2 mb-2 sm:mb-3">
        <div className="flex items-center mb-1 sm:mb-2">
          <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#2A6877]/10 text-[#2A6877] mr-2 sm:mr-3">
            <UserIcon className="w-3 h-3 sm:w-4 sm:h-4" />
          </div>
          <h3 className="text-sm sm:text-md font-semibold text-gray-700">
            Información Personal
          </h3>
        </div>
        <div className="h-px bg-gradient-to-r from-[#2A6877]/20 via-[#B4E4D3]/30 to-transparent"></div>
      </motion.div>

      {/* Campos de información personal */}
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

      <motion.div 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <GenderDropdown 
          value={formData.gender}
          onChange={handleGenderChange}
          isEditing={isEditing && !disabledFields.includes('gender')}
        />
      </motion.div>

      <FormField
        id="email"
        label="Correo Electrónico"
        value={formData.email}
        onChange={handleChange}
        disabled={true}
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

      {/* Sección Ubicación */}
      <motion.div className="col-span-1 md:col-span-2 mt-2 sm:mt-4 mb-2 sm:mb-3">
        <div className="flex items-center mb-1 sm:mb-2">
          <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#B4E4D3]/30 text-[#2A6877] mr-2 sm:mr-3">
            <MapPinIcon className="w-3 h-3 sm:w-4 sm:h-4" />
          </div>
          <h3 className="text-sm sm:text-md font-semibold text-gray-700">
            Ubicación
          </h3>
        </div>
        <div className="h-px bg-gradient-to-r from-[#B4E4D3]/30 via-[#2A6877]/20 to-transparent"></div>
      </motion.div>

      {/* Campos de ubicación */}
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