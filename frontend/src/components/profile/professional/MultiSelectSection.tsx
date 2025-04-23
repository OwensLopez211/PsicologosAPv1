import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import OptionsModal from './OptionsModal';

interface MultiSelectSectionProps {
  title: string;
  options: string[];
  selectedValues: string[];
  isEditing: boolean;
  onChange: (value: string) => void;
  icon?: string;
  maxVisibleOptions?: number;
}

const MultiSelectSection = ({ 
  title, 
  options, 
  selectedValues, 
  isEditing, 
  onChange,
  icon = "🔍",
  maxVisibleOptions = 9
}: MultiSelectSectionProps) => {
  const [showModal, setShowModal] = useState(false);
  
  // Dividir las opciones en visibles e invisibles
  const visibleOptions = options.slice(0, maxVisibleOptions);
  const hasMoreOptions = options.length > maxVisibleOptions;
  
  return (
    <>
      <motion.div 
        className="p-4 bg-white/80 rounded-lg border border-gray-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <motion.div
          className="mb-3 flex items-center gap-2"
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-lg">{icon}</span>
          <h3 className="text-md font-medium text-gray-700 border-b border-gray-200 pb-2 w-full">
            {title}
          </h3>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {visibleOptions.map((option, index) => (
            <motion.div
              key={option}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.1 + index * 0.03 }}
            >
              <label
                className={`flex items-center p-3 rounded-lg border ${
                  selectedValues.includes(option)
                    ? 'bg-[#2A6877] text-white border-[#2A6877]'
                    : 'border-gray-200 hover:border-[#2A6877]'
                } ${!isEditing ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} transition-all duration-200`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  disabled={!isEditing}
                  checked={selectedValues.includes(option)}
                  onChange={() => onChange(option)}
                />
                <motion.span 
                  className="text-sm"
                  whileHover={isEditing ? { scale: 1.02 } : {}}
                >
                  {option}
                </motion.span>
              </label>
            </motion.div>
          ))}
          
          {/* Botón "Ver más" si hay más opciones */}
          {hasMoreOptions && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.1 + visibleOptions.length * 0.03 }}
            >
              <button
                onClick={(e) => {
                  e.preventDefault(); // Prevenir comportamiento por defecto
                  e.stopPropagation(); // Detener propagación del evento
                  setShowModal(true);
                }}
                className={`flex items-center justify-center p-3 w-full h-full rounded-lg border border-dashed 
                  ${isEditing ? 'border-[#2A6877] text-[#2A6877] hover:bg-[#2A6877]/5' : 'border-gray-300 text-gray-400 cursor-not-allowed'} 
                  transition-all duration-200`}
                disabled={!isEditing}
              >
                <motion.span 
                  className="text-sm flex items-center gap-1"
                  whileHover={isEditing ? { scale: 1.05 } : {}}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  Ver más opciones ({options.length - maxVisibleOptions})
                </motion.span>
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
      
      {/* Modal con todas las opciones */}
      <AnimatePresence>
        {showModal && (
          <OptionsModal
            title={title}
            options={options}
            selectedValues={selectedValues}
            onChange={onChange}
            onClose={() => setShowModal(false)}
            isEditing={isEditing}
            icon={icon}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default MultiSelectSection;