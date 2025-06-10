// src/utils/firebaseContactsDebug.ts
import { ref, get } from 'firebase/database';
import { database } from '../config/firebase';

/**
 * Función de utilidad para verificar que los contactos están siendo preservados
 * correctamente en Firebase después del logout.
 * 
 * Uso: 
 * - Antes del logout: await checkContactsInFirebase(userId);
 * - Después del logout: await checkContactsInFirebase(userId);
 */
export const checkContactsInFirebase = async (userId: string): Promise<void> => {
  try {
    const userRef = ref(database, `users/${userId}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      const userData = snapshot.val();
      
      if (process.env.NODE_ENV === 'development') {
        console.log('=== Firebase User Data Debug ===');
        console.log('User ID:', userId);
        console.log('User structure:', Object.keys(userData));
        console.log('Has contacts?', !!userData.contacts);
        
        if (userData.contacts) {
          console.log('Contacts count:', Object.keys(userData.contacts).length);
          console.log('Contacts:', userData.contacts);
        } else {
          console.log('⚠️ No contacts found in Firebase for user');
        }
        console.log('===============================');
      }
    } else {
      console.log('⚠️ User not found in Firebase:', userId);
    }
  } catch (error) {
    console.error('Error checking contacts in Firebase:', error);
  }
};

/**
 * Función para verificar la integridad de los datos del usuario en Firebase
 */
export const verifyUserDataIntegrity = async (userId: string): Promise<boolean> => {
  try {
    const userRef = ref(database, `users/${userId}`);
    const snapshot = await get(userRef);
    
    if (!snapshot.exists()) {
      return false;
    }
    
    const userData = snapshot.val();
    
    // Verificar que los campos esenciales estén presentes
    const hasBasicFields = !!(userData.uid && userData.email);
    
    // Verificar que los contactos no hayan sido eliminados accidentalmente
    const contactsExist = userData.contacts !== undefined;
    
    return hasBasicFields && contactsExist;
  } catch (error) {
    console.error('Error verifying user data integrity:', error);
    return false;
  }
};
