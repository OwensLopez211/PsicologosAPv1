import { memo } from 'react';

interface UserAvatarProps {
  profileImage?: string | null;
  firstName: string;
  lastName: string;
  size?: 'small' | 'medium' | 'large';
}

const UserAvatar = memo(({ profileImage, firstName, lastName, size = 'medium' }: UserAvatarProps) => {
  // Función para obtener las iniciales de un nombre
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Función para obtener el color de fondo para las iniciales
  const getBackgroundColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 
      'bg-red-500', 'bg-teal-500'
    ];
    
    // Usar una función hash simple
    const hash = name.split('').reduce((acc, char, i) => 
      acc + char.charCodeAt(0) * (i + 1), 0);
    return colors[hash % colors.length];
  };

  // Determinar tamaño de avatar
  const sizeClasses = {
    small: 'h-8 w-8',
    medium: 'h-10 w-10',
    large: 'h-12 w-12'
  };
  
  const avatarSize = sizeClasses[size];
  const fullName = `${firstName} ${lastName}`;

  if (profileImage) {
    return (
      <img
        className={`${avatarSize} rounded-full object-cover`}
        src={profileImage}
        alt={`Foto de perfil de ${fullName}`}
        loading="lazy"
      />
    );
  }

  return (
    <div 
      className={`${avatarSize} rounded-full flex items-center justify-center text-white ${getBackgroundColor(fullName)}`}
      aria-label={`Iniciales de ${fullName}`}
    >
      {getInitials(firstName, lastName)}
    </div>
  );
});

UserAvatar.displayName = 'UserAvatar';

export default UserAvatar; 