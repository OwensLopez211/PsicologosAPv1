import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

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
  
  // Estado para la búsqueda de universidades
  const [universitySearch, setUniversitySearch] = useState('');
  const [showUniversityDropdown, setShowUniversityDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Función para verificar si un campo debe estar deshabilitado
  const isFieldDisabled = (fieldId: string): boolean => {
    return !isEditing || disabledFields.includes(fieldId);
  };

  // Lista de universidades chilenas que ofrecen psicología
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

  // Filtrar universidades basado en la búsqueda
  const filteredUniversities = chileanUniversities.filter(uni => 
    uni.toLowerCase().includes(universitySearch.toLowerCase())
  );

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUniversityDropdown(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Enfocar input de búsqueda cuando se abre el dropdown
  useEffect(() => {
    if (showUniversityDropdown && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showUniversityDropdown]);

  // Campos del formulario
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

  // Variantes para animaciones
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        when: "beforeChildren",
        staggerChildren: 0.07
      }
    }
  };

  const fieldVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.3, 
        delay: i * 0.05,
        ease: "easeOut"
      }
    })
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, height: 0 },
    visible: { 
      opacity: 1, 
      y: 0, 
      height: 'auto',
      transition: { 
        duration: 0.2,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      height: 0,
      transition: { duration: 0.15 }
    }
  };

  return (
    <motion.div 
      className="p-5 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="mb-4 flex items-center gap-3"
        variants={fieldVariants}
        custom={0}
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#2A6877]/10 to-[#B4E4D3]/20 text-[#2A6877]">
          <span className="text-xl">📋</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-800">
          Datos Profesionales
        </h3>
      </motion.div>

      <div className="h-px w-full bg-gradient-to-r from-[#2A6877]/20 via-[#B4E4D3]/20 to-transparent mb-5"></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Campos regulares del formulario */}
        {formFields.map((field, index) => (
          <motion.div 
            key={field.id}
            variants={fieldVariants}
            custom={index + 1}
          >
            <label htmlFor={field.id} className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#2A6877]/10 text-[#2A6877]">
                <span className="text-sm">{field.icon}</span>
              </div>
              {field.label}
            </label>
            <div className="relative">
              <input
                type={field.type}
                id={field.id}
                value={field.value}
                onChange={handleChange}
                disabled={isFieldDisabled(field.id)}
                placeholder={field.placeholder}
                min={field.min}
                max={field.max}
                className={`
                  block w-full rounded-lg border-gray-300 shadow-sm 
                  focus:border-[#2A6877] focus:ring-[#2A6877] transition-all duration-200
                  ${isFieldDisabled(field.id) 
                    ? 'bg-gray-50/80 cursor-not-allowed' 
                    : 'hover:border-[#2A6877]/70 bg-white/90'
                  }
                `}
              />
              {isEditing && !disabledFields.includes(field.id) && (
                <motion.div 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg className="h-4 w-4 text-[#2A6877]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </motion.div>
              )}
            </div>
            
            {/* Nota para título profesional cuando está deshabilitado pero en modo edición */}
            {isEditing && field.id === 'professional_title' && disabledFields.includes('professional_title') && (
              <motion.p 
                className="mt-1 text-xs text-amber-600 flex items-center gap-1"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Este campo se actualiza automáticamente según tu género
              </motion.p>
            )}
          </motion.div>
        ))}

        {/* Campo Universidad con dropdown */}
        <motion.div
          variants={fieldVariants}
          custom={4}
          className="sm:col-span-2"
          ref={dropdownRef}
        >
          <label htmlFor="university" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#2A6877]/10 text-[#2A6877]">
              <span className="text-sm">🏛️</span>
            </div>
            Universidad de Egreso
          </label>
          <div className="relative">
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
                className={`
                  block w-full rounded-lg border-gray-300 shadow-sm 
                  focus:border-[#2A6877] focus:ring-[#2A6877] transition-all duration-200
                  ${isFieldDisabled('university') 
                    ? 'bg-gray-50/80 cursor-not-allowed' 
                    : 'hover:border-[#2A6877]/70 bg-white/90 cursor-pointer'
                  }
                `}
              />
              {isEditing && !disabledFields.includes('university') && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className={`h-4 w-4 transition-transform duration-200 text-[#2A6877] ${showUniversityDropdown ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* Universidad dropdown con AnimatePresence */}
            <AnimatePresence>
              {showUniversityDropdown && !isFieldDisabled('university') && (
                <motion.div 
                  className="absolute z-50 mt-1 w-full bg-white/95 backdrop-blur-sm shadow-lg max-h-60 rounded-lg border border-gray-200 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="sticky top-0 z-10 bg-white p-2 border-b">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <input
                        ref={searchInputRef}
                        type="text"
                        className="w-full pl-10 pr-3 py-2 border-gray-300 rounded-lg text-sm focus:border-[#2A6877] focus:ring-[#2A6877]"
                        placeholder="Buscar universidad..."
                        value={universitySearch}
                        onChange={(e) => setUniversitySearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="max-h-52 overflow-y-auto">
                    {filteredUniversities.length > 0 ? (
                      filteredUniversities.map((university, index) => (
                        <motion.div
                          key={index}
                          className={`
                            cursor-pointer select-none relative py-2.5 px-4 hover:bg-[#2A6877]/5 transition-colors
                            ${formData.university === university ? 'bg-[#2A6877]/10' : ''}
                          `}
                          onClick={() => {
                            onChange('university', university);
                            setShowUniversityDropdown(false);
                            setUniversitySearch('');
                          }}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02, duration: 0.15 }}
                          whileHover={{ x: 3 }}
                        >
                          <div className="flex items-center">
                            {formData.university === university && (
                              <motion.span 
                                className="mr-2 text-[#2A6877]"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                              >
                                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </motion.span>
                            )}
                            <span className={`block truncate ${formData.university === university ? 'text-[#2A6877] font-medium' : 'text-gray-700'}`}>
                              {university}
                            </span>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="py-4 px-3 text-gray-500 text-sm text-center">
                        No se encontraron resultados
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Texto de ayuda en modo edición */}
          {isEditing && !disabledFields.includes('university') && (
            <motion.p 
              className="mt-1 text-xs text-gray-500 flex items-center gap-1"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Haz clic para seleccionar tu universidad de egreso
            </motion.p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProfessionalFormFields;