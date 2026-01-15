// src/components/Chat.tsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { HiPaperAirplane, HiEmojiHappy, HiDotsVertical, HiChevronDown, HiX, HiReply } from 'react-icons/hi';
import { BsEmojiLaughing, BsEmojiHeartEyes } from 'react-icons/bs';
import EmojiPicker, { type EmojiClickData, type Theme } from 'emoji-picker-react';
import { useAuthStore } from '../store/authStore';
import { useChatStore, type Message } from '../store/chatStore';
import { sendMessage, listenToMessages, setTypingStatus, listenToTypingStatus, initializeGeneralChat, getUserInfo } from '../services/chatService';
import Avatar from './Avatar';
import { 
  sanitizeText, 
  validateMessageLength, 
  messageRateLimiter, 
  spamDetector 
} from '../utils/security';
import { announceToScreenReader } from '../utils/accessibility';
import { useToast } from '../hooks/useToast';

const Chat: React.FC = () => {
  const { chatId: routeChatId } = useParams<{ chatId: string }>();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userAvatars, setUserAvatars] = useState<Record<string, string>>({});
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuthStore();
  const { messages, typingUsers, setMessages, setTypingUsers } = useChatStore();
  const toast = useToast();
  
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

  // Cerrar emoji picker al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Detectar scroll para mostrar botón de scroll
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !user) {
      return;
    }

    try {
      // Validar longitud del mensaje
      const lengthValidation = validateMessageLength(message);
      if (!lengthValidation.valid) {
        toast.warning(lengthValidation.error || 'Mensaje inválido');
        return;
      }

      // Rate limiting - prevenir envío masivo
      if (!messageRateLimiter.canPerformAction()) {
        const waitTime = messageRateLimiter.getTimeUntilNextAction();
        toast.warning(`Por favor espera ${waitTime} segundos antes de enviar otro mensaje.`);
        return;
      }

      // Detectar spam - mensajes repetidos
      if (spamDetector.isSpam(message)) {
        toast.error('Has enviado este mensaje varias veces. Por favor, no hagas spam.');
        return;
      }

      // Sanitizar el mensaje para prevenir XSS
      const sanitizedMessage = sanitizeText(message);

      let messageText = sanitizedMessage;
      
      // Si hay un mensaje al que responder, agregar referencia
      if (replyToMessage) {
        const replyPreview = sanitizeText(replyToMessage.text.substring(0, 50));
        messageText = `↩️ Respondiendo a: "${replyPreview}${replyToMessage.text.length > 50 ? '...' : ''}"\n\n${sanitizedMessage}`;
        setReplyToMessage(null);
      }
      
      await sendMessage(chatId, user.uid, user.displayName ?? user.email!, messageText);
      setMessage('');
      handleStopTyping();
      
      // Anunciar a lectores de pantalla
      announceToScreenReader('Mensaje enviado');
      toast.success('Mensaje enviado');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      
      // Scroll to bottom after sending
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      // Mostrar el error al usuario
      console.error('Error al enviar mensaje:', error);
      toast.error('Error al enviar el mensaje. Por favor, intenta de nuevo.');
      announceToScreenReader('Error al enviar el mensaje', 'assertive');
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const handleReply = (msg: Message) => {
    setReplyToMessage(msg);
    textareaRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyToMessage(null);
  };

  const renderMessageWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary-200 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    handleTyping();

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as unknown as React.FormEvent);
    }
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

  const formatDateSeparator = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    }
  };

  const shouldShowDateSeparator = (currentMsg: Message, previousMsg: Message | null) => {
    if (!previousMsg) return true;
    
    const currentDate = new Date(currentMsg.timestamp);
    const previousDate = new Date(previousMsg.timestamp);
    
    return currentDate.toDateString() !== previousDate.toDateString();
  };

  return (
    <div className="flex flex-col h-full bg-chat-bg-light dark:bg-chat-bg-dark" role="main" aria-label="Área de chat">
      {/* Chat Header */}
      <header 
        className="sticky top-0 z-10 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 px-6 py-4"
        role="banner"
        aria-label="Encabezado del chat"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              {chatId === 'general' ? (
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">G</span>
                </div>
              ) : (
                <Avatar src={null} alt="Chat" size="md" showOnline isOnline />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {getChatTitle()}
              </h2>
              {currentTypingUsers.length > 0 ? (
                <div 
                  className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400"
                  role="status"
                  aria-live="polite"
                  aria-label="Alguien está escribiendo"
                >
                  <span className="animate-pulse">escribiendo</span>
                  <span className="flex gap-0.5">
                    <span className="w-1 h-1 bg-primary-600 dark:bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                    <span className="w-1 h-1 bg-primary-600 dark:bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1 h-1 bg-primary-600 dark:bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </span>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {chatId === 'general' ? 'Chat público' : 'Chat privado'}
                </p>
              )}
            </div>
          </div>
          <button 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors focus-visible-ring"
            aria-label="Menú de opciones del chat"
            title="Opciones"
          >
            <HiDotsVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4 custom-scrollbar"
        role="log"
        aria-label="Mensajes del chat"
        aria-live="polite"
        aria-atomic="false"
      >
        <div className="max-w-4xl mx-auto space-y-4">
          {currentMessages.map((msg, index) => {
            const isMine = msg.senderId === user?.uid;
            const previousMsg = index > 0 ? currentMessages[index - 1] : null;
            const showDate = shouldShowDateSeparator(msg, previousMsg);
            const showAvatar = !isMine && (index === 0 || currentMessages[index - 1].senderId !== msg.senderId);
            const isLastFromSender = index === currentMessages.length - 1 || currentMessages[index + 1].senderId !== msg.senderId;

            return (
              <React.Fragment key={msg.id}>
                {/* Date Separator */}
                {showDate && (
                  <div className="flex justify-center my-6">
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {formatDateSeparator(new Date(msg.timestamp))}
                      </span>
                    </div>
                  </div>
                )}

                {/* Message */}
                <div className={`flex gap-2 ${isMine ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                  {/* Avatar (solo para mensajes recibidos) */}
                  {!isMine && (
                    <div className="flex-shrink-0">
                      {showAvatar ? (
                        <Avatar
                          src={userAvatars[msg.senderId]}
                          alt={msg.senderName}
                          size="sm"
                          showOnline
                          isOnline
                        />
                      ) : (
                        <div className="w-8 h-8"></div>
                      )}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div 
                    className={`group relative max-w-md ${isMine ? 'order-first' : ''}`}
                    onMouseEnter={() => setHoveredMessageId(msg.id)}
                    onMouseLeave={() => setHoveredMessageId(null)}
                  >
                    {/* Quick actions on hover */}
                    {hoveredMessageId === msg.id && (
                      <div className={`absolute -top-8 ${isMine ? 'right-0' : 'left-0'} flex items-center gap-1 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 px-2 py-1 animate-scale-in`}>
                        <button
                          onClick={() => handleReply(msg)}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors focus-visible-ring"
                          title="Responder"
                          aria-label={`Responder al mensaje de ${msg.senderName}`}
                        >
                          <HiReply className="w-4 h-4 text-gray-600 dark:text-gray-400" aria-hidden="true" />
                        </button>
                        <button
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors focus-visible-ring"
                          title="Reaccionar con 😂"
                          aria-label="Reaccionar con risa al mensaje"
                        >
                          <BsEmojiLaughing className="w-4 h-4 text-gray-600 dark:text-gray-400" aria-hidden="true" />
                        </button>
                        <button
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors focus-visible-ring"
                          title="Reaccionar con ❤️"
                          aria-label="Reaccionar con corazón al mensaje"
                        >
                          <BsEmojiHeartEyes className="w-4 h-4 text-gray-600 dark:text-gray-400" aria-hidden="true" />
                        </button>
                      </div>
                    )}
                    
                    <div
                      className={`
                        px-4 py-2 shadow-sm transition-all duration-200
                        ${isMine
                          ? `bg-primary-500 text-white ${isLastFromSender ? 'rounded-2xl rounded-br-md' : 'rounded-2xl'}`
                          : `bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${isLastFromSender ? 'rounded-2xl rounded-bl-md' : 'rounded-2xl'}`
                        }
                      `}
                    >
                      {/* Sender name for received messages in group chats */}
                      {!isMine && chatId === 'general' && showAvatar && (
                        <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 mb-1">
                          {msg.senderName}
                        </p>
                      )}

                      {/* Message text with link detection */}
                      <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                        {renderMessageWithLinks(msg.text)}
                      </p>

                      {/* Timestamp */}
                      <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                        isMine ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        <span>{formatTime(msg.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <div className="absolute bottom-24 right-8 z-10">
          <button
            onClick={() => scrollToBottom()}
            className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 transition-all transform hover:scale-110 focus-visible-ring"
            aria-label="Ir al último mensaje"
            title="Ir abajo"
          >
            <HiChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Message Input */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3">
        <div className="max-w-4xl mx-auto">
          {/* Reply preview */}
          {replyToMessage && (
            <div className="mb-3 flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-4 py-2 border-l-4 border-primary-500">
              <HiReply className="w-5 h-5 text-primary-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Respondiendo a {replyToMessage.senderName}
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-200 truncate">
                  {replyToMessage.text}
                </p>
              </div>
              <button
                onClick={cancelReply}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors focus-visible-ring"
                aria-label="Cancelar respuesta"
                title="Cancelar"
              >
                <HiX className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" />
              </button>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex items-end gap-3" aria-label="Formulario de envío de mensajes">
            {/* Emoji button with picker */}
            <div className="relative mb-1" ref={emojiPickerRef}>
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors flex-shrink-0 focus-visible-ring"
                title="Emojis"
                aria-label="Abrir selector de emojis"
                aria-expanded={showEmojiPicker}
                aria-controls="emoji-picker"
              >
                <HiEmojiHappy className="w-6 h-6 text-gray-500 dark:text-gray-400" aria-hidden="true" />
              </button>

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div 
                  id="emoji-picker"
                  className="absolute bottom-full mb-2 left-0 z-50 animate-scale-in"
                  role="dialog"
                  aria-label="Selector de emojis"
                >
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    theme={(document.documentElement.classList.contains('dark') ? 'dark' : 'light') as Theme}
                    width={350}
                    height={400}
                  />
                </div>
              )}
            </div>

            {/* Text input container */}
            <div className="flex-1 relative">
              <label htmlFor="message-input" className="sr-only">Mensaje</label>
              <div className="flex items-end bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-3xl px-5 py-2.5 transition-colors border-2 border-transparent focus-within:border-primary-500 dark:focus-within:border-primary-400 focus-within:bg-white dark:focus-within:bg-gray-800">
                <textarea
                  id="message-input"
                  ref={textareaRef}
                  value={message}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onBlur={handleStopTyping}
                  placeholder="Escribe un mensaje..."
                  rows={1}
                  className="w-full bg-transparent resize-none outline-none border-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 max-h-32 leading-6"
                  style={{ minHeight: '24px' }}
                  aria-label="Escribe tu mensaje"
                  aria-describedby="keyboard-hints"
                  maxLength={5000}
                />
              </div>
            </div>

            {/* Send button */}
            <button
              type="submit"
              disabled={!message.trim()}
              className="mb-1 p-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed rounded-full transition-all transform hover:scale-110 active:scale-95 disabled:scale-100 flex-shrink-0 shadow-lg hover:shadow-xl disabled:shadow-none focus-visible-ring"
              title="Enviar mensaje"
              aria-label="Enviar mensaje"
            >
              <HiPaperAirplane className="w-5 h-5 text-white transform rotate-90" aria-hidden="true" />
            </button>
          </form>
          
          <p id="keyboard-hints" className="text-xs text-gray-400 dark:text-gray-500 text-center mt-2.5">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded">Enter</kbd>
              <span>envía</span>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded">Shift</kbd>
              <span>+</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded">Enter</kbd>
              <span>nueva línea</span>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
