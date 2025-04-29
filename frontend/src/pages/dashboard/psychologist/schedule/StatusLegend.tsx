import React from 'react';
import { motion } from 'framer-motion';

const StatusLegend: React.FC = () => {
  const statuses = [
    { label: 'Pendiente de pago', color: 'bg-yellow-100 text-yellow-800' },
    { label: 'Esperando Verificación de pago', color: 'bg-orange-100 text-orange-800' },
    { label: 'Pago verificado', color: 'bg-green-100 text-green-800' },
    { label: 'Confirmada', color: 'bg-green-100 text-green-800' },
    { label: 'Completada', color: 'bg-blue-100 text-blue-800' },
    { label: 'Cancelada', color: 'bg-red-100 text-red-800' }
  ];

  return (
    <motion.div 
      className="mb-4 md:mb-6 p-3 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-100 shadow-sm"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <div className="flex flex-wrap items-center gap-2 md:gap-4">
        <div className="text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-0">
          Estado de citas:
        </div>
        <div className="flex flex-wrap gap-2 md:gap-3">
          {statuses.map((status, index) => (
            <motion.span 
              key={status.label}
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status.color} border border-current/20`}
              initial={{ opacity: 0, scale: 0.9, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05, duration: 0.2 }}
              whileHover={{ scale: 1.05 }}
            >
              {status.label}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default StatusLegend;