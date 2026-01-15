// src/components/Avatar.tsx
import React, { useState } from 'react';
import { HiUser } from 'react-icons/hi';

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showOnline?: boolean;
  isOnline?: boolean;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt, 
  size = 'md', 
  showOnline = false,
  isOnline = false,
  className = '' 
}) => {
  const [hasError, setHasError] = useState(false);
  
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20'
  };
  
  const iconSizes = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8',
    '2xl': 'h-10 w-10'
  };

  const statusSizes = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5'
  };

  const handleImageError = () => {
    setHasError(true);
  };

  // Si no hay src o hubo error, mostrar avatar por defecto
  if (!src || hasError) {
    return (
      <div className="relative inline-block">
        <div 
          className={`${sizeClasses[size]} bg-gradient-to-br from-primary-400 to-secondary-400 dark:from-primary-600 dark:to-secondary-600 rounded-full flex items-center justify-center ${className}`}
          title={alt}
        >
          <HiUser className={`${iconSizes[size]} text-white`} />
        </div>
        {showOnline && (
          <span 
            className={`absolute bottom-0 right-0 ${statusSizes[size]} ${
              isOnline ? 'bg-secondary-500' : 'bg-gray-400'
            } border-2 border-white dark:border-gray-900 rounded-full`}
          ></span>
        )}
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      <img
        src={src}
        alt={alt}
        onError={handleImageError}
        loading="lazy"
        className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-primary-500 dark:ring-primary-400 ${className}`}
      />
      {showOnline && (
        <span 
          className={`absolute bottom-0 right-0 ${statusSizes[size]} ${
            isOnline ? 'bg-secondary-500' : 'bg-gray-400'
          } border-2 border-white dark:border-gray-900 rounded-full`}
        ></span>
      )}
    </div>
  );
};

export default Avatar;
