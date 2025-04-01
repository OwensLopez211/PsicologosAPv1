import { motion } from 'framer-motion';

interface FormFieldProps {
  formData: {
    professional_title?: string;
    health_register_number?: string;
    university?: string;
    graduation_year?: string;
  };
  isEditing: boolean;
  onChange: (field: string, value: any) => void;
  disabledFields?: string[]; // Add this prop to support disabling specific fields
}

const ProfessionalFormFields = ({ formData, isEditing, onChange, disabledFields = [] }: FormFieldProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.id, e.target.value);
  };

  // Helper function to check if a field should be disabled
  const isFieldDisabled = (fieldId: string): boolean => {
    return !isEditing || disabledFields.includes(fieldId);
  };

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
      id: 'university',
      label: 'Universidad de Egreso',
      value: formData.university || '',
      type: 'text',
      icon: '🏛️'
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
    </motion.div>
  );
};

export default ProfessionalFormFields;