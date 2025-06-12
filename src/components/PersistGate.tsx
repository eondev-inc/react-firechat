// src/components/PersistGate.tsx
import React, { useEffect, useState } from 'react';

interface PersistGateProps {
  children: React.ReactNode;
  loading?: React.ReactNode;
}

/**
 * Componente que espera a que se complete la hidratación de los stores
 * antes de renderizar la aplicación principal
 */
const PersistGate: React.FC<PersistGateProps> = ({ 
  children, 
  loading = <div>Cargando...</div> 
}) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Esperar a que se complete la hidratación
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!isHydrated) {
    return <>{loading}</>;
  }

  return <>{children}</>;
};

export default PersistGate;
