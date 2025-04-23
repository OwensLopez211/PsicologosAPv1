import React from 'react';
import { motion } from 'framer-motion';

interface ScheduleHeaderProps {
  title: string;
  subtitle: string;
}

const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({ title, subtitle }) => {
  return (
    <motion.div 
      className="mb-6 md:mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.h1 
        className="text-xl md:text-2xl font-bold text-gray-800 mb-1 md:mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        {title}
      </motion.h1>
      <motion.p 
        className="text-sm md:text-base text-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        {subtitle}
      </motion.p>
    </motion.div>
  );
};

export default ScheduleHeader;