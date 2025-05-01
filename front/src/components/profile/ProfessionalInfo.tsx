import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PsychologistProfile } from '../../types/psychologist';
import ProfessionalFormFields from './professional/ProfessionalFormFields';
import ExperienceField from './professional/ExperienceField';
import MultiSelectSection from './professional/MultiSelectSection';
import { CheckIcon } from '@heroicons/react/24/outline';
import optionsData from '../../types/options-data';
import { updateProfessionalExperiences } from '../../services/profileService';

interface ProfessionalInfoProps {
  profile?: PsychologistProfile;
  onSave: (data: Partial<PsychologistProfile>) => void;
  isLoading: boolean;
}

interface Experience {
  id?: number;
  experience_type: string;
  institution: string;
  role: string;
  start_date: string;
  end_date?: string | null;
  description: string;
}

const ProfessionalInfo = ({ profile, onSave, isLoading }: ProfessionalInfoProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Estado para almacenar el perfil actual después de guardar
  const [savedProfile, setSavedProfile] = useState<PsychologistProfile | undefined>(profile);
  
  // Inicializar datos del formulario con valores vacíos
  const [formData, setFormData] = useState<Partial<PsychologistProfile>>({
    professional_title: '',
    specialties: [],
    health_register_number: '',
    university: '',
    graduation_year: '',
    experience_description: '',
    target_populations: [],
    intervention_areas: []
  });

  // Función para determinar el título profesional según el género
  const getProfessionalTitleByGender = (gender: string): string => {
    if (gender === 'FEMALE') {
      return 'Psicóloga Clínica';
    } else if (gender === 'MALE') {
      return 'Psicólogo Clínico';
    } else {
      // Opción por defecto o no binaria
      return 'Profesional en Psicología Clínica';
    }
  };

  // Efecto para cargar datos del perfil y experiencias
  useEffect(() => {
    if (profile) {
      // Establecer título profesional basado en género
      const professionalTitle = getProfessionalTitleByGender(profile.gender || '');
      
      // Asegurar que graduation_year se maneje correctamente
      let graduationYearValue = '';
      if (profile.graduation_year !== null && profile.graduation_year !== undefined) {
        graduationYearValue = profile.graduation_year.toString();
      }
      
      setFormData({
        professional_title: professionalTitle,
        specialties: Array.isArray(profile.specialties) ? profile.specialties : [],
        health_register_number: profile.health_register_number || '',
        university: profile.university || '',
        graduation_year: graduationYearValue,
        experience_description: profile.experience_description || '',
        target_populations: Array.isArray(profile.target_populations) ? profile.target_populations : [],
        intervention_areas: Array.isArray(profile.intervention_areas) ? profile.intervention_areas : []
      });
      
      // Cargar experiencias si existen
      if (profile.experiences && Array.isArray(profile.experiences)) {
        setExperiences(profile.experiences);
      }
      
      // Actualizar el perfil guardado
      setSavedProfile(profile);
    }
  }, [profile]);

  // Escuchar cambios de género en el perfil
  useEffect(() => {
    if (profile && profile.gender) {
      const professionalTitle = getProfessionalTitleByGender(profile.gender);
      
      // Actualizar solo si el título necesita cambiar
      if (formData.professional_title !== professionalTitle) {
        setFormData(prevData => ({
          ...prevData,
          professional_title: professionalTitle
        }));
      }
    }
  }, [profile?.gender, formData.professional_title]);

  // Resetear mensaje de éxito y error
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (saveSuccess || saveError) {
      timer = setTimeout(() => {
        setSaveSuccess(false);
        setSaveError(null);
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [saveSuccess, saveError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSaving(true);
    setSaveError(null);
    
    // Asegurar que professional_title se establezca correctamente antes de guardar
    const dataToSave = {
      ...formData,
      professional_title: getProfessionalTitleByGender(profile?.gender || '')
    };
    
    // Convertir graduation_year a número si es una cadena válida
    if (dataToSave.graduation_year && dataToSave.graduation_year.trim() !== '') {
      const yearValue = parseInt(dataToSave.graduation_year, 10);
      if (!isNaN(yearValue)) {
        dataToSave.graduation_year = yearValue.toString();
      } else {
        // Si no es un número válido, establecerlo a null
        dataToSave.graduation_year = undefined;
      }
    } else {
      // Si está vacío, establecerlo a null
      dataToSave.graduation_year = undefined;
    }
    
    try {
      // Solo guardamos las experiencias si hay cambios locales pendientes
      let updatedExperiences = experiences;
      
      // Guardar experiencias profesionales (si hay experiencias)
      if (experiences && experiences.length > 0) {
        const experiencesToSave = experiences.map(exp => {
          const { id, ...rest } = exp;
          return id && id > 0 ? exp : rest;
        });
        
        const experiencesResponse = await updateProfessionalExperiences(experiencesToSave);
        updatedExperiences = experiencesResponse.experiences || [];
      } else {
        // Si no hay experiencias, enviar array vacío para borrar existentes
        await updateProfessionalExperiences([]);
        updatedExperiences = [];
      }
      
      // Guardar información del perfil
      await onSave(dataToSave);
      
      // Actualizar estado local
      setIsEditing(false);
      setSaveSuccess(true);
      setExperiences(updatedExperiences);
      
      // Actualizar el perfil guardado
      const updatedProfile = {
        ...(savedProfile || {}),
        ...dataToSave,
        experiences: updatedExperiences
      };
      
      setSavedProfile(updatedProfile as PsychologistProfile);
      
      console.log('Perfil actualizado con éxito, incluyendo experiencias:', updatedExperiences);
    } catch (error) {
      console.error('Error al guardar:', error);
      setSaveError('Ocurrió un error al guardar los cambios. Por favor intenta nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormChange = (field: string, value: any) => {
    // Evitar cambiar professional_title directamente
    if (field === 'professional_title') {
      return;
    }
    
    setFormData({ ...formData, [field]: value });
  };

  const handleMultiSelect = (field: keyof typeof formData, value: string) => {
    const currentArray = formData[field] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    setFormData({ ...formData, [field]: newArray });
  };

  // Manejar cambios en las experiencias
  const handleExperiencesChange = (updatedExperiences: Experience[]) => {
    // Actualizar estado local inmediatamente para reflejar los cambios en la UI
    setExperiences(updatedExperiences);
  };

  // Variantes de animación
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        staggerChildren: 0.1 
      } 
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 } 
    }
  };

  // Estado de carga
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white/50 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-t-[#2A6877] border-r-[#2A6877]/30 border-b-[#2A6877]/10 border-l-[#2A6877]/60 animate-spin"></div>
          <div className="absolute inset-3 flex items-center justify-center">
            <span className="text-xl">🧠</span>
          </div>
        </div>
        <p className="mt-4 text-gray-600 font-medium animate-pulse">Cargando información profesional...</p>
      </div>
    );
  }

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Encabezado */}
      <motion.div 
        className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-100"
        variants={itemVariants}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#2A6877] to-[#B4E4D3] text-white">
              <motion.span 
                className="text-2xl"
                initial={{ rotate: -10, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
              >
                🧠
              </motion.span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Información Profesional</h2>
              <p className="text-sm text-gray-500 mt-0.5">Define tu perfil profesional para tus pacientes</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <AnimatePresence>
              {saveSuccess && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-sm"
                >
                  <CheckIcon className="h-4 w-4" />
                  <span>Guardado</span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {saveError && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>Error al guardar</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            <AnimatePresence>
              {!isEditing ? (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 border border-[#2A6877] text-sm font-medium rounded-full text-[#2A6877] hover:bg-[#2A6877] hover:text-white transition-all shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Editar
                </motion.button>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Datos profesionales */}
      <motion.div variants={itemVariants} className="z-20 relative">
        <ProfessionalFormFields 
          formData={formData}
          isEditing={isEditing}
          onChange={handleFormChange}
          disabledFields={['professional_title']} // Mantener professional_title deshabilitado
        />
      </motion.div>
      
      {/* Mensaje informativo sobre título profesional */}
      <AnimatePresence>
        {isEditing && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-amber-50/90 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-amber-100 z-10 relative mt-4"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-amber-500 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-amber-800 text-sm">Título profesional</h4>
                <p className="text-amber-700 text-sm mt-1">El título profesional se actualiza automáticamente según tu género seleccionado en la información personal.</p>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-2 border border-amber-100">
                    <p className="font-medium text-amber-700">Género femenino:</p>
                    <p className="text-gray-700">Psicóloga Clínica</p>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-2 border border-amber-100">
                    <p className="font-medium text-amber-700">Género masculino:</p>
                    <p className="text-gray-700">Psicólogo Clínico</p>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-2 border border-amber-100">
                    <p className="font-medium text-amber-700">Sin género seleccionado:</p>
                    <p className="text-gray-700">Profesional en Psicología Clínica</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Campo de experiencia */}
      <motion.div variants={itemVariants}>
        <ExperienceField 
          experiences={experiences}
          isEditing={isEditing}
          onExperiencesChange={handleExperiencesChange}
        />
      </motion.div>

      {/* Secciones multi-select */}
      <motion.div variants={itemVariants}>
        <MultiSelectSection 
          title="Especialidades o Enfoques"
          options={optionsData.specialtyOptions}
          selectedValues={formData.specialties as string[]}
          isEditing={isEditing}
          onChange={(value) => handleMultiSelect('specialties', value)}
          icon="🔍"
          maxVisibleOptions={8}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <MultiSelectSection 
          title="Poblaciones que Atiende"
          options={optionsData.populationOptions}
          selectedValues={formData.target_populations as string[]}
          isEditing={isEditing}
          onChange={(value) => handleMultiSelect('target_populations', value)}
          icon="👥"
          maxVisibleOptions={8}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <MultiSelectSection 
          title="Áreas de Intervención"
          options={optionsData.interventionOptions}
          selectedValues={formData.intervention_areas as string[]}
          isEditing={isEditing}
          onChange={(value) => handleMultiSelect('intervention_areas', value)}
          icon="🎯"
          maxVisibleOptions={8}
        />
      </motion.div>

      {/* Botones de acción */}
      <AnimatePresence>
        {isEditing && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="flex justify-end space-x-4 pt-6"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => {
                setIsEditing(false);
                if (profile) {
                  // Restablecer datos del formulario pero asegurar que professional_title se base en el género
                  const professionalTitle = getProfessionalTitleByGender(profile.gender || '');
                  
                  // Restablecer todos los datos incluyendo experiencias
                  setFormData({
                    professional_title: professionalTitle,
                    specialties: profile.specialties || [],
                    health_register_number: profile.health_register_number || '',
                    university: profile.university || '',
                    graduation_year: profile.graduation_year?.toString() || '',
                    experience_description: profile.experience_description || '',
                    target_populations: profile.target_populations || [],
                    intervention_areas: profile.intervention_areas || []
                  });
                  
                  // Restaurar experiencias originales
                  setExperiences(profile.experiences || []);
                }
              }}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A6877] transition-all"
            >
              Cancelar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSaving}
              className="inline-flex justify-center py-2 px-5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-[#2A6877] to-[#235A67] hover:from-[#235A67] hover:to-[#1A4652] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A6877] disabled:opacity-50 transition-all"
            >
              {isSaving ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </span>
              ) : (
                <span className="flex items-center">
                  Guardar cambios
                  <CheckIcon className="ml-2 h-4 w-4" />
                </span>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.form>
  );
};

export default ProfessionalInfo;