import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PsychologistProfile } from '../../types/psychologist';
import ProfessionalFormFields from './professional/ProfessionalFormFields';
import ExperienceField from './professional/ExperienceField';
import MultiSelectSection from './professional/MultiSelectSection';

interface ProfessionalInfoProps {
  profile?: PsychologistProfile;
  onSave: (data: Partial<PsychologistProfile>) => void;
  isLoading: boolean;
}

const ProfessionalInfo = ({ profile, onSave, isLoading }: ProfessionalInfoProps) => {
  const [isEditing, setIsEditing] = useState(false);
  
  // Initialize form data with empty values
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

  // Function to determine professional title based on gender
  const getProfessionalTitleByGender = (gender: string): string => {
    if (gender === 'FEMALE') {
      return 'Psicóloga Clínica';
    } else if (gender === 'MALE') {
      return 'Psicólogo Clínico';
    } else {
      // Default or non-binary option
      return 'Profesional en Psicología Clínica';
    }
  };

  // Single useEffect to handle profile data
  useEffect(() => {
    if (profile) {
      console.log('Setting profile data:', profile);
      
      // Set professional title based on gender
      const professionalTitle = getProfessionalTitleByGender(profile.gender || '');
      
      // Ensure graduation_year is properly handled
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
    }
  }, [profile]);

  // Listen for gender changes in the profile
  useEffect(() => {
    if (profile && profile.gender) {
      const professionalTitle = getProfessionalTitleByGender(profile.gender);
      
      // Only update if the title needs to change
      if (formData.professional_title !== professionalTitle) {
        setFormData(prevData => ({
          ...prevData,
          professional_title: professionalTitle
        }));
      }
    }
  }, [profile?.gender, formData.professional_title]);

  // Debug formData changes
  useEffect(() => {
    console.log('Current formData:', formData);
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting data:', formData);
    
    // Ensure professional_title is set correctly before saving
    const dataToSave = {
      ...formData,
      professional_title: getProfessionalTitleByGender(profile?.gender || '')
    };
    
    // Convert graduation_year to number if it's a valid string
    if (dataToSave.graduation_year && dataToSave.graduation_year.trim() !== '') {
      const yearValue = parseInt(dataToSave.graduation_year, 10);
      if (!isNaN(yearValue)) {
        dataToSave.graduation_year = yearValue.toString();
      } else {
        // If it's not a valid number, set it to null
        dataToSave.graduation_year = undefined;
      }
    } else {
      // If it's empty, set it to null
      dataToSave.graduation_year = undefined;
    }
    
    await onSave(dataToSave);
    setIsEditing(false);
  };

  const handleFormChange = (field: string, value: any) => {
    // Prevent changing professional_title directly
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

  // Options for multi-select fields
  const specialtyOptions = [
    'Terapia Cognitivo-Conductual',
    'Terapia Sistémica',
    'Terapia Breve Estratégica',
    'Psicoanálisis',
    'Terapia Humanista',
    'Terapia Gestalt',
    'Terapia Familiar',
    'Terapia de Pareja'
  ];

  const populationOptions = [
    'Niños',
    'Adolescentes',
    'Adultos',
    'Adultos Mayores',
    'Parejas',
    'Familias'
  ];

  const interventionOptions = [
    'Ansiedad',
    'Depresión',
    'Trastornos del ánimo',
    'Autoestima',
    'Duelo',
    'Estrés',
    'Trauma',
    'Relaciones interpersonales',
    'Desarrollo personal'
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#2A6877]"></div>
        <p className="mt-4 text-gray-600">Cargando información profesional...</p>
      </div>
    );
  }

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="space-y-6 bg-white p-6 rounded-xl shadow-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <motion.span 
            className="text-2xl"
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 0.5 }}
          >
            🧠
          </motion.span>
          <h2 className="text-xl font-semibold text-gray-900">Información Profesional</h2>
        </div>
        <AnimatePresence>
          {!isEditing && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-4 py-2 border border-[#2A6877] text-sm font-medium rounded-md text-[#2A6877] hover:bg-gray-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Editar
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <ProfessionalFormFields 
        formData={formData}
        isEditing={isEditing}
        onChange={handleFormChange}
        disabledFields={['professional_title']} // Keep professional_title field disabled
      />
      
      {isEditing && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-100 mt-2"
        >
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium text-gray-700">Título profesional</p>
              <p>El título profesional se actualiza automáticamente según tu género seleccionado en la información personal.</p>
              <ul className="list-disc pl-5 mt-1 text-gray-500">
                <li>Género femenino: <span className="font-medium">Psicóloga Clínica</span></li>
                <li>Género masculino: <span className="font-medium">Psicólogo Clínico</span></li>
                <li>Sin género seleccionado: <span className="font-medium">Profesional en Psicología Clínica</span></li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      <ExperienceField 
        value={formData.experience_description || ''}
        isEditing={isEditing}
        onChange={(value) => handleFormChange('experience_description', value)}
      />

      <MultiSelectSection 
        title="Especialidades o Enfoques"
        options={specialtyOptions}
        selectedValues={formData.specialties as string[]}
        isEditing={isEditing}
        onChange={(value) => handleMultiSelect('specialties', value)}
        icon="🔍"
      />

      <MultiSelectSection 
        title="Poblaciones que Atiende"
        options={populationOptions}
        selectedValues={formData.target_populations as string[]}
        isEditing={isEditing}
        onChange={(value) => handleMultiSelect('target_populations', value)}
        icon="👥"
      />

      <MultiSelectSection 
        title="Áreas de Intervención"
        options={interventionOptions}
        selectedValues={formData.intervention_areas as string[]}
        isEditing={isEditing}
        onChange={(value) => handleMultiSelect('intervention_areas', value)}
        icon="🎯"
      />

      <AnimatePresence>
        {isEditing && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex justify-end space-x-4 pt-6"
          >
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                if (profile) {
                  // Reset form data but ensure professional_title is based on gender
                  const professionalTitle = getProfessionalTitleByGender(profile.gender || '');
                  
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
                }
              }}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A6877] transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#2A6877] hover:bg-[#235A67] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A6877] disabled:opacity-50 transition-all"
            >
              {isLoading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.form>
  );
};

export default ProfessionalInfo;