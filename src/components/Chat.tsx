// src/components/Chat.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { HiPaperAirplane } from 'react-icons/hi';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { sendMessage, listenToMessages, setTypingStatus, listenToTypingStatus } from '../services/chatService';

const Chat: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { user } = useAuthStore();
  const { messages, typingUsers, setMessages, setTypingUsers } = useChatStore();
  
  const currentMessages = messages[chatId!] || [];
  const currentTypingUsers = typingUsers[chatId!] || [];

  useEffect(() => {
    if (!chatId) return;

    const unsubscribeMessages = listenToMessages(chatId, (msgs) => {
      setMessages(chatId, msgs);
    });

    const unsubscribeTyping = listenToTypingStatus(chatId, (users) => {
      setTypingUsers(chatId, users.filter(u => u !== user?.uid));
    });

    return () => {
      unsubscribeMessages();
      unsubscribeTyping();
    };
  }, [chatId, setMessages, setTypingUsers, user?.uid]);

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user || !chatId) return;

    try {
      await sendMessage(chatId, user.uid, user.displayName || user.email!, message);
      setMessage('');
      handleStopTyping();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    handleTyping();
  };

  const handleTyping = () => {
    if (!isTyping && user && chatId) {
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
    if (isTyping && user && chatId) {
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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
              <img
                src="https://via.placeholder.com/32"
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover"
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
