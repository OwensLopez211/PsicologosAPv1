import { motion } from 'framer-motion';

interface ExperienceFieldProps {
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
}

const ExperienceField = ({ value, isEditing, onChange }: ExperienceFieldProps) => {
  return (
    <motion.div 
      className="p-4 bg-white/80 rounded-lg border border-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <motion.div
        className="mb-2 flex items-center gap-2"
        initial={{ x: -20 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <span className="text-lg">📚</span>
        <h3 className="text-md font-medium text-gray-700 border-b border-gray-200 pb-2 w-full">
          Experiencia Profesional
        </h3>
      </motion.div>

      <div className="mt-1 relative">
        <textarea
          id="experience_description"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={!isEditing}
          rows={4}
          placeholder="Describe tu experiencia profesional..."
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2A6877] focus:ring-[#2A6877] transition-all
            ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : 'hover:border-[#2A6877]'}`}
        />
        {isEditing && (
          <motion.div 
            className="absolute top-2 right-2 pr-1 flex items-center pointer-events-none"
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
    </motion.div>
  );
};

export default ExperienceField;