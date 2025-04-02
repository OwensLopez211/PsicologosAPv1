import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadProfileImage, deleteProfileImage } from '../../services/profileService';

interface ProfileImageUploaderProps {
  profileImage: string;
  userType?: string;
  isEditing: boolean;
  onImageUploaded: (imageUrl: string) => void;
}

const ProfileImageUploader = ({ 
  profileImage, 
  userType, 
  isEditing,
  onImageUploaded 
}: ProfileImageUploaderProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Function to handle image deletion
  const handleDeleteImage = async () => {
    if (!userType) {
      setUploadError('User type is required');
      return;
    }
    
    try {
      // Call the API to delete the image
      await deleteProfileImage(userType);
      
      // Clear the preview if it exists
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }
      
      // Notify parent component that image has been removed
      onImageUploaded('');
      
      console.log('Profile image removed successfully');
    } catch (error) {
      console.error('Error deleting profile image:', error);
      setUploadError('Error al eliminar la imagen de perfil. Por favor, inténtalo de nuevo.');
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("La imagen es demasiado grande. El tamaño máximo es 5MB.");
        return;
      }
      
      setUploadError(null);
      
      // Create a preview URL for the image
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      if (userType) {
        await handleImageUpload(file);
      }
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!userType) return;
    
    setIsUploadingImage(true);
    try {
      // Upload the image
      const response = await uploadProfileImage(userType, file);
      
      // Update the parent component with the new image URL
      onImageUploaded(response.profile_image);
      
      console.log('Image uploaded successfully:', response);
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError("Error al subir la imagen. Inténtalo de nuevo.");
      // Reset the preview on error
      setImagePreview(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Function to get the appropriate image source
  const getImageSource = () => {
    if (imagePreview) return imagePreview;
    if (profileImage) return profileImage;
    return '/no_profile_photo.webp'; // Placeholder image path
  };

  // Check if there's an actual profile image (not the default)
  const hasProfileImage = profileImage && profileImage !== '/no_profile_photo.webp';

  return (
    <motion.div 
      className="flex flex-col md:flex-row md:items-center gap-6 p-6 bg-white rounded-xl shadow-sm"
      animate={{ 
        opacity: 1,
        scale: 1
      }}
      initial={{ opacity: 0.9, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <div className="relative flex-shrink-0">
        <motion.div
          whileHover={{ scale: isEditing ? 1.05 : 1 }}
          transition={{ duration: 0.2 }}
          className="relative"
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
          <div className={`h-36 w-36 rounded-full overflow-hidden border-4 ${isEditing ? 'border-[#2A6877]' : 'border-[#B4E4D3]'} shadow-md transition-all duration-300`}>
            <img
              src={getImageSource()}
              alt="Profile"
              className={`h-full w-full object-cover transition-all duration-300 ${isHovered && isEditing ? 'opacity-80 scale-105' : 'opacity-100'}`}
              onError={(e) => {
                // Fallback if the image fails to load
                (e.target as HTMLImageElement).src = '/assets/images/no-profile-photo.png';
              }}
            />
          </div>
          
          <AnimatePresence>
            {isEditing && isHovered && (
              <motion.div 
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-white text-sm font-medium px-3 py-1.5 bg-black/40 rounded-full backdrop-blur-sm">
                  Cambiar foto
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Upload button */}
        <AnimatePresence>
          {isEditing && (
            <motion.label 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`absolute bottom-0 right-0 bg-[#2A6877] text-white p-2.5 rounded-full cursor-pointer hover:bg-[#235A67] transition-all duration-200 shadow-md ${isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isUploadingImage}
              />
              {isUploadingImage ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
                  <path d="M9 13h2v5a1 1 0 11-2 0v-5z" />
                </svg>
              )}
            </motion.label>
          )}
        </AnimatePresence>
        
        {/* Delete button - only show when editing and there's a profile image */}
        <AnimatePresence>
          {isEditing && (hasProfileImage || imagePreview) && (
            <motion.button
              type="button"
              onClick={handleDeleteImage}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute bottom-0 left-0 bg-red-500 text-white p-2.5 rounded-full cursor-pointer hover:bg-red-600 transition-all duration-200 shadow-md"
              disabled={isUploadingImage}
              title="Eliminar foto de perfil"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      
      <div className="flex-1">
        <h3 className="text-lg font-medium text-gray-900">Foto de Perfil</h3>
        <p className="text-sm text-gray-600 mb-3">Una buena foto profesional aumenta la confianza de tus pacientes</p>
        
        <AnimatePresence>
          {uploadError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-sm text-red-600 mb-2 bg-red-50 px-3 py-2 rounded-md"
            >
              {uploadError}
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md border border-gray-100"
            >
              <h4 className="font-medium text-gray-700 mb-1">Recomendaciones:</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>Usa una foto profesional donde se vea claramente tu rostro</li>
                <li>Formato recomendado: JPG o PNG</li>
                <li>Tamaño máximo: 5MB</li>
                <li>Resolución óptima: 400x400 píxeles</li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ProfileImageUploader;