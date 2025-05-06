import React from 'react';
import { motion } from 'framer-motion';

interface ScheduleHeaderProps {
  title: string;
  subtitle: string;
}

const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({ title, subtitle }) => {
  return (
    <motion.div 
      className="mb-4 md:mb-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.h1 
        className="text-2xl md:text-3xl font-bold text-[#2A6877] mb-1 md:mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        {title}
      </motion.h1>
      {subtitle && (
        <motion.p 
          className="text-sm md:text-base text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
};

export default ScheduleHeader;