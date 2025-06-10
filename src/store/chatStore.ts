// src/store/chatStore.ts
import { create } from 'zustand';

export interface Contact {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isOnline: boolean;
  lastSeen: Date;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
  chatId: string;
}

export interface Chat {
  id: string;
  participants: string[];
  isPrivate: boolean;
  name?: string;
  lastMessage?: Message;
  typingUsers: string[];
}

interface ChatState {
  contacts: Contact[];
  chats: Chat[];
  messages: { [chatId: string]: Message[] };
  currentChatId: string | null;
  typingUsers: { [chatId: string]: string[] };
  
  // Actions
  addContact: (contact: Contact) => void;
  removeContact: (contactId: string) => void;
  setContacts: (contacts: Contact[]) => void;
  
  addMessage: (message: Message) => void;
  setMessages: (chatId: string, messages: Message[]) => void;
  
  setCurrentChat: (chatId: string | null) => void;
  
  setTypingUsers: (chatId: string, users: string[]) => void;
  addTypingUser: (chatId: string, userId: string) => void;
  removeTypingUser: (chatId: string, userId: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  contacts: [],
  chats: [],
  messages: {},
  currentChatId: null,
  typingUsers: {},

  addContact: (contact) => 
    set((state) => ({ 
      contacts: [...state.contacts, contact] 
    })),

  removeContact: (contactId) =>
    set((state) => ({
      contacts: state.contacts.filter(c => c.id !== contactId)
    })),

  setContacts: (contacts) => set({ contacts }),

  addMessage: (message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [message.chatId]: [...(state.messages[message.chatId] || []), message]
      }
    })),

  setMessages: (chatId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: messages
      }
    })),

  setCurrentChat: (chatId) => set({ currentChatId: chatId }),

  setTypingUsers: (chatId, users) =>
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [chatId]: users
      }
    })),

  addTypingUser: (chatId, userId) =>
    set((state) => {
      const currentUsers = state.typingUsers[chatId] || [];
      if (!currentUsers.includes(userId)) {
        return {
          typingUsers: {
            ...state.typingUsers,
            [chatId]: [...currentUsers, userId]
          }
        };
      }
      return state;
    }),

  removeTypingUser: (chatId, userId) =>
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [chatId]: (state.typingUsers[chatId] || []).filter(id => id !== userId)
      }
    })),
}));
