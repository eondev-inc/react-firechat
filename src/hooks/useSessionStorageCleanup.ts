// src/hooks/useSessionStorageCleanup.ts
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

/**
 * Hook para limpiar el sessionStorage cuando el usuario se deslogea
 * o cuando se detecta una sesión inválida.
 * IMPORTANTE: Solo limpia sessionStorage local, NO elimina datos de Firebase.
 */
export const useSessionStorageCleanup = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  useEffect(() => {
    if (!isAuthenticated) {
      // Solo limpiar el sessionStorage local cuando el usuario no está autenticado
      // NO tocar los datos de Firebase - los contactos deben persistir
      sessionStorage.removeItem('auth-storage');
      sessionStorage.removeItem('chat-storage');
    }
  }, [isAuthenticated]);

  // Función para limpiar manualmente todo el storage cuando sea necesario
  // SOLO para uso de emergencia - no elimina datos de Firebase
  const clearAllStorage = () => {
    sessionStorage.removeItem('auth-storage');
    sessionStorage.removeItem('chat-storage');
    
    // Reiniciar los stores locales únicamente
    useAuthStore.getState().logout();
  };

  return {
    clearAllStorage,
  };
};
