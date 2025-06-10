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
    await set(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email,
      photoURL: user.photoURL,
      isOnline: true,
      lastSeen: serverTimestamp()
    });
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
};

export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Save user profile to database
    await saveUserProfile(result.user);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    // Set user as offline before signing out
    const user = auth.currentUser;
    if (user) {
      const userRef = ref(database, `users/${user.uid}`);
      await set(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email,
        photoURL: user.photoURL,
        isOnline: false,
        lastSeen: serverTimestamp()
      });
    }
    
    await signOut(auth);
    useAuthStore.getState().logout();
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const initAuthListener = (): (() => void) => {
  return onAuthStateChanged(auth, (user) => {
    useAuthStore.getState().setUser(user);
  });
};
