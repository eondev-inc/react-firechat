// src/utils/sessionStoragePersist.ts
import type { StateStorage } from 'zustand/middleware';

// Crear un storage personalizado que use sessionStorage
export const sessionStorageAPI: StateStorage = {
  getItem: (name: string): string | null => {
    try {
      return sessionStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      sessionStorage.setItem(name, value);
    } catch {
      // Error silenciado al escribir en sessionStorage
    }
  },
  removeItem: (name: string): void => {
    try {
      sessionStorage.removeItem(name);
    } catch {
      // Error silenciado al eliminar de sessionStorage
    }
  },
};

// Función helper para serializar fechas en JSON
export const dateReviver = (_key: string, value: unknown): unknown => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    return new Date(value);
  }
  return value;
};

// Función helper para preparar el estado antes de serializar
export const prepareStateForSerialization = (state: unknown): unknown => {
  return JSON.parse(JSON.stringify(state), dateReviver);
};
