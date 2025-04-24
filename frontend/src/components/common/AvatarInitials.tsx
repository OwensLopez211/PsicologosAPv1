import React from 'react';

interface AvatarInitialsProps {
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const AvatarInitials: React.FC<AvatarInitialsProps> = ({ 
  name, 
  className = '', 
  size = 'md' 
}) => {
  // Obtener las iniciales del nombre (máximo 2 caracteres)
  const getInitials = (name: string): string => {
    if (!name) return '?';
    
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };
  
  // Generar un color basado en el nombre
  const getColorClass = (name: string): string => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
    ];
    
    // Usar la suma de los valores ASCII de las letras para determinar el índice
    const sum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[sum % colors.length];
  };
  
  // Determinar el tamaño de la fuente según el prop size
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-12 w-12 text-base',
    lg: 'h-16 w-16 text-xl',
  };
  
  const initials = getInitials(name);
  const colorClass = getColorClass(name);
  const sizeClass = sizeClasses[size];
  
  return (
    <div 
      className={`flex items-center justify-center rounded-full text-white font-medium ${colorClass} ${sizeClass} ${className}`}
    >
      {initials}
    </div>
  );
};

export default AvatarInitials; 