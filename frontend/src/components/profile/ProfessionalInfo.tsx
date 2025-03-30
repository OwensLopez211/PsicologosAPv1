import { useState, useEffect } from 'react';
import { PsychologistProfile } from '../../types/psychologist';

interface ProfessionalInfoProps {
  profile?: PsychologistProfile;
  onSave: (data: Partial<PsychologistProfile>) => void;
  isLoading: boolean;
}

const ProfessionalInfo = ({ profile, onSave, isLoading }: ProfessionalInfoProps) => {
  const [isEditing, setIsEditing] = useState(false);
  
  // Remove initial state from useState and use useEffect to set it
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

  // Single useEffect to handle profile data
  useEffect(() => {
    if (profile) {
      console.log('Setting profile data:', profile);
      setFormData({
        professional_title: profile.professional_title || '',
        specialties: Array.isArray(profile.specialties) ? profile.specialties : [],
        health_register_number: profile.health_register_number || '',
        university: profile.university || '',
        graduation_year: profile.graduation_year || '',
        experience_description: profile.experience_description || '',
        target_populations: Array.isArray(profile.target_populations) ? profile.target_populations : [],
        intervention_areas: Array.isArray(profile.intervention_areas) ? profile.intervention_areas : []
      });
    }
  }, [profile]);

  // Remove other useEffects and keep only handleSubmit and handleMultiSelect
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting data:', formData);
    await onSave(formData);
    setIsEditing(false);
  };

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

  useEffect(() => {
    if (profile) {
      console.log('Received profile:', profile);
      setFormData({
        professional_title: profile.professional_title || '',
        specialties: profile.specialties || [],
        health_register_number: profile.health_register_number || '',
        university: profile.university || '',
        graduation_year: profile.graduation_year?.toString() || '',
        experience_description: profile.experience_description || '',
        target_populations: profile.target_populations || [],
        intervention_areas: profile.intervention_areas || []
      });
    }
  }, [profile]);

  // Add this console log to debug formData changes
  useEffect(() => {
    console.log('Current formData:', formData);
  }, [formData]);

  const handleMultiSelect = (field: keyof typeof formData, value: string) => {
    const currentArray = formData[field] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    setFormData({ ...formData, [field]: newArray });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧠</span>
          <h2 className="text-xl font-semibold text-gray-900">Información Profesional</h2>
        </div>
        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-4 py-2 border border-[#2A6877] text-sm font-medium rounded-md text-[#2A6877] hover:bg-gray-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Editar
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="professional_title" className="block text-sm font-medium text-gray-700">
            Título Profesional
          </label>
          <input
            type="text"
            id="professional_title"
            value={formData.professional_title}
            onChange={(e) => setFormData({ ...formData, professional_title: e.target.value })}
            disabled={!isEditing}
            placeholder="Ej: Psicólogo Clínico"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2A6877] focus:ring-[#2A6877] 
              ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          />
        </div>

        <div>
          <label htmlFor="health_register_number" className="block text-sm font-medium text-gray-700">
            Número de Registro Nacional de Prestadores
          </label>
          <input
            type="text"
            id="health_register_number"
            value={formData.health_register_number}
            onChange={(e) => setFormData({ ...formData, health_register_number: e.target.value })}
            disabled={!isEditing}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2A6877] focus:ring-[#2A6877] 
              ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          />
        </div>

        <div>
          <label htmlFor="university" className="block text-sm font-medium text-gray-700">
            Universidad de Egreso
          </label>
          <input
            type="text"
            id="university"
            value={formData.university}
            onChange={(e) => setFormData({ ...formData, university: e.target.value })}
            disabled={!isEditing}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2A6877] focus:ring-[#2A6877] 
              ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          />
        </div>

        <div>
          <label htmlFor="graduation_year" className="block text-sm font-medium text-gray-700">
            Año de Egreso
          </label>
          <input
            type="number"
            id="graduation_year"
            value={formData.graduation_year}
            onChange={(e) => setFormData({ ...formData, graduation_year: e.target.value })}
            disabled={!isEditing}
            min="1950"
            max={new Date().getFullYear()}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2A6877] focus:ring-[#2A6877] 
              ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="experience_description" className="block text-sm font-medium text-gray-700">
            Experiencia Profesional
          </label>
          <textarea
            id="experience_description"
            value={formData.experience_description}
            onChange={(e) => setFormData({ ...formData, experience_description: e.target.value })}
            disabled={!isEditing}
            rows={4}
            placeholder="Describe tu experiencia profesional..."
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2A6877] focus:ring-[#2A6877] 
              ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Especialidades o Enfoques
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {specialtyOptions.map((specialty) => (
              <label
                key={specialty}
                className={`flex items-center p-3 rounded-lg border ${
                  formData.specialties.includes(specialty)
                    ? 'bg-[#2A6877] text-white border-[#2A6877]'
                    : 'border-gray-200 hover:border-[#2A6877]'
                } ${!isEditing ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  disabled={!isEditing}
                  checked={formData.specialties.includes(specialty)}
                  onChange={() => handleMultiSelect('specialties', specialty)}
                />
                <span className="text-sm">{specialty}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Poblaciones que Atiende
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {populationOptions.map((population) => (
              <label
                key={population}
                className={`flex items-center p-3 rounded-lg border ${
                  formData.target_populations.includes(population)
                    ? 'bg-[#2A6877] text-white border-[#2A6877]'
                    : 'border-gray-200 hover:border-[#2A6877]'
                } ${!isEditing ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  disabled={!isEditing}
                  checked={formData.target_populations.includes(population)}
                  onChange={() => handleMultiSelect('target_populations', population)}
                />
                <span className="text-sm">{population}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Áreas de Intervención
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {interventionOptions.map((area) => (
              <label
                key={area}
                className={`flex items-center p-3 rounded-lg border ${
                  formData.intervention_areas.includes(area)
                    ? 'bg-[#2A6877] text-white border-[#2A6877]'
                    : 'border-gray-200 hover:border-[#2A6877]'
                } ${!isEditing ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  disabled={!isEditing}
                  checked={formData.intervention_areas.includes(area)}
                  onChange={() => handleMultiSelect('intervention_areas', area)}
                />
                <span className="text-sm">{area}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-6">
        {isEditing && (
          <button
            type="button"
            onClick={() => {
              setIsEditing(false);
              if (profile) {
                setFormData({
                  professional_title: profile.professional_title || '',
                  specialties: profile.specialties || [],
                  health_register_number: profile.health_register_number || '',
                  university: profile.university || '',
                  graduation_year: profile.graduation_year || '',
                  experience_description: profile.experience_description || '',
                  target_populations: profile.target_populations || [],
                  intervention_areas: profile.intervention_areas || []
                });
              }
            }}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A6877]"
          >
            Cancelar
          </button>
        )}
        {isEditing && (
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#2A6877] hover:bg-[#235A67] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A6877] disabled:opacity-50"
          >
            {isLoading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        )}
      </div>
    </form>
  );
};

export default ProfessionalInfo;