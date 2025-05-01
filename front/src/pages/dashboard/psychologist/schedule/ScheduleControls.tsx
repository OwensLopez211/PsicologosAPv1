import React from 'react';
import { motion } from 'framer-motion';
import { format, startOfWeek, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

interface ScheduleControlsProps {
  currentDate: Date;
  currentView: 'day' | 'week';
  isMobile: boolean;
  goToToday: () => void;
  goToPrevious: () => void;
  goToNext: () => void;
  setCurrentView: (view: 'day' | 'week') => void;
}

const ScheduleControls: React.FC<ScheduleControlsProps> = ({
  currentDate,
  currentView,
  isMobile,
  goToToday,
  goToPrevious,
  goToNext,
  setCurrentView
}) => {
  return (
    <motion.div 
      className="flex flex-wrap items-center justify-between mb-6 bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      {/* Navigation Controls */}
      <div className="flex items-center space-x-2 md:space-x-4 mb-3 md:mb-0 w-full md:w-auto">
        <motion.button 
          onClick={goToPrevious}
          className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Anterior"
        >
          <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
        </motion.button>
        
        <h2 className="text-base md:text-xl font-semibold text-gray-800 flex-1 text-center md:text-left truncate">
          {currentView === 'day' 
            ? format(currentDate, "EEEE d 'de' MMMM", { locale: es })
            : `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), "d MMM", { locale: es })} - ${format(addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), 6), "d MMM", { locale: es })}`
          }
        </h2>
        
        <motion.button 
          onClick={goToNext}
          className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Siguiente"
        >
          <ChevronRightIcon className="h-5 w-5 text-gray-600" />
        </motion.button>
      </div>
      
      {/* View Controls */}
      <div className="flex space-x-2 w-full md:w-auto justify-between md:justify-end">
        <motion.button 
          onClick={goToToday}
          className="px-3 md:px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Hoy
        </motion.button>
        
        <div className="bg-gray-100 rounded-md p-1">
          <motion.button 
            onClick={() => setCurrentView('day')}
            className={`px-3 py-1 rounded-md text-sm font-medium flex items-center transition-colors ${
              currentView === 'day' 
                ? 'bg-white shadow-sm text-[#2A6877]' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            whileHover={currentView !== 'day' ? { scale: 1.02 } : {}}
            whileTap={currentView !== 'day' ? { scale: 0.98 } : {}}
          >
            <CalendarIcon className="h-4 w-4 mr-1 md:mr-2" />
            <span className="hidden md:inline">Día</span>
          </motion.button>
          <motion.button 
            onClick={() => setCurrentView('week')}
            className={`px-3 py-1 rounded-md text-sm font-medium flex items-center transition-colors ${
              currentView === 'week' 
                ? 'bg-white shadow-sm text-[#2A6877]' 
                : 'text-gray-700 hover:bg-gray-50'
            } ${isMobile ? 'opacity-50 cursor-not-allowed' : ''}`}
            whileHover={currentView !== 'week' && !isMobile ? { scale: 1.02 } : {}}
            whileTap={currentView !== 'week' && !isMobile ? { scale: 0.98 } : {}}
            disabled={isMobile}
          >
            <CalendarDaysIcon className="h-4 w-4 mr-1 md:mr-2" />
            <span className="hidden md:inline">Semana</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ScheduleControls;