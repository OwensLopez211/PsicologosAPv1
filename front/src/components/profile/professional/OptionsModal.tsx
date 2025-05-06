import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

interface OptionsModalProps {
  title: string;
  options: string[];
  selectedValues: string[];
  isEditing: boolean;
  onChange: (value: string) => void;
  onClose: () => void;
  icon?: string;
  maxSelected?: number;
}

const OptionsModal = ({
  title,
  options,
  selectedValues,
  isEditing,
  onChange,
  onClose,
  icon = "🔍",
  maxSelected = 5
}: OptionsModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [localSelectedValues, setLocalSelectedValues] = useState<string[]>([...selectedValues]);
  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Actualizar valores locales cuando cambian los props
  useEffect(() => {
    setLocalSelectedValues([...selectedValues]);
  }, [selectedValues]);
  
  // Filtrar opciones basadas en el término de búsqueda
  const filteredOptions = options.filter(option => 
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const isLimitReached = localSelectedValues.length >= maxSelected;
  
  // Manejar cambios en las selecciones localmente
  const handleOptionChange = (option: string) => {
    const alreadySelected = localSelectedValues.includes(option);
    if (!alreadySelected && isLimitReached) return;
    const newValues = alreadySelected
      ? localSelectedValues.filter(val => val !== option)
      : [...localSelectedValues, option];
    setLocalSelectedValues(newValues);
    onChange(option);
  };
  
  // Enfocar el input de búsqueda cuando se abre el modal
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);
  
  // Cerrar el modal al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  // Cerrar el modal al presionar Escape
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);
  
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <motion.div
        ref={modalRef}
        className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] sm:max-h-[80vh] overflow-hidden"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {/* Encabezado del modal */}
        <div className="p-3 sm:p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-[#2A6877]/10 to-transparent">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#2A6877]/10 flex items-center justify-center">
              <span className="text-lg sm:text-xl">{icon}</span>
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-800">{title}</h2>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="p-1 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Cerrar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Barra de búsqueda */}
        <div className="p-3 sm:p-4 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              ref={searchInputRef}
              type="text"
              className="block w-full pl-8 sm:pl-10 pr-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#2A6877] focus:border-[#2A6877]"
              placeholder="Buscar opciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            {searchTerm && (
              <button
                className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSearchTerm('');
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {/* Lista de opciones */}
        <div className="overflow-y-auto p-2 sm:p-4" style={{ maxHeight: 'calc(90vh - 150px)' }}>
          {filteredOptions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 sm:gap-2">
              {filteredOptions.map((option, index) => {
                const checked = localSelectedValues.includes(option);
                const disabled = !checked && isLimitReached;
                return (
                  <motion.div
                    key={option}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.01 }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <label
                      className={`flex items-center p-2 sm:p-3 rounded-lg border ${
                        checked
                          ? 'bg-[#2A6877] text-white border-[#2A6877]'
                          : 'border-gray-200 hover:border-[#2A6877]'
                      } ${!isEditing || disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} transition-all duration-200`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (isEditing && !disabled) {
                          handleOptionChange(option);
                        }
                      }}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        disabled={!isEditing || disabled}
                        checked={checked}
                        onChange={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (isEditing && !disabled) {
                            handleOptionChange(option);
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <motion.span 
                        className="text-xs sm:text-sm"
                        whileHover={isEditing && !disabled ? { scale: 1.02 } : {}}
                      >
                        {option}
                      </motion.span>
                    </label>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-5 sm:py-8 text-gray-500 text-xs sm:text-sm">
              No se encontraron opciones que coincidan con la búsqueda.
            </div>
          )}
          {isLimitReached && (
            <div className="text-[10px] sm:text-xs text-red-500 mt-1.5 sm:mt-2 text-center">
              Solo puedes seleccionar hasta {maxSelected} opciones.
            </div>
          )}
        </div>
        
        {/* Pie del modal con estadísticas y botones */}
        <div className="p-2.5 sm:p-4 border-t border-gray-200 bg-gray-50 flex flex-wrap justify-between items-center gap-2 sm:gap-4">
          <div className="text-xs sm:text-sm text-gray-600">
            <span className="font-medium">{localSelectedValues.length}</span> de <span className="font-medium">{options.length}</span> opciones seleccionadas
          </div>
          <div className="flex gap-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OptionsModal;