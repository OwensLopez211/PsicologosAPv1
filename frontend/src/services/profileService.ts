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
      throw new Error(`Unsupported user type: ${userType}`);
  }

  try {
    console.log('Updating profile with data:', profileData);
    
    // If profile_image is a File object, handle it separately
    if (profileData.profile_image instanceof File) {
      // Handle file upload separately
      await uploadProfileImage(userType, profileData.profile_image);
      
      // Remove profile_image from the data to be sent
      const { profile_image, ...dataToUpdate } = profileData;
      
      // Update the rest of the profile data
      const response = await api.patch(endpoint, dataToUpdate);
      return response.data;
    } else {
      // Make sure we're not sending the profile_image URL in the regular update
      const dataToUpdate = { ...profileData };
      
      // If profile_image is a string (URL), remove it from the update data
      if (typeof dataToUpdate.profile_image === 'string') {
        delete dataToUpdate.profile_image;
      }
      
      // Send the data as JSON
      const response = await api.patch(endpoint, dataToUpdate);
      return response.data;
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

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