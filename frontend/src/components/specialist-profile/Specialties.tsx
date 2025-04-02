import { FC } from 'react';
import { motion } from 'framer-motion';

interface SpecialtiesProps {
  therapeuticApproaches: string[];
  specialtyDisorders: string[];
}

const Specialties: FC<SpecialtiesProps> = ({
  therapeuticApproaches = [],
  specialtyDisorders = []
}) => {
  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.section 
      className="bg-white rounded-lg shadow-sm p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">🧠</span>
        <h2 className="text-xl font-semibold">Especialidades</h2>
      </div>
      
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-[#2A6877]/5 to-transparent p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center">
            <span className="text-lg mr-2">🔍</span>
            <span>Enfoques Terapéuticos</span>
          </h3>
          
          {therapeuticApproaches && therapeuticApproaches.length > 0 ? (
            <motion.div 
              className="flex flex-wrap gap-2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {therapeuticApproaches.map((approach, index) => (
                <motion.span 
                  key={index} 
                  className="px-3 py-1.5 bg-[#2A6877] bg-opacity-10 text-[#2A6877] rounded-full text-sm font-medium shadow-sm hover:bg-opacity-20 transition-colors"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {approach}
                </motion.span>
              ))}
            </motion.div>
          ) : (
            <p className="text-gray-500 italic">No se han especificado enfoques terapéuticos.</p>
          )}
        </div>
        
        <div className="bg-gradient-to-r from-[#2A6877]/5 to-transparent p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center">
            <span className="text-lg mr-2">⚕️</span>
            <span>Áreas de Intervención</span>
          </h3>
          
          {specialtyDisorders && specialtyDisorders.length > 0 ? (
            <motion.div 
              className="flex flex-wrap gap-2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {specialtyDisorders.map((disorder, index) => (
                <motion.span 
                  key={index} 
                  className="px-3 py-1.5 bg-[#2A6877] bg-opacity-10 text-[#2A6877] rounded-full text-sm font-medium shadow-sm hover:bg-opacity-20 transition-colors"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {disorder}
                </motion.span>
              ))}
            </motion.div>
          ) : (
            <p className="text-gray-500 italic">No se han especificado áreas de intervención.</p>
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default Specialties;