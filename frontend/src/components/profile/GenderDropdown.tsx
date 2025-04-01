import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gender } from '../../types/psychologist';

interface GenderOption {
  value: string;
  label: string;
  icon: string;
}

interface GenderDropdownProps {
  value: string;
  onChange: (value: string) => void;
  isEditing: boolean;
}

const GenderDropdown = ({ value, onChange, isEditing }: GenderDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Enhanced gender options with icons
  const genderOptions: GenderOption[] = [
    { value: "", label: "Seleccionar", icon: "🔍" },
    { value: "MALE", label: "Masculino", icon: "👨" },
    { value: "FEMALE", label: "Femenino", icon: "👩" },
  ];

  // Get the current selected option
  const getCurrentOption = () => {
    return genderOptions.find(opt => opt.value === value) || genderOptions[0];
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (value: string) => {
    onChange(value as Gender);
    setIsOpen(false);
  };

  const currentOption = getCurrentOption();

  return (
    <div ref={dropdownRef}>
      <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
        Género <span className="text-gray-500 text-xs">(opcional)</span>
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => isEditing && setIsOpen(!isOpen)}
          disabled={!isEditing}
          className={`flex justify-between items-center w-full rounded-md border shadow-sm px-4 py-2.5 text-left transition-all duration-200
            ${!isEditing ? 'bg-gray-50 border-gray-200 cursor-not-allowed' : 'bg-white border-gray-300 hover:border-[#2A6877] hover:shadow-sm'}
            ${isOpen && isEditing ? 'border-[#2A6877] ring-1 ring-[#2A6877] shadow-sm' : ''}`}
          id="gender-button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <div className="flex items-center">
            <span className="text-lg mr-2">{currentOption.icon}</span>
            <span className={`block truncate ${value ? 'text-gray-900' : 'text-gray-500'}`}>
              {currentOption.label}
            </span>
          </div>
          <motion.span 
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none flex items-center"
          >
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </motion.span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.ul
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
              tabIndex={-1}
              role="listbox"
              aria-labelledby="gender-button"
            >
              {genderOptions.map((option) => (
                <motion.li
                  key={option.value}
                  whileHover={{ backgroundColor: "rgba(180, 228, 211, 0.2)" }}
                  className={`cursor-pointer select-none relative py-2.5 pl-3 pr-9 transition-colors ${
                    value === option.value ? 'bg-[#B4E4D3]/30 text-[#2A6877] font-medium' : 'text-gray-900'
                  }`}
                  onClick={() => handleSelect(option.value)}
                  role="option"
                  aria-selected={value === option.value}
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{option.icon}</span>
                    <span className="block truncate">
                      {option.label}
                    </span>
                  </div>
                  {value === option.value && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#2A6877]">
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
      {isEditing && !value && (
        <p className="mt-1 text-xs text-amber-600">
          Seleccionar un género ayuda a personalizar tu perfil profesional
        </p>
      )}
      {!isEditing && value && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-1 text-xs text-gray-500"
        >
          Este campo afecta directamente al título profesional de tu perfil
        </motion.div>
      )}
    </div>
  );
};

export default GenderDropdown;