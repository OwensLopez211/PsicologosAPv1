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
    console.error('Response details:', error.response?.data);
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
    // Check if profileData contains a profile_image that is a File object
    if (profileData.profile_image instanceof File) {
      // Create a FormData object for file upload
      const formData = new FormData();
      
      // Add the image file to the form data
      formData.append('profile_image', profileData.profile_image);
      
      // Add other profile data fields to the form data
      Object.keys(profileData).forEach(key => {
        if (key !== 'profile_image' && profileData[key] !== undefined) {
          formData.append(key, profileData[key]);
        }
      });
      
      // Send the form data with the file
      const response = await api.patch(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      // If no file is being uploaded, send the data as JSON
      const response = await api.patch(endpoint, profileData);
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