import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getCurrentUserSchedule } from '../../services/scheduleService';
import toast from 'react-hot-toast';

// Componentes
import ScheduleSection, { ScheduleData } from './scheduleandfees/ScheduleSection';
import PricingSection from './scheduleandfees/PricingSection';

// Default schedule template
const defaultSchedule: ScheduleData = {
  monday: { enabled: false, timeBlocks: [{ startTime: '09:00', endTime: '17:00' }] },
  tuesday: { enabled: false, timeBlocks: [{ startTime: '09:00', endTime: '17:00' }] },
  wednesday: { enabled: false, timeBlocks: [{ startTime: '09:00', endTime: '17:00' }] },
  thursday: { enabled: false, timeBlocks: [{ startTime: '09:00', endTime: '17:00' }] },
  friday: { enabled: false, timeBlocks: [{ startTime: '09:00', endTime: '17:00' }] },
  saturday: { enabled: false, timeBlocks: [{ startTime: '09:00', endTime: '13:00' }] },
  sunday: { enabled: false, timeBlocks: [{ startTime: '09:00', endTime: '13:00' }] },
};

interface ScheduleAndFeesProps {
  profile?: any;
  onSave?: (data: any) => void;
  isLoading: boolean;
  onLoadingChange?: (loading: boolean) => void;
}

const ScheduleAndFees = ({ profile, onSave, isLoading, onLoadingChange }: ScheduleAndFeesProps) => {
  const [localLoading, setLocalLoading] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleData>(defaultSchedule);

  // Variantes para animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2 
      } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.4 } 
    }
  };

  // Obtener el horario cuando el componente se monta
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLocalLoading(true);
        if (onLoadingChange) onLoadingChange(true);
        
        const scheduleData = await getCurrentUserSchedule();
        
        if (scheduleData && scheduleData.schedule_config) {
          // Procesar los datos del horario
          const fetchedSchedule = processScheduleData(scheduleData.schedule_config);
          setSchedule(fetchedSchedule);
        }
      } catch (error) {
        console.error("Error fetching schedule:", error);
        toast.error("No se pudo cargar tu horario. Por favor, intenta de nuevo más tarde.");
        // Mantener el horario predeterminado si hay un error
      } finally {
        setLocalLoading(false);
        if (onLoadingChange) onLoadingChange(false);
      }
    };
    
    fetchSchedule();
  }, [onLoadingChange]);

  // Procesar datos del horario desde la API
  const processScheduleData = (scheduleConfig: any) => {
    // Comenzar con el horario predeterminado para asegurar que todos los días estén incluidos
    const processedSchedule = { ...defaultSchedule };
    
    // Actualizar con los datos obtenidos
    for (const day in scheduleConfig) {
      if (processedSchedule[day]) {
        processedSchedule[day] = {
          enabled: true, // Si el día existe en la configuración, está habilitado
          timeBlocks: scheduleConfig[day].timeBlocks || [{ startTime: '09:00', endTime: '17:00' }]
        };
      }
    }
    
    return processedSchedule;
  };

  // Actualizar horario cuando cambia el perfil
  useEffect(() => {
    if (profile && profile.schedule_config) {
      try {
        const profileSchedule = processScheduleData(profile.schedule_config);
        setSchedule(profileSchedule);
      } catch (error) {
        console.error('Error parsing schedule data from profile:', error);
      }
    }
  }, [profile]);

  // Manejador para cambios en el horario
  const handleScheduleChange = (newSchedule: ScheduleData) => {
    setSchedule(newSchedule);
    
    // Llamar a onSave si existe
    if (onSave) {
      onSave({ schedule: newSchedule });
    }
  };

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Sección de Horarios */}
      <motion.div variants={itemVariants}>
        <ScheduleSection 
          schedule={schedule}
          onScheduleChange={handleScheduleChange}
          isLoading={isLoading || localLoading}
          onLoadingChange={onLoadingChange}
        />
      </motion.div>

      {/* Sección de Precios */}
      <motion.div variants={itemVariants}>
        <PricingSection 
          isLoading={isLoading} 
          onLoadingChange={onLoadingChange} 
        />
      </motion.div>
    </motion.div>
  );
};

export default ScheduleAndFees;