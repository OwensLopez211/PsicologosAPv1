import { useState, useEffect } from 'react';
import { PsychologistProfile, Gender } from '../../types/psychologist';

interface BasicInfoProps {
  profile?: PsychologistProfile;
  onSave: (data: Partial<PsychologistProfile>) => void;
  isLoading: boolean;
}

const BasicInfo = ({ profile, onSave, isLoading }: BasicInfoProps) => {
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

  useEffect(() => {
    if (profile) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsEditing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Información Personal</h2>
        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-4 py-2 border border-[#2A6877] text-sm font-medium rounded-md text-[#2A6877] hover:bg-gray-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Editar
          </button>
        ) : null}
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative">
          <img
            src={formData.profile_image || '/default-avatar.png'}
            alt="Profile"
            className="h-32 w-32 rounded-full object-cover border-4 border-[#B4E4D3]"
          />
          <label className="absolute bottom-0 right-0 bg-[#2A6877] text-white p-2 rounded-full cursor-pointer hover:bg-[#235A67] transition-colors">
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                // Image upload logic will be implemented later
              }}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </label>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">Foto de Perfil</h3>
          <p className="text-sm text-gray-500">Sube una foto profesional para tu perfil</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
            Nombre
          </label>
          <input
            type="text"
            id="first_name"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            disabled={!isEditing}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2A6877] focus:ring-[#2A6877] 
              ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          />
        </div>

        {/* Apply the same pattern to all other inputs except email */}
        {/* For example, last_name input: */}
        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
            Apellido
          </label>
          <input
            type="text"
            id="last_name"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            disabled={!isEditing}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2A6877] focus:ring-[#2A6877] 
              ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          />
        </div>

        <div>
          <label htmlFor="rut" className="block text-sm font-medium text-gray-700">
            RUT (opcional)
          </label>
          <input
            type="text"
            id="rut"
            value={formData.rut}
            onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
            disabled={!isEditing}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2A6877] focus:ring-[#2A6877]
              ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          />
        </div>

        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
            Género (opcional)
          </label>
          <select
            id="gender"
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
            disabled={!isEditing}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2A6877] focus:ring-[#2A6877]
              ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          >
            <option value="">Seleccionar</option>
            <option value="MALE">Masculino</option>
            <option value="FEMALE">Femenino</option>
            <option value="OTHER">Otro</option>
            <option value="PREFER_NOT_TO_SAY">Prefiero no decirlo</option>
          </select>
        </div>

        {/* Email field remains always disabled */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Teléfono
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            disabled={!isEditing}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2A6877] focus:ring-[#2A6877]
              ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          />
        </div>

        <div>
          <label htmlFor="region" className="block text-sm font-medium text-gray-700">
            Región
          </label>
          <input
            type="text"
            id="region"
            value={formData.region}
            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            disabled={!isEditing}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2A6877] focus:ring-[#2A6877]
              ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          />
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            Ciudad
          </label>
          <input
            type="text"
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            disabled={!isEditing}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2A6877] focus:ring-[#2A6877]
              ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        {isEditing && (
          <button
            type="button"
            onClick={() => {
              setIsEditing(false);
              setFormData({
                ...profile,
                first_name: profile?.first_name || '',
                last_name: profile?.last_name || ''
                // ... reset other fields
              });
            }}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A6877]"
          >
            Cancelar
          </button>
        )}
        {isEditing && (
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#2A6877] hover:bg-[#235A67] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A6877] disabled:opacity-50"
          >
            {isLoading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        )}
      </div>
    </form>
  );
};

export default BasicInfo;