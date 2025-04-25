// ExperienceTypes.ts - Type definitions
export interface Experience {
    id?: number;
    experience_type: string;
    institution: string;
    role: string;
    start_date: string;
    end_date?: string | null;
    description: string;
  }
  
  export const experienceTypes = [
    { value: 'PRACTICUM', label: 'Pasantía' },
    { value: 'ASSISTANTSHIP', label: 'Ayudantía' },
    { value: 'WORK', label: 'Trabajo' },
    { value: 'VOLUNTEERING', label: 'Voluntariado' },
    { value: 'OTHER', label: 'Otro' }
  ];
  
  // Utility functions for formatting
  export const formatDate = (dateString?: string | null) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long'
    });
  };
  
  export const getExperienceTypeLabel = (type: string) => {
    const found = experienceTypes.find(et => et.value === type);
    return found ? found.label : type;
  };