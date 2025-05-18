import { motion } from 'framer-motion';
import { UserIcon, EnvelopeIcon, PhoneIcon, IdentificationIcon, MapPinIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import regionesComunas, { getComunasByRegion } from '../../../utils/regionesComunas';

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
  icon,
  infoMessage,
  onKeyDown,
  onClick
}: { 
  id: string; 
  label: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  disabled: boolean; 
  type?: string;
  optional?: boolean;
  icon?: React.ReactNode;
  infoMessage?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
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
        {infoMessage && (
          <div className="mt-2 flex items-start space-x-1.5 rounded-md bg-blue-50/80 p-2 text-xs text-blue-700">
            <InformationCircleIcon className="h-4 w-4 flex-shrink-0 text-blue-500" />
            <p>{infoMessage}</p>
          </div>
        )}
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
            onKeyDown={onKeyDown}
            onClick={onClick}
            disabled={disabled}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2A6877] focus:ring-[#2A6877] transition-all duration-200 hover:border-[#2A6877] text-sm py-1.5 sm:py-2"
            placeholder={`Ingrese ${label.toLowerCase()}`}
          />
        </div>
        {infoMessage && (
          <div className="mt-2 flex items-start space-x-1.5 rounded-md bg-blue-50/80 p-2 text-xs text-blue-700">
            <InformationCircleIcon className="h-4 w-4 flex-shrink-0 text-blue-500" />
            <p>{infoMessage}</p>
          </div>
        )}
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

// Componente para selección de región
const RegionDropdown = ({ 
  value, 
  onChange, 
  isEditing 
}: { 
  value: string, 
  onChange: (value: string) => void, 
  isEditing: boolean 
}) => {
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  if (!isEditing) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100 hover:border-gray-200 transition-all duration-300 h-full">
        <div className="flex items-start">
          <div className="mt-0.5 mr-2 sm:mr-3 text-[#2A6877]">
            <MapPinIcon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-0.5 sm:mb-1">Región</p>
            <p className="text-gray-900 font-medium text-sm sm:text-base">
              {value || <span className="text-gray-400 italic text-xs sm:text-sm">No especificado</span>}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <label className="flex items-center text-xs sm:text-sm font-medium text-gray-700">
        <span className="mr-2 text-[#2A6877]"><MapPinIcon className="w-4 h-4" /></span>
        Región
      </label>
      <select
        value={value}
        onChange={handleSelectChange}
        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2A6877] focus:ring-[#2A6877] transition-all duration-200 hover:border-[#2A6877] text-sm py-1.5 sm:py-2"
      >
        <option value="">Seleccione su región</option>
        {regionesComunas.regiones.map(regionData => (
          <option key={regionData.region} value={regionData.region}>
            {regionData.region}
          </option>
        ))}
      </select>
    </div>
  );
};

// Componente para selección de comuna
const ComunaDropdown = ({ 
  value, 
  onChange, 
  isEditing,
  selectedRegion
}: { 
  value: string, 
  onChange: (value: string) => void, 
  isEditing: boolean,
  selectedRegion: string
}) => {
  const [comunasList, setComunasList] = useState<string[]>([]);

  // Actualizar lista de comunas cuando cambia la región seleccionada
  useEffect(() => {
    if (!selectedRegion) {
      setComunasList([]);
      return;
    }
    
    setComunasList(getComunasByRegion(selectedRegion));
  }, [selectedRegion]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  if (!isEditing) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100 hover:border-gray-200 transition-all duration-300 h-full">
        <div className="flex items-start">
          <div className="mt-0.5 mr-2 sm:mr-3 text-[#2A6877]">
            <MapPinIcon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-0.5 sm:mb-1">Comuna</p>
            <p className="text-gray-900 font-medium text-sm sm:text-base">
              {value || <span className="text-gray-400 italic text-xs sm:text-sm">No especificado</span>}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <label className="flex items-center text-xs sm:text-sm font-medium text-gray-700">
        <span className="mr-2 text-[#2A6877]"><MapPinIcon className="w-4 h-4" /></span>
        Comuna
      </label>
      <select
        value={value}
        onChange={handleSelectChange}
        disabled={!selectedRegion}
        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2A6877] focus:ring-[#2A6877] transition-all duration-200 hover:border-[#2A6877] text-sm py-1.5 sm:py-2 disabled:bg-gray-100 disabled:text-gray-500"
      >
        <option value="">
          {selectedRegion ? 'Seleccione su comuna' : 'Primero seleccione una región'}
        </option>
        {comunasList.map(comuna => (
          <option key={comuna} value={comuna}>
            {comuna}
          </option>
        ))}
      </select>
    </div>
  );
};

const ProfileFormFields = ({ formData, isEditing, onChange, disabledFields = [] }: ProfileFormFieldsProps) => {
  // Estado para controlar si el teléfono ha sido inicializado con formato
  const [phoneInitialized, setPhoneInitialized] = useState(false);

  // Inicializar el teléfono con el formato +56 9 si está vacío o no tiene el formato correcto
  if (!phoneInitialized && isEditing && !disabledFields.includes('phone')) {
    if (!formData.phone.startsWith('+56 9 ')) {
      // Si está vacío o no tiene el formato correcto, establecer el prefijo
      const updatedPhone = formData.phone ? formData.phone : '+56 9 ';
      
      onChange({
        ...formData,
        phone: updatedPhone.startsWith('+56 9 ') ? updatedPhone : '+56 9 ' + updatedPhone.replace(/^\+56 ?9? ?/, '')
      });
    }
    setPhoneInitialized(true);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    
    // Si es el campo de teléfono, aplicar reglas especiales
    if (id === 'phone') {
      handlePhoneChange(value);
      return;
    }
    
    onChange({
      ...formData,
      [id]: value
    });
  };

  // Nueva función específica para manejar cambios en el teléfono
  const handlePhoneChange = (value: string) => {
    const prefix = '+56 9 ';
    
    // Si el valor es más corto que el prefijo, mantener solo el prefijo
    if (value.length < prefix.length) {
      onChange({
        ...formData,
        phone: prefix
      });
      return;
    }
    
    // Obtener solo los dígitos después del prefijo
    const digitsAfterPrefix = value.substring(prefix.length).replace(/\D/g, '');
    
    // Limitar a 8 dígitos
    const limitedDigits = digitsAfterPrefix.substring(0, 8);
    
    // Formatear con espacio después de los primeros 4 dígitos
    let formattedValue = prefix;
    
    if (limitedDigits.length > 0) {
      // Primeros 4 dígitos
      formattedValue += limitedDigits.substring(0, Math.min(4, limitedDigits.length));
      
      // Espacio y siguientes dígitos después de los primeros 4
      if (limitedDigits.length > 4) {
        formattedValue += ' ' + limitedDigits.substring(4);
      }
    }
    
    onChange({
      ...formData,
      phone: formattedValue
    });
  };

  const handleGenderChange = (value: string) => {
    if (!disabledFields.includes('gender')) {
      onChange({
        ...formData,
        gender: value
      });
    }
  };

  // Manejar cambio de región
  const handleRegionChange = (value: string) => {
    if (!disabledFields.includes('region')) {
      // Al cambiar de región, reseteamos la comuna
      onChange({
        ...formData,
        region: value,
        city: '' // Reset comuna cuando cambia la región
      });
    }
  };

  // Manejar cambio de comuna
  const handleCityChange = (value: string) => {
    if (!disabledFields.includes('city')) {
      onChange({
        ...formData,
        city: value
      });
    }
  };

  // Manejar el keydown en el campo de teléfono
  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const prefix = '+56 9 ';
    const input = e.target as HTMLInputElement;
    const cursorPos = input.selectionStart || 0;
    
    // No permitir modificar el prefijo
    if (cursorPos < prefix.length && e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'Tab') {
      e.preventDefault();
      return;
    }
    
    // Para tecla de borrado, prevenir borrar el prefijo
    if (e.key === 'Backspace') {
      if (cursorPos <= prefix.length) {
        e.preventDefault();
        return;
      }
    }
    
    // Permitir teclas de navegación y control
    if (['ArrowLeft', 'ArrowRight', 'Tab', 'Delete', 'Backspace'].includes(e.key)) {
      return;
    }
    
    // Permitir solo números
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
      return;
    }
    
    // Limitar a 8 dígitos después del prefijo
    const currentDigits = formData.phone.replace(/\D/g, '').substring(2); // Quitamos el '56'
    if (currentDigits.length >= 8) {
      e.preventDefault();
      return;
    }
  };

  // Nueva función para manejar el clic en el campo de teléfono
  const handlePhoneClick = (e: React.MouseEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement;
    const prefix = '+56 9 ';
    
    // Si el cursor está antes del final del prefijo, moverlo después del prefijo
    if (input.selectionStart && input.selectionStart < prefix.length) {
      setTimeout(() => {
        input.setSelectionRange(prefix.length, prefix.length);
      }, 0);
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
        infoMessage="Si deseas cambiar tu correo electrónico, debes crear una nueva cuenta o contactar a soporte@emindapp.cl para solicitar el cambio."
      />

      <FormField
        id="phone"
        label="Teléfono"
        value={formData.phone}
        onChange={handleChange}
        onKeyDown={handlePhoneKeyDown}
        onClick={handlePhoneClick}
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

      {/* Reemplazamos los campos de región y ciudad por selectores */}
      <motion.div 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <RegionDropdown
          value={formData.region}
          onChange={handleRegionChange}
          isEditing={isEditing && !disabledFields.includes('region')}
        />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ComunaDropdown
          value={formData.city}
          onChange={handleCityChange}
          isEditing={isEditing && !disabledFields.includes('city')}
          selectedRegion={formData.region}
        />
      </motion.div>
    </motion.div>
  );
};

export default ProfileFormFields;