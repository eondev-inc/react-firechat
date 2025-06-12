// src/services/chatService.ts
// src/services/chatService.ts
import { 
  ref, 
  push, 
  onValue, 
  off, 
  serverTimestamp,
  query,
  orderByChild,
  equalTo,
  get,
  set,
  remove
} from 'firebase/database';
import { database } from '../config/firebase';
import type { Message, Contact } from '../store/chatStore';

// Definir tipos para los datos de Firebase
interface FirebaseMessage {
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number | string | { seconds: number };
}

interface FirebaseUserData {
  email: string;
  displayName?: string;
  photoURL?: string;
  isOnline?: boolean;
  lastSeen?: number;
}

export const sendMessage = async (chatId: string, senderId: string, senderName: string, text: string): Promise<void> => {
  try {
    const messagesRef = ref(database, `chats/${chatId}/messages`);
    const messageData = {
      senderId,
      senderName,
      text,
      timestamp: serverTimestamp()
    };
    
    await push(messagesRef, messageData);
    
  } catch {
    throw new Error('Error al enviar mensaje');
  }
};

export const listenToMessages = (chatId: string, callback: (messages: Message[]) => void): (() => void) => {
  const messagesRef = ref(database, `chats/${chatId}/messages`);
  
  const unsubscribe = onValue(messagesRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const messages: Message[] = Object.entries(data).map(([id, msgData]: [string, unknown]) => {
        const msg = msgData as FirebaseMessage;
        // Manejar diferentes tipos de timestamp de Firebase
        let timestamp: Date;
        if (msg.timestamp && typeof msg.timestamp === 'object' && msg.timestamp.seconds) {
          // Firebase Timestamp object
          timestamp = new Date(msg.timestamp.seconds * 1000);
        } else if (msg.timestamp && typeof msg.timestamp === 'number') {
          // Unix timestamp
          timestamp = new Date(msg.timestamp);
        } else if (msg.timestamp && typeof msg.timestamp === 'string') {
          // ISO string
          timestamp = new Date(msg.timestamp);
        } else {
          // Fallback a fecha actual si no hay timestamp válido
          timestamp = new Date();
        }

        return {
          id,
          senderId: msg.senderId,
          senderName: msg.senderName,
          text: msg.text,
          timestamp,
          chatId
        };
      });
      
      messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      callback(messages);
    } else {
      callback([]);
    }
  });

  return () => off(messagesRef, 'value', unsubscribe);
};

export const createPrivateChat = async (userId: string, contactId: string): Promise<string> => {
  try {
    // Create a deterministic chat ID based on user IDs
    const userIds = [userId, contactId].sort((a, b) => a.localeCompare(b));
    const chatId = `private_${userIds[0]}_${userIds[1]}`;
    
    const chatRef = ref(database, `chats/${chatId}`);
    
    // Check if chat already exists
    const existingChat = await get(chatRef);
    if (existingChat.exists()) {
      return chatId;
    }
    
    // Create new private chat
    await set(chatRef, {
      participants: {
        [userId]: true,
        [contactId]: true
      },
      type: 'private',
      createdAt: serverTimestamp(),
      lastActivity: serverTimestamp()
    });
    
    return chatId;
  } catch {
    throw new Error('Error al crear chat privado');
  }
};

export const addContact = async (userId: string, contactEmail: string): Promise<Contact | null> => {
  try {
    // Check if contact email is @gmail.com
    if (!contactEmail.endsWith('@gmail.com')) {
      throw new Error('Solo se pueden agregar contactos con dominio @gmail.com');
    }

    // Check if user exists in Firebase Auth
    const usersRef = ref(database, 'users');
    const userQuery = query(usersRef, orderByChild('email'), equalTo(contactEmail));
    const snapshot = await get(userQuery);
    
    if (!snapshot.exists()) {
      // Send notification to user (implementation depends on your notification system)
      await sendNotificationToUser(contactEmail);
      throw new Error('El usuario no ha iniciado sesión nunca. Se le enviará una notificación.');
    }

    const userData = Object.values(snapshot.val())[0] as FirebaseUserData;
    const contactUid = Object.keys(snapshot.val())[0]; // Obtener el UID real del contacto
    
    // Verificar si el contacto ya existe para evitar duplicados
    const existingContactRef = ref(database, `users/${userId}/contacts/${contactUid}`);
    const existingContact = await get(existingContactRef);
    
    if (existingContact.exists()) {
      throw new Error('Este contacto ya existe en tu lista.');
    }
    
    const contact: Contact = {
      id: contactUid, // Usar el UID real en lugar de un UUID aleatorio
      email: userData.email,
      displayName: userData.displayName ?? userData.email,
      photoURL: userData.photoURL,
      isOnline: userData.isOnline ?? false,
      lastSeen: new Date(userData.lastSeen ?? Date.now())
    };

    // Add to user's contacts using the real UID
    const contactsRef = ref(database, `users/${userId}/contacts/${contactUid}`);
    await set(contactsRef, contact);

    return contact;
  } catch {
    throw new Error('Error al agregar contacto');
  }
};

export const loadUserContacts = (userId: string, callback: (contacts: Contact[]) => void): (() => void) => {
  const contactsRef = ref(database, `users/${userId}/contacts`);
  
  const unsubscribe = onValue(contactsRef, (snapshot) => {
    const data = snapshot.val();
    
    if (data && typeof data === 'object') {
      const contacts: Contact[] = Object.values(data);
      callback(contacts);
    } else {
      callback([]);
    }
  }, () => {
    // Error silenciado - usar callback vacío en caso de error
    callback([]);
  });

  return () => off(contactsRef, 'value', unsubscribe);
};

export const removeContact = async (userId: string, contactId: string): Promise<void> => {
  try {
    const contactRef = ref(database, `users/${userId}/contacts/${contactId}`);
    await remove(contactRef);
  } catch {
    throw new Error('Error al eliminar contacto');
  }
};

export const setTypingStatus = async (chatId: string, userId: string, isTyping: boolean): Promise<void> => {
  try {
    const typingRef = ref(database, `chats/${chatId}/typing/${userId}`);
    if (isTyping) {
      await set(typingRef, {
        isTyping: true,
        timestamp: serverTimestamp()
      });
      
      // Auto-remove typing status after 3 seconds
      setTimeout(async () => {
        await remove(typingRef);
      }, 3000);
    } else {
      await remove(typingRef);
    }
  } catch {
    // Error silenciado para typing status
  }
};

export const listenToTypingStatus = (chatId: string, callback: (typingUsers: string[]) => void): (() => void) => {
  const typingRef = ref(database, `chats/${chatId}/typing`);
  
  const unsubscribe = onValue(typingRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const typingUsers = Object.keys(data);
      callback(typingUsers);
    } else {
      callback([]);
    }
  });

  return () => off(typingRef, 'value', unsubscribe);
};

export const initializeGeneralChat = async (): Promise<void> => {
  try {
    const generalChatRef = ref(database, 'chats/general');
    const snapshot = await get(generalChatRef);
    
    if (!snapshot.exists()) {
      await set(generalChatRef, {
        type: 'general',
        name: 'Chat General',
        createdAt: serverTimestamp(),
        lastActivity: serverTimestamp(),
        participants: {
          'public': true
        }
      });
    }
  } catch {
    throw new Error('Error al inicializar chat general');
  }
};

const sendNotificationToUser = async (email: string): Promise<void> => {
  // This would integrate with Firebase Cloud Messaging
  // Store pending invitation using a unique ID
  const invitationId = `${email.replace(/[.@]/g, '_')}_${Date.now()}`;
  const invitationRef = ref(database, `invitations/${invitationId}`);
  await set(invitationRef, {
    email,
    timestamp: serverTimestamp(),
    message: 'Tienes una invitación para unirte al chat'
  });
};

// Función para obtener información completa del usuario incluyendo avatar
export const getUserInfo = async (userId: string): Promise<{
  displayName: string;
  photoURL?: string;
  email: string;
} | null> => {
  try {
    const userRef = ref(database, `users/${userId}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      const userData = snapshot.val();
      return {
        displayName: userData.displayName ?? userData.email,
        photoURL: userData.photoURL,
        email: userData.email
      };
    }
    return null;
  } catch {
    return null;
  }
};
