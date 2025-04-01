import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gender } from '../../types/psychologist';

interface GenderOption {
  value: string;
  label: string;
}

interface GenderDropdownProps {
  value: string;
  onChange: (value: string) => void;
  isEditing: boolean;
}

const GenderDropdown = ({ value, onChange, isEditing }: GenderDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Gender options with labels and values
  const genderOptions: GenderOption[] = [
    { value: "", label: "Seleccionar" },
    { value: "MALE", label: "Masculino" },
    { value: "FEMALE", label: "Femenino" },
  ];

  // Get the label for the current gender value
  const getCurrentLabel = () => {
    const option = genderOptions.find(opt => opt.value === value);
    return option ? option.label : "Seleccionar";
  };

  const handleSelect = (value: string) => {
    onChange(value as Gender);
    setIsOpen(false);
  };

  return (
    <div>
      <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
        Género <span className="text-gray-500 text-xs">(opcional)</span>
      </label>
      <div className="mt-1 relative">
        <button
          type="button"
          onClick={() => isEditing && setIsOpen(!isOpen)}
          disabled={!isEditing}
          className={`flex justify-between w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-left transition-colors
            ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : 'hover:border-[#2A6877]'}
            ${isOpen && isEditing ? 'border-[#2A6877] ring-1 ring-[#2A6877]' : ''}`}
          id="gender-button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className={`block truncate ${value ? 'text-gray-900' : 'text-gray-500'}`}>
            {getCurrentLabel()}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.ul
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
              tabIndex={-1}
              role="listbox"
              aria-labelledby="gender-button"
            >
              {genderOptions.map((option) => (
                <li
                  key={option.value}
                  className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-[#B4E4D3]/20 transition-colors ${
                    value === option.value ? 'bg-[#B4E4D3]/30 text-[#2A6877] font-medium' : 'text-gray-900'
                  }`}
                  onClick={() => handleSelect(option.value)}
                  role="option"
                  aria-selected={value === option.value}
                >
                  <span className="block truncate">
                    {option.label}
                  </span>
                  {value === option.value && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#2A6877]">
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GenderDropdown;