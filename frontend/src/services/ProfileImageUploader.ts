import axios from 'axios';

export const uploadProfileImage = async (file: File, userType: string, token: string | null) => {
  if (!token) {
    throw new Error('No authentication token provided');
  }

  // Create form data
  const formData = new FormData();
  formData.append('profile_image', file);

  // Determine the correct endpoint based on user type
  let endpoint = '';
  if (userType === 'client') {
    endpoint = '/api/profiles/clients/upload_image/';
  } else if (userType === 'psychologist') {
    endpoint = '/api/profiles/psychologists/upload_image/';
  } else if (userType === 'admin') {
    endpoint = '/api/profiles/admin/upload_image/';
  } else {
    throw new Error('Invalid user type');
  }

  try {
    // Get CSRF token from cookie if available
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];

    // Set up headers with both Authorization and CSRF token
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
    };

    // Add CSRF token if available
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }

    const response = await axios.post(endpoint, formData, {
      headers,
      // Important: Don't set Content-Type manually when using FormData
      // Let the browser set the correct multipart/form-data boundary
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};