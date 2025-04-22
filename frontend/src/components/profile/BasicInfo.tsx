import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileFormFields from './ProfileFormFields';
import ProfileImageUploader from './ProfileImageUploader';
import { UserIcon, CheckIcon } from '@heroicons/react/24/outline';

interface BasicInfoProps {
  profile?: any;
  onSave: (data: any) => void;
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
  
  // Cargar datos del perfil
  useEffect(() => {
    if (profile) {
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

  // Resetear mensaje de éxito
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

  // Manejadores de formulario
  const handleFormChange = (newFormData: typeof formData) => {
    setFormData(newFormData);
  };

  // Handler para cuando la imagen se ha subido desde el ProfileImageUploader
  const handleImageUploaded = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      profile_image: imageUrl
    }));
    setIsUploadingImage(false);
  };

  // Manejador para enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    
    try {
      console.log("Enviando datos al backend:", formData); // Añadir log para depuración
      
      const dataToSave = { ...formData };
      
      // No enviamos la imagen de perfil en los datos a guardar
      delete dataToSave.profile_image;
      
      await onSave(dataToSave);
      setIsEditing(false);
      setSaveSuccess(true);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveError('Error al guardar los cambios. Por favor, inténtalo de nuevo.');
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setIsEditing(false);
    
    if (!profile) return;
    
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

  // Obtener campos deshabilitados
  const getDisabledFields = () => {
    const disabledFields: string[] = [];
    disabledFields.push('email');
    return disabledFields;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-gradient-to-b from-white to-gray-50/90 backdrop-blur-sm rounded-2xl shadow-md overflow-hidden border border-gray-100"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Encabezado */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#2A6877] to-[#B4E4D3] text-white">
              <UserIcon className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Información Personal</h2>
          </div>
          
          <div className="flex items-center gap-3">
            <AnimatePresence>
              {saveSuccess && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-sm"
                >
                  <CheckIcon className="h-4 w-4" />
                  <span>Guardado</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            <AnimatePresence>
              {!isEditing ? (
                <motion.button
                  key="edit-button"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 border border-[#2A6877] text-sm font-medium rounded-full text-[#2A6877] bg-white hover:bg-[#2A6877] hover:text-white hover:shadow-md transition-all"
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

        {/* Imagen de perfil - Usando ProfileImageUploader */}
        <div className="px-6">
          <ProfileImageUploader 
            profileImage={formData.profile_image}
            userType={user?.user_type}
            isEditing={isEditing}
            onImageUploaded={handleImageUploaded}
          />
        </div>

        {/* Campos del formulario */}
        <div className="px-6 pb-6">
          <ProfileFormFields 
            formData={formData}
            isEditing={isEditing}
            onChange={handleFormChange}
            disabledFields={getDisabledFields()}
          />
        </div>

        {/* Mensaje de error */}
        <AnimatePresence>
          {saveError && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="px-6"
            >
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-md border border-red-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {saveError}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botones de acción */}
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
                className="inline-flex justify-center py-2 px-5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-[#2A6877] to-[#235A67] hover:from-[#235A67] hover:to-[#1A4652] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A6877] disabled:opacity-50 transition-all duration-200"
              >
                {isLoading || isUploadingImage ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Guardar cambios
                    <CheckIcon className="h-4 w-4 ml-2" />
                  </span>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
};

export default BasicInfo;