// src/components/Chat.tsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { HiPaperAirplane } from 'react-icons/hi';
import { useAuthStore } from '../store/authStore';
import { useChatStore, type Message } from '../store/chatStore';
import { sendMessage, listenToMessages, setTypingStatus, listenToTypingStatus, initializeGeneralChat, getUserInfo } from '../services/chatService';
import Avatar from './Avatar';

const Chat: React.FC = () => {
  const { chatId: routeChatId } = useParams<{ chatId: string }>();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userAvatars, setUserAvatars] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { user } = useAuthStore();
  const { messages, typingUsers, setMessages, setTypingUsers } = useChatStore();
  
  // Si no hay chatId en la ruta, es el chat general
  const chatId = routeChatId ?? 'general';
  
  const currentMessages = useMemo(() => messages[chatId] ?? [], [messages, chatId]);
  const currentTypingUsers = useMemo(() => typingUsers[chatId] ?? [], [typingUsers, chatId]);

  // Función para cargar avatares de usuarios
  const loadUserAvatars = useCallback(async (messages: Message[]) => {
    const uniqueUserIds = [...new Set(messages.map(msg => msg.senderId))];
    
    for (const userId of uniqueUserIds) {
      if (!userAvatars[userId]) {
        try {
          const userInfo = await getUserInfo(userId);
          if (userInfo?.photoURL) {
            setUserAvatars(prev => ({
              ...prev,
              [userId]: userInfo.photoURL!
            }));
          }
        } catch {
          // Error silenciado - no mostrar logs en producción
        }
      }
    }
  }, [userAvatars]);

  useEffect(() => {
    // Inicializar chat general si es necesario
    if (chatId === 'general') {
      initializeGeneralChat().catch(() => {
        // Error silenciado - no mostrar logs en producción
      });
    }

    const unsubscribeMessages = listenToMessages(chatId, (msgs) => {
      setMessages(chatId, msgs);
      
      // Cargar avatares en el siguiente tick para evitar bloqueo
      setTimeout(() => loadUserAvatars(msgs), 0);
    });

    const unsubscribeTyping = listenToTypingStatus(chatId, (users) => {
      setTypingUsers(chatId, users.filter(u => u !== user?.uid));
    });

    return () => {
      unsubscribeMessages();
      unsubscribeTyping();
    };
  }, [chatId, setMessages, setTypingUsers, user?.uid, loadUserAvatars]);

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !user) {
      return;
    }

    try {
      await sendMessage(chatId, user.uid, user.displayName ?? user.email!, message);
      setMessage('');
      handleStopTyping();
    } catch {
      // Mostrar el error al usuario
      alert('Error al enviar el mensaje. Por favor, intenta de nuevo.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    handleTyping();
  };

  const handleTyping = () => {
    if (!isTyping && user) {
      setIsTyping(true);
      setTypingStatus(chatId, user.uid, true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 1000);
  };

  const handleStopTyping = () => {
    if (isTyping && user) {
      setIsTyping(false);
      setTypingStatus(chatId, user.uid, false);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const getChatTitle = () => {
    if (chatId === 'general') return 'Chat General';
    return `Chat Privado`;
  };

  const formatTime = (date: Date | string | number) => {
    try {
      // Asegurar que tenemos un objeto Date válido
      let validDate: Date;
      
      if (date instanceof Date) {
        validDate = date;
      } else if (typeof date === 'string') {
        validDate = new Date(date);
      } else if (typeof date === 'number') {
        validDate = new Date(date);
      } else if (date && typeof date === 'object' && 'seconds' in date) {
        // Firebase Timestamp object
        validDate = new Date((date as { seconds: number }).seconds * 1000);
      } else {
        // Fallback a fecha actual
        validDate = new Date();
      }
      
      // Verificar que la fecha es válida
      if (isNaN(validDate.getTime())) {
        return 'Hora no disponible';
      }
      
      return validDate.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return 'Hora no disponible';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-white border-b p-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {getChatTitle()}
        </h2>
        {currentTypingUsers.length > 0 && (
          <div className="text-sm text-gray-500 mt-1">
            {currentTypingUsers.length === 1 
              ? `Alguien está escribiendo...`
              : `${currentTypingUsers.length} personas están escribiendo...`
            }
          </div>
        )}
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
              msg.senderId === user?.uid ? 'flex-row-reverse space-x-reverse' : ''
            }`}>
              <Avatar
                src={msg.senderId === user?.uid ? user?.photoURL : userAvatars[msg.senderId]}
                alt={msg.senderName}
                size="md"
              />
              <div className={`p-3 rounded-lg shadow-sm ${
                msg.senderId === user?.uid 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100'
              }`}>
                <div className="space-y-1">
                  {msg.senderId !== user?.uid && (
                    <div className="text-xs font-medium text-gray-600">
                      {msg.senderName}
                    </div>
                  )}
                  <div className="text-sm">{msg.text}</div>
                  <div className={`text-xs ${
                    msg.senderId === user?.uid 
                      ? 'text-blue-100' 
                      : 'text-gray-400'
                  }`}>
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            placeholder="Escribe un mensaje..."
            value={message}
            onChange={handleInputChange}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            onBlur={handleStopTyping}
          />
          <button 
            type="submit" 
            disabled={!message.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <HiPaperAirplane className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
