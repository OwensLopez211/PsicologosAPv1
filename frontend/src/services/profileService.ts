import api from './api';
import { PsychologistProfile, BasicProfileData } from '../types/psychologist';

export const getPsychologistProfile = async () => {
  const token = localStorage.getItem('token');
  const response = await api.get('/api/psicologo/profile/', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

export const updatePsychologistProfile = async (data: Partial<PsychologistProfile>) => {
  console.log('Original data:', data);
  
  // Transform the data to match Django model fields
  const transformedData = {
    // Existing basic info fields
    first_name: data.firstName || data.first_name,
    last_name: data.lastName || data.last_name,
    email: data.email,
    phone: data.phone,
    rut: data.rut,
    gender: data.gender,
    profile_image: data.profileImage || data.profile_image,
    region: data.region,
    city: data.city,
    
    // Professional info fields
    professional_title: data.professional_title,
    specialties: data.specialties,
    health_register_number: data.health_register_number,
    university: data.university,
    graduation_year: data.graduation_year,
    experience_description: data.experience_description,
    target_populations: data.target_populations,
    intervention_areas: data.intervention_areas
  };
  
  console.log('Transformed data:', transformedData);

  const token = localStorage.getItem('token');
  try {
    const response = await api.patch('/api/psicologo/profile/', transformedData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error details:', error.response?.data);
    throw error;
  }
};