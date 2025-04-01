import { useState, useEffect } from 'react';
import { PsychologistProfile } from '../../types/psychologist';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileImageUploader from './ProfileImageUploader';
import ProfileFormFields from './ProfileFormFields';

interface BasicInfoProps {
  profile?: PsychologistProfile;
  onSave: (data: Partial<PsychologistProfile>) => void;
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

  // In the useEffect that sets form data
  useEffect(() => {
    if (profile) {
      console.log("Profile data received:", profile);
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        profile_image: profile.profile_image || '',
        rut: profile.rut || '',
        gender: profile.gender || '',
        email: profile.email || '',
        phone: profile.phone || '',
        region: profile.region || '',
        city: profile.city || '',
      });
    }
  }, [profile]);

  const handleFormChange = (newFormData: typeof formData) => {
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
    
    try {
      // Create a copy of formData without the profile_image field for the PATCH request
      const { profile_image, ...dataToSave } = formData;
      
      // Save the rest of the form data
      onSave(dataToSave);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setFormData({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      profile_image: profile?.profile_image || '',
      rut: profile?.rut || '',
      gender: profile?.gender || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      region: profile?.region || '',
      city: profile?.city || '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Información Personal</h2>
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

      <ProfileImageUploader 
        profileImage={formData.profile_image}
        userType={user?.user_type}
        isEditing={isEditing}
        onImageUploaded={handleImageUploaded}
      />

      <ProfileFormFields 
        formData={formData}
        isEditing={isEditing}
        onChange={handleFormChange}
      />

      <AnimatePresence>
        {isEditing && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="flex justify-end space-x-4"
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
              {isLoading || isUploadingImage ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
};

export default BasicInfo;
