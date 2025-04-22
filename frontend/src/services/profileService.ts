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
        gender, // Extraer explícitamente el género y asegurarse de que se incluya
      };
      
      console.log('Formatted data for psychologist update:', formattedData);
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