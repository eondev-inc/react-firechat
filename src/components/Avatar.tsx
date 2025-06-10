// src/components/Avatar.tsx
import React, { useState } from 'react';
import { HiUser } from 'react-icons/hi';

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt, 
  size = 'md', 
  className = '' 
}) => {
  const [hasError, setHasError] = useState(false);
  
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-10 h-10'
  };
  
  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const handleImageError = () => {
    setHasError(true);
  };

  // Si no hay src o hubo error, mostrar avatar por defecto
  if (!src || hasError) {
    return (
      <div 
        className={`${sizeClasses[size]} bg-gray-300 rounded-full flex items-center justify-center ${className}`}
        title={alt}
      >
        <HiUser className={`${iconSizes[size]} text-gray-500`} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={handleImageError}
      className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
    />
  );
};

export default Avatar;
