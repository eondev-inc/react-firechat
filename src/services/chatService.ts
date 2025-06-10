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
import { v4 as uuidv4 } from 'uuid';

export const sendMessage = async (chatId: string, senderId: string, senderName: string, text: string): Promise<void> => {
  try {
    const messagesRef = ref(database, `chats/${chatId}/messages`);
    await push(messagesRef, {
      senderId,
      senderName,
      text,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const listenToMessages = (chatId: string, callback: (messages: Message[]) => void): (() => void) => {
  const messagesRef = ref(database, `chats/${chatId}/messages`);
  
  const unsubscribe = onValue(messagesRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const messages: Message[] = Object.entries(data).map(([id, msg]: [string, any]) => ({
        id,
        senderId: msg.senderId,
        senderName: msg.senderName,
        text: msg.text,
        timestamp: new Date(msg.timestamp),
        chatId
      }));
      
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
    const userIds = [userId, contactId].sort();
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
  } catch (error) {
    console.error('Error creating private chat:', error);
    throw error;
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

    const userData = Object.values(snapshot.val())[0] as any;
    const contact: Contact = {
      id: uuidv4(),
      email: userData.email,
      displayName: userData.displayName || userData.email,
      photoURL: userData.photoURL,
      isOnline: userData.isOnline || false,
      lastSeen: new Date(userData.lastSeen || Date.now())
    };

    // Add to user's contacts using UID instead of email
    const contactsRef = ref(database, `users/${userId}/contacts/${contact.id}`);
    await set(contactsRef, contact);

    return contact;
  } catch (error) {
    console.error('Error adding contact:', error);
    throw error;
  }
};

export const loadUserContacts = (userId: string, callback: (contacts: Contact[]) => void): (() => void) => {
  const contactsRef = ref(database, `users/${userId}/contacts`);
  
  const unsubscribe = onValue(contactsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const contacts: Contact[] = Object.values(data);
      callback(contacts);
    } else {
      callback([]);
    }
  });

  return () => off(contactsRef, 'value', unsubscribe);
};

export const removeContact = async (userId: string, contactId: string): Promise<void> => {
  try {
    const contactRef = ref(database, `users/${userId}/contacts/${contactId}`);
    await remove(contactRef);
  } catch (error) {
    console.error('Error removing contact:', error);
    throw error;
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
  } catch (error) {
    console.error('Error setting typing status:', error);
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

const sendNotificationToUser = async (email: string): Promise<void> => {
  // This would integrate with Firebase Cloud Messaging
  // For now, we'll just log it
  console.log(`Notification sent to ${email}`);
  
  // Store pending invitation using a unique ID
  const invitationId = `${email.replace(/[.@]/g, '_')}_${Date.now()}`;
  const invitationRef = ref(database, `invitations/${invitationId}`);
  await set(invitationRef, {
    email,
    timestamp: serverTimestamp(),
    message: 'Tienes una invitación para unirte al chat'
  });
};
