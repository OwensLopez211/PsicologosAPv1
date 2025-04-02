import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface FormFieldProps {
  formData: {
    professional_title?: string;
    health_register_number?: string;
    university?: string;
    graduation_year?: string;
  };
  isEditing: boolean;
  onChange: (field: string, value: any) => void;
  disabledFields?: string[];
}

const ProfessionalFormFields = ({ formData, isEditing, onChange, disabledFields = [] }: FormFieldProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.id, e.target.value);
  };
  
  // State for university search
  const [universitySearch, setUniversitySearch] = useState('');
  const [showUniversityDropdown, setShowUniversityDropdown] = useState(false);

  // Helper function to check if a field should be disabled
  const isFieldDisabled = (fieldId: string): boolean => {
    return !isEditing || disabledFields.includes(fieldId);
  };

  // List of Chilean universities offering psychology
  const chileanUniversities = [
    // Universidades Tradicionales
    'Universidad de Chile',
    'Pontificia Universidad Católica de Chile',
    'Universidad de Concepción',
    'Universidad de Valparaíso',
    'Universidad de Santiago de Chile',
    'Universidad de La Frontera',
    'Universidad de Talca',
    'Universidad de Tarapacá',
    'Universidad Católica del Norte',
    'Universidad de Antofagasta',
    'Universidad de Magallanes',
    'Universidad de Atacama',
    // Universidades Privadas
    'Universidad Adolfo Ibáñez',
    'Universidad Diego Portales',
    'Universidad del Desarrollo',
    'Universidad Andrés Bello',
    'Universidad San Sebastián',
    'Universidad Mayor',
    'Universidad Alberto Hurtado',
    'Universidad Central de Chile',
    'Universidad de Las Américas',
    'Universidad Santo Tomás',
    'Universidad Gabriela Mistral',
    'Universidad Academia de Humanismo Cristiano',
    'Universidad de Los Andes',
    'Universidad Católica Silva Henríquez',
    'Universidad de Viña del Mar',
    'Universidad de La Serena',
    'Universidad Bernardo O\'Higgins',
    'Universidad Autónoma de Chile',
    'Universidad de Aconcagua',
    'Universidad Miguel de Cervantes',
    'Universidad de Arte y Ciencias Sociales (ARCIS)',
    'Otra'
  ].sort();

  // Filter universities based on search
  const filteredUniversities = chileanUniversities.filter(uni => 
    uni.toLowerCase().includes(universitySearch.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowUniversityDropdown(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const formFields = [
    {
      id: 'professional_title',
      label: 'Título Profesional',
      value: formData.professional_title || '',
      placeholder: 'Ej: Psicólogo Clínico',
      type: 'text',
      icon: '🎓'
    },
    {
      id: 'health_register_number',
      label: 'Número de Registro Nacional de Prestadores',
      value: formData.health_register_number || '',
      type: 'text',
      icon: '📝'
    },
    {
      id: 'graduation_year',
      label: 'Año de Egreso',
      value: formData.graduation_year || '',
      type: 'number',
      min: 1950,
      max: new Date().getFullYear(),
      icon: '📅'
    }
  ];

  return (
    <motion.div 
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 p-4 bg-white/80 rounded-lg border border-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <motion.div
        className="col-span-2 mb-2 flex items-center gap-2"
        initial={{ x: -20 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <span className="text-lg">📋</span>
        <h3 className="text-md font-medium text-gray-700 border-b border-gray-200 pb-2 w-full">
          Datos Profesionales
        </h3>
      </motion.div>

      {/* Regular form fields */}
      {formFields.map((field, index) => (
        <motion.div 
          key={field.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
        >
          <label htmlFor={field.id} className="flex text-sm font-medium text-gray-700 items-center gap-1">
            <span>{field.icon}</span> {field.label}
          </label>
          <div className="mt-1 relative">
            <input
              type={field.type}
              id={field.id}
              value={field.value}
              onChange={handleChange}
              disabled={isFieldDisabled(field.id)}
              placeholder={field.placeholder}
              min={field.min}
              max={field.max}
              className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2A6877] focus:ring-[#2A6877] transition-all
                ${isFieldDisabled(field.id) ? 'bg-gray-50 cursor-not-allowed' : 'hover:border-[#2A6877]'}`}
            />
            {isEditing && !disabledFields.includes(field.id) && (
              <motion.div 
                className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </motion.div>
            )}
          </div>
          
          {/* Add a note for professional_title when it's disabled but in edit mode */}
          {isEditing && field.id === 'professional_title' && disabledFields.includes('professional_title') && (
            <p className="mt-1 text-xs text-amber-600">
              Este campo se actualiza automáticamente según tu género
            </p>
          )}
        </motion.div>
      ))}

      {/* University field with dropdown */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="sm:col-span-2"
      >
        <label htmlFor="university" className="flex text-sm font-medium text-gray-700 items-center gap-1">
          <span>🏛️</span> Universidad de Egreso
        </label>
        <div className="mt-1 relative">
          <div 
            onClick={(e) => {
              e.stopPropagation();
              if (!isFieldDisabled('university')) {
                setShowUniversityDropdown(!showUniversityDropdown);
              }
            }}
            className="relative cursor-pointer"
          >
            <input
              type="text"
              id="university"
              value={formData.university || ''}
              readOnly
              disabled={isFieldDisabled('university')}
              placeholder="Selecciona tu universidad"
              className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2A6877] focus:ring-[#2A6877] transition-all
                ${isFieldDisabled('university') ? 'bg-gray-50 cursor-not-allowed' : 'bg-white cursor-pointer hover:border-[#2A6877]'}`}
            />
            {isEditing && !disabledFields.includes('university') && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          
          {/* University dropdown */}
          {showUniversityDropdown && !isFieldDisabled('university') && (
            <div 
              className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 bg-white p-2 border-b shadow-sm">
                <input
                  type="text"
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-[#2A6877] focus:ring-[#2A6877] text-sm"
                  placeholder="Buscar universidad..."
                  value={universitySearch}
                  onChange={(e) => setUniversitySearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              </div>
              <div className="mt-1 max-h-52 overflow-y-auto">
                {filteredUniversities.length > 0 ? (
                  filteredUniversities.map((university, index) => (
                    <div
                      key={index}
                      className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        onChange('university', university);
                        setShowUniversityDropdown(false);
                        setUniversitySearch('');
                      }}
                    >
                      <span className={`block truncate ${formData.university === university ? 'font-medium text-[#2A6877]' : 'font-normal'}`}>
                        {university}
                      </span>
                      {formData.university === university && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#2A6877]">
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-2 px-3 text-gray-500 text-sm">
                    No se encontraron resultados
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProfessionalFormFields;