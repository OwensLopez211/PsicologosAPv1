import { useState } from 'react';
import { motion } from 'framer-motion';
import { uploadProfileImage } from '../../services/profileService';

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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Create a preview URL for the image
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      if (userType && !isEditing) {
        // If not in editing mode, upload the image immediately
        await handleImageUpload(file);
      } else if (isEditing) {
        // In editing mode, just store the file for later upload
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
      // Reset the preview on error
      setImagePreview(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <motion.div 
      className="flex items-center space-x-6 p-4 bg-white/60 rounded-xl shadow-sm mb-6"
      animate={{ 
        opacity: isEditing ? 1 : 0.9,
        scale: isEditing ? 1 : 0.99
      }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          className="relative"
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
          <img
            src={imagePreview || profileImage || '/default-avatar.png'}
            alt="Profile"
            className={`h-32 w-32 rounded-full object-cover border-4 ${isEditing ? 'border-[#2A6877]' : 'border-[#B4E4D3]'} transition-all duration-300 ${isHovered && isEditing ? 'opacity-80' : 'opacity-100'}`}
          />
          {isEditing && (
            <motion.div 
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-white text-sm font-medium">Cambiar foto</span>
            </motion.div>
          )}
        </motion.div>
        
        <label className={`absolute bottom-0 right-0 bg-[#2A6877] text-white p-2 rounded-full cursor-pointer hover:bg-[#235A67] transition-all duration-200 shadow-md ${isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''} ${!isEditing ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
            disabled={isUploadingImage || !isEditing}
          />
          {isUploadingImage ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          )}
        </label>
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-medium text-gray-900">Foto de Perfil</h3>
        <p className="text-sm text-gray-500 mb-2">Sube una foto profesional para tu perfil</p>
        
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="text-xs text-gray-500"
          >
            <ul className="list-disc pl-4 space-y-1">
              <li>Formato recomendado: JPG o PNG</li>
              <li>Tamaño máximo: 5MB</li>
              <li>Resolución óptima: 400x400 píxeles</li>
            </ul>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ProfileImageUploader;