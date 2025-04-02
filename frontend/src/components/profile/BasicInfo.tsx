import { useState, useEffect } from 'react';

import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileImageUploader from './ProfileImageUploader';
import ProfileFormFields from './ProfileFormFields';

// Update interface to be more generic
interface BasicInfoProps {
  profile?: any; // Make this more generic to accept any profile type
  onSave: (data: any) => void; // Accept any data type for saving
  isLoading: boolean;
}

const BasicInfo = ({ profile, onSave, isLoading }: BasicInfoProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    profile_image: '',
    rut: '',
    gender: '',
    email: '',
    phone: '',
    region: '',
    city: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // In the useEffect that sets form data
  useEffect(() => {
    if (profile) {
      console.log("Profile data received:", profile);
      
      // Check if we're dealing with a nested user structure or flat structure
      const isNestedUserStructure = profile.user && typeof profile.user === 'object';
      
      setFormData({
        first_name: isNestedUserStructure ? profile.user?.first_name : profile.first_name || '',
        last_name: isNestedUserStructure ? profile.user?.last_name : profile.last_name || '',
        profile_image: profile.profile_image || '',
        rut: profile.rut || '',
        gender: profile.gender || '',
        email: isNestedUserStructure ? profile.user?.email : profile.email || '',
        phone: profile.phone || '',
        region: profile.region || '',
        city: profile.city || '',
      });
    }
  }, [profile]);

  // Reset success message after 3 seconds
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (saveSuccess) {
      timer = setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [saveSuccess]);

  const handleFormChange = (newFormData: typeof formData) => {
    console.log("Form data changed:", newFormData);
    setFormData(newFormData);
  };

  const handleImageUploaded = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      profile_image: imageUrl
    }));
    setIsUploadingImage(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    
    try {
      console.log("Submitting form data:", formData);
      
      // Create a copy of the data to send
      const dataToSave = { ...formData };
      
      // If profile_image is a URL string, set it to undefined instead of using delete
      if (typeof dataToSave.profile_image === 'string') {
        dataToSave.profile_image = '';
      }
      
      await onSave(dataToSave);
      setIsEditing(false);
      setSaveSuccess(true);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveError('Error al guardar los cambios. Por favor, inténtalo de nuevo.');
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    
    if (!profile) return;
    
    // Check if we're dealing with a nested user structure or flat structure
    const isNestedUserStructure = profile.user && typeof profile.user === 'object';
    
    setFormData({
      first_name: isNestedUserStructure ? profile.user?.first_name : profile.first_name || '',
      last_name: isNestedUserStructure ? profile.user?.last_name : profile.last_name || '',
      profile_image: profile.profile_image || '',
      rut: profile.rut || '',
      gender: profile.gender || '',
      email: isNestedUserStructure ? profile.user?.email : profile.email || '',
      phone: profile.phone || '',
      region: profile.region || '',
      city: profile.city || '',
    });
  };

  // Determine which fields should be disabled based on user type
  const getDisabledFields = () => {
    // Common disabled fields for all user types
    const disabledFields: string[] = [];
    
    // For all user types, email is typically not editable after registration
    disabledFields.push('email');
    
    return disabledFields;
  };

  return (
    <motion.div
      layout
      transition={{ duration: 0.3 }}
      className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm overflow-hidden"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <motion.span 
              className="text-2xl"
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 0.5 }}
            >
              👤
            </motion.span>
            <h2 className="text-xl font-semibold text-gray-900">Información Personal</h2>
          </div>
          
          <div className="flex items-center gap-3">
            <AnimatePresence>
              {saveSuccess && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="text-sm text-green-600 flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Guardado
                </motion.div>
              )}
            </AnimatePresence>
            
            <AnimatePresence mode="wait">
              {!isEditing ? (
                <motion.button
                  key="edit-button"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 border border-[#2A6877] text-sm font-medium rounded-md text-[#2A6877] hover:bg-gray-50 hover:shadow-sm transition-all"
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

        <div className="px-6">
          <ProfileImageUploader 
            profileImage={formData.profile_image}
            userType={user?.user_type}
            isEditing={isEditing}
            onImageUploaded={handleImageUploaded}
          />
        </div>

        <div className="px-6 pb-6">
          <ProfileFormFields 
            formData={formData}
            isEditing={isEditing}
            onChange={handleFormChange}
            disabledFields={getDisabledFields()}
          />
        </div>

        {saveError && (
          <div className="px-6">
            <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-md">
              {saveError}
            </div>
          </div>
        )}

        <AnimatePresence>
          {isEditing && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="flex justify-end space-x-4 p-6 bg-gray-50 border-t border-gray-100"
            >
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A6877] transition-all duration-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading || isUploadingImage}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#2A6877] hover:bg-[#235A67] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A6877] disabled:opacity-50 transition-all duration-200"
              >
                {isLoading || isUploadingImage ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </span>
                ) : 'Guardar cambios'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
};

export default BasicInfo;
