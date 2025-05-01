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
        staggerChildren: 0.07,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.section
      className="bg-white rounded-lg shadow-md p-6 border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="flex items-center mb-6">
        <motion.div
          className="w-10 h-10 rounded-full bg-[#2A6877]/10 flex items-center justify-center mr-3"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#2A6877]" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        </motion.div>
        <h2 className="text-xl font-bold text-gray-800">Especialidades</h2>
      </div>
      
      <div className="space-y-6">
        {/* Therapeutic Approaches Section */}
        <motion.div 
          className="bg-gradient-to-r from-[#2A6877]/10 to-transparent p-5 rounded-lg border border-[#2A6877]/10"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
            <div className="w-8 h-8 rounded-full bg-[#2A6877]/15 flex items-center justify-center mr-2 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#2A6877]" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z" clipRule="evenodd" />
              </svg>
            </div>
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
                  className="px-3 py-1.5 bg-[#2A6877]/15 text-[#2A6877] rounded-full text-sm font-medium shadow-sm hover:bg-[#2A6877]/25 transition-colors flex items-center"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2A6877] mr-1.5"></span>
                  {approach}
                </motion.span>
              ))}
            </motion.div>
          ) : (
            <div className="bg-gray-50 border border-gray-100 rounded-md p-3 text-gray-500 italic text-sm">
              No se han especificado enfoques terapéuticos.
            </div>
          )}
        </motion.div>
        
        {/* Intervention Areas Section */}
        <motion.div 
          className="bg-gradient-to-r from-[#2A6877]/10 to-transparent p-5 rounded-lg border border-[#2A6877]/10"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
            <div className="w-8 h-8 rounded-full bg-[#2A6877]/15 flex items-center justify-center mr-2 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#2A6877]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z" clipRule="evenodd" />
              </svg>
            </div>
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
                  className="px-3 py-1.5 bg-[#2A6877]/15 text-[#2A6877] rounded-full text-sm font-medium shadow-sm hover:bg-[#2A6877]/25 transition-colors flex items-center"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2A6877] mr-1.5"></span>
                  {disorder}
                </motion.span>
              ))}
            </motion.div>
          ) : (
            <div className="bg-gray-50 border border-gray-100 rounded-md p-3 text-gray-500 italic text-sm">
              No se han especificado áreas de intervención.
            </div>
          )}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Specialties;