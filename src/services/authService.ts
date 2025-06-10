// src/services/authService.ts
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { ref, set, serverTimestamp } from 'firebase/database';
import { auth, googleProvider, database } from '../config/firebase';
import { useAuthStore } from '../store/authStore';

// Save user profile to Firebase Database when they sign in
const saveUserProfile = async (user: User): Promise<void> => {
  try {
    const userRef = ref(database, `users/${user.uid}`);
    
    // Check if user already exists to avoid overwriting contacts
    const { get } = await import('firebase/database');
    const existingUser = await get(userRef);
    
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName ?? user.email,
      photoURL: user.photoURL,
      isOnline: true,
      lastSeen: serverTimestamp()
    };
    
    if (existingUser.exists()) {
      // User exists, just update status
      await set(userRef, {
        ...existingUser.val(),
        ...userData
      });
    } else {
      // New user, create complete structure
      await set(userRef, {
        ...userData,
        contacts: {} // Initialize empty contacts object
      });
    }
  } catch {
    throw new Error('Error al guardar el perfil de usuario');
  }
};

export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Save user profile to database
    await saveUserProfile(result.user);
    return result.user;
  } catch {
    throw new Error('Error al iniciar sesión con Google');
  }
};

export const logout = async (): Promise<void> => {
  try {
    // Set user as offline before signing out
    const user = auth.currentUser;
    if (user) {
      const userRef = ref(database, `users/${user.uid}`);
      // Usar update() en lugar de set() para preservar los contactos
      const { update } = await import('firebase/database');
      await update(userRef, {
        isOnline: false,
        lastSeen: serverTimestamp()
      });
    }
    
    await signOut(auth);
    
    // Limpiar sessionStorage
    sessionStorage.removeItem('auth-storage');
    sessionStorage.removeItem('chat-storage');
    
    useAuthStore.getState().logout();
  } catch {
    throw new Error('Error al cerrar sesión');
  }
};

export const initAuthListener = (): (() => void) => {
  return onAuthStateChanged(auth, (user) => {
    useAuthStore.getState().setUser(user);
  });
};
