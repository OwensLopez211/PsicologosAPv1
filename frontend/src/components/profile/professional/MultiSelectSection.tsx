import { motion } from 'framer-motion';

interface MultiSelectSectionProps {
  title: string;
  options: string[];
  selectedValues: string[];
  isEditing: boolean;
  onChange: (value: string) => void;
  icon?: string;
}

const MultiSelectSection = ({ 
  title, 
  options, 
  selectedValues, 
  isEditing, 
  onChange,
  icon = "🔍"
}: MultiSelectSectionProps) => {
  return (
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
        {options.map((option, index) => (
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
      </div>
    </motion.div>
  );
};

export default MultiSelectSection;