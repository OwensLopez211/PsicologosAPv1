import api from './api';
// Remove unused imports

export const getProfile = async (userType: string) => {
  if (!userType) {
    console.error('User type is undefined or null');
    throw new Error('User type is required');
  }
  
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No authentication token found');
    throw new Error('Authentication required');
  }
  
  let endpoint = '';
  
  switch(userType.toLowerCase()) {
    case 'psychologist':
      endpoint = '/profiles/psychologist-profiles/me/';
      break;
    case 'client':
      endpoint = '/profiles/client-profiles/me/';
      break;
    case 'admin':
      endpoint = '/profiles/admin-profiles/me/';
      break;
    default:
      console.error(`Invalid user type: ${userType}`);
      throw new Error('Invalid user type');
  }

  console.log(`Fetching profile from: ${endpoint}`);
  
  try {
    const response = await api.get(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Si es un perfil de psicólogo, asegurarse de que las experiencias estén en formato de array
    if (userType.toLowerCase() === 'psychologist' && response.data) {
      if (!response.data.experiences) {
        response.data.experiences = [];
      }
    }
    
    console.log('Profile data received:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching profile for ${userType}:`, error);
    console.error('Response details:', (error as any).response?.data);
    throw error;
  }
};

// Fix the updateProfile function to remove the duplicate /api/ prefix
export const updateProfile = async (userType: string, profileData: any) => {
  if (!userType) {
    console.error('User type is undefined or null');
    throw new Error('User type is required');
  }

  let endpoint = '';
  
  switch(userType.toLowerCase()) {
    case 'psychologist':
      endpoint = '/profiles/psychologist-profiles/me/';
      break;
    case 'client':
      endpoint = '/profiles/client-profiles/me/';
      break;
    case 'admin':
      endpoint = '/profiles/admin-profiles/me/';
      break;
    default:
      console.error(`Invalid user type: ${userType}`);
      throw new Error('Invalid user type');
  }

  console.log(`Updating profile at: ${endpoint}`);
  console.log('Profile data to update:', profileData);
  
  try {
    // For psychologist profiles, we need to handle the nested user structure differently
    if (userType.toLowerCase() === 'psychologist') {
      // Extract first_name and last_name to send them directly
      const { first_name, last_name, email, gender, ...otherData } = profileData;
      
      // Create a new object with the correct structure
      // Make sure gender is included at the top level
      const formattedData = {
        ...otherData,
        first_name, // Include these at the top level for the backend
        last_name,
        gender: gender || '', // Asegurarse de que el género se incluya, incluso si es vacío
      };
      
      console.log('Formatted data for psychologist update:', formattedData);
      console.log('Gender value being sent:', formattedData.gender);
      const response = await api.patch(endpoint, formattedData);
      return response.data;
    } else {
      // For other user types, proceed as normal
      const response = await api.patch(endpoint, profileData);
      return response.data;
    }
  } catch (error) {
    console.error(`Error updating profile for ${userType}:`, error);
    console.error('Response details:', (error as any).response?.data);
    throw error;
  }
};

// Add a new function specifically for uploading profile images
export const uploadProfileImage = async (userType: string, imageFile: File) => {
  if (!userType) {
    throw new Error('User type is required');
  }
  
  if (!imageFile) {
    throw new Error('Image file is required');
  }
  
  let endpoint = '';
  switch(userType.toLowerCase()) {
    case 'psychologist':
      endpoint = '/profiles/psychologist-profiles/me/upload_image/';  // Changed from upload-image to upload_image
      break;
    case 'client':
      endpoint = '/profiles/client-profiles/me/upload_image/';  // Changed from upload-image to upload_image
      break;
    case 'admin':
      endpoint = '/profiles/admin-profiles/me/upload_image/';
      break;
    default:
      throw new Error(`Unsupported user type: ${userType}`);
  }
  
  const formData = new FormData();
  formData.append('profile_image', imageFile);
  
  console.log('Datos a guardar:', formData);
  
  try {
    const response = await api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
}

// Add a new function for deleting profile images
export const deleteProfileImage = async (userType: string) => {
  if (!userType) {
    throw new Error('User type is required');
  }
  
  let endpoint = '';
  switch(userType.toLowerCase()) {
    case 'psychologist':
      endpoint = '/profiles/psychologist-profiles/me/delete_image/';
      break;
    case 'client':
      endpoint = '/profiles/client-profiles/me/delete_image/';
      break;
    case 'admin':
      endpoint = '/profiles/admin-profiles/me/delete_image/';
      break;
    default:
      throw new Error(`Unsupported user type: ${userType}`);
  }
  
  try {
    const response = await api.delete(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error deleting profile image:', error);
    throw error;
  }
}

// Add this new function for updating bank information
export const updateBankInfo = async (bankData: any) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }
  
  // Get the user type from local storage
  const userDataStr = localStorage.getItem('user');
  if (!userDataStr) {
    throw new Error('User data not found');
  }
  
  const userData = JSON.parse(userDataStr);
  const userType = userData.user_type;
  
  if (!userType) {
    throw new Error('User type is required');
  }
  
  let endpoint = '';
  switch(userType.toLowerCase()) {
    case 'psychologist':
      endpoint = '/profiles/psychologist-profiles/me/update_bank_info/';
      break;
    case 'client':
      endpoint = '/profiles/client-profiles/me/update_bank_info/';
      break;
    case 'admin':
      endpoint = '/profiles/admin-profiles/me/update_bank_info/';
      break;
    default:
      throw new Error(`Unsupported user type: ${userType}`);
  }
  
  try {
    console.log('Updating bank info with data:', bankData);
    const response = await api.patch(endpoint, bankData);
    console.log('Bank info updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating bank info:', error);
    throw error;
  }
};

// Función para actualizar experiencias profesionales
export const updateProfessionalExperiences = async (experiences: any[]) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }
  
  try {
    // Asegúrate de eliminar cualquier propiedad 'psychologist' o 'psychologist_id' en los objetos de experiencia
    // y filtrar cualquier dato no válido antes de enviar al backend
    const cleanedExperiences = experiences.map(exp => {
      // Destructurar para eliminar propiedades innecesarias
      const { 
        psychologist, 
        psychologist_id,
        experience_type_display,  // Eliminar campos de display
        ...cleanExp 
      } = exp;
      
      // Asegurarse de que las fechas estén en el formato correcto
      if (cleanExp.start_date && typeof cleanExp.start_date === 'string') {
        // Si ya es una string ISO, no hacer nada
        // Si es un objeto Date, convertirlo a ISO
        if (cleanExp.start_date instanceof Date) {
          cleanExp.start_date = cleanExp.start_date.toISOString().split('T')[0];
        }
      }
      
      // Igual para end_date
      if (cleanExp.end_date && typeof cleanExp.end_date === 'string') {
        if (cleanExp.end_date instanceof Date) {
          cleanExp.end_date = cleanExp.end_date.toISOString().split('T')[0];
        }
      }
      
      // Solo incluir los campos necesarios para el backend
      return {
        id: cleanExp.id > 0 ? cleanExp.id : undefined, // Solo incluir IDs positivos (existentes en BD)
        experience_type: cleanExp.experience_type,
        institution: cleanExp.institution,
        role: cleanExp.role,
        start_date: cleanExp.start_date,
        end_date: cleanExp.end_date || null,
        description: cleanExp.description || ''
      };
    });
    
    console.log('Enviando experiencias profesionales al backend:', cleanedExperiences);
    const response = await api.post('/profiles/psychologist-profiles/me/experiences/', { 
      experiences: cleanedExperiences 
    });
    console.log('Experiencias actualizadas correctamente en el backend:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar experiencias en el backend:', error);
    throw error;
  }
};

// Función para obtener experiencias profesionales
export const getProfessionalExperiences = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }
  
  try {
    const response = await api.get('/profiles/psychologist-profiles/me/experiences/');
    console.log('Experiencias obtenidas:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener experiencias:', error);
    throw error;
  }
};

// Función para eliminar una experiencia específica
export const deleteProfessionalExperience = async (experienceId: number) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }
  
  try {
    const response = await api.delete(`/profiles/psychologist-profiles/me/experiences/${experienceId}/`);
    console.log('Experiencia eliminada:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar experiencia:', error);
    throw error;
  }
};