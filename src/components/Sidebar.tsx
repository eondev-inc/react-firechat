// src/components/Sidebar.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { HiPlus, HiUsers, HiChat, HiX, HiSearch, HiUserAdd } from 'react-icons/hi';
import { ref, query, orderByChild, equalTo, get } from 'firebase/database';
import { useAuthStore } from '../store/authStore';
import { useChatStore, type Contact } from '../store/chatStore';
import { addContact, createPrivateChat, loadUserContacts } from '../services/chatService';
import { database } from '../config/firebase';
import Avatar from './Avatar';

const Sidebar: React.FC = () => {
  const [showAddContact, setShowAddContact] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();
  const { chatId: currentChatId } = useParams<{ chatId: string }>();
  const { user } = useAuthStore();
  const { contacts, setContacts } = useChatStore();

  // Filtrar contactos según búsqueda
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    
    const query = searchQuery.toLowerCase();
    return contacts.filter(contact => 
      contact.displayName.toLowerCase().includes(query) ||
      contact.email.toLowerCase().includes(query)
    );
  }, [contacts, searchQuery]);

  // Cargar contactos cuando el usuario se autentica
  useEffect(() => {
    if (!user) return;

    const unsubscribe = loadUserContacts(user.uid, (loadedContacts) => {
      setContacts(loadedContacts);
    });

    return () => {
      unsubscribe();
    };
  }, [user, setContacts]);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail.trim() || !user) return;

    setIsLoading(true);
    setError('');

    try {
      const newContact = await addContact(user.uid, contactEmail);
      if (newContact) {
        // El listener de loadUserContacts se encargará de actualizar la lista automáticamente
        // No necesitamos llamar a addContactToStore para evitar duplicación
        setContactEmail('');
        setShowAddContact(false);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al agregar contacto';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartPrivateChat = async (contact: Contact) => {
    if (!user) return;
    
    try {
      // Buscar el UID del contacto en la base de datos
      const usersRef = ref(database, 'users');
      const userQuery = query(usersRef, orderByChild('email'), equalTo(contact.email));
      const snapshot = await get(userQuery);
      
      if (snapshot.exists()) {
        const contactData = Object.entries(snapshot.val())[0];
        const contactUid = contactData[0]; // La clave es el UID
        
        const chatId = await createPrivateChat(user.uid, contactUid);
        
        // Solo navegar si no estamos ya en este chat
        if (currentChatId !== chatId) {
          navigate(`/chat/${chatId}`);
        }
      }      } catch {
        // Error silenciado - manejar error de creación de chat privado
      }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Chats</h2>
            <button
              onClick={() => setShowAddContact(true)}
              className="p-2 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white rounded-full transition-all transform hover:scale-110 shadow-lg"
              title="Agregar contacto"
            >
              <HiUserAdd className="h-5 w-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-primary-500 dark:focus:border-primary-400 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all outline-none"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* General Chat */}
          <Link
            to="/chat/general"
            className={`
              flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-l-4
              ${isActive('/chat/general') 
                ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500' 
                : 'border-transparent'
              }
            `}
          >
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-lg">
                <HiUsers className="h-6 w-6 text-white" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-secondary-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className={`font-semibold truncate ${
                  isActive('/chat/general')
                    ? 'text-primary-700 dark:text-primary-300'
                    : 'text-gray-900 dark:text-white'
                }`}>
                  Chat General
                </h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                Canal público para todos
              </p>
            </div>
          </Link>

          {/* Section Divider */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Contactos {filteredContacts.length > 0 && `(${filteredContacts.length})`}
              </h3>
            </div>
          </div>

          {/* Contacts List */}
          <div className="px-2">
            {filteredContacts.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  {searchQuery ? (
                    <HiSearch className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                  ) : (
                    <HiUsers className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                  )}
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  {searchQuery ? 'Sin resultados' : 'No tienes contactos'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  {searchQuery 
                    ? 'Intenta con otro término de búsqueda'
                    : 'Agrega contactos para empezar a chatear'
                  }
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => setShowAddContact(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <HiPlus className="h-4 w-4" />
                    Agregar contacto
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-1 pb-4">
                {filteredContacts.map((contact) => {
                  // Crear el ID del chat privado para verificar si está activo
                  const userIds = [user?.uid, contact.id].filter(Boolean) as string[];
                  const sortedIds = [...userIds].sort((a: string, b: string) => a.localeCompare(b));
                  const privateChatId = `private_${sortedIds.join('_')}`;
                  const isActiveChat = currentChatId === privateChatId;
                  
                  return (
                    <button
                      key={contact.id}
                      onClick={() => handleStartPrivateChat(contact)}
                      className={`
                        w-full flex items-center gap-3 p-3 rounded-xl transition-all border-l-4
                        ${isActiveChat 
                          ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 shadow-sm' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-transparent'
                        }
                      `}
                    >
                      <div className="flex-shrink-0">
                        <Avatar
                          src={contact.photoURL}
                          alt={contact.displayName}
                          size="lg"
                          showOnline
                          isOnline={contact.isOnline}
                        />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between mb-0.5">
                          <h3 className={`font-semibold text-sm truncate ${
                            isActiveChat 
                              ? 'text-primary-700 dark:text-primary-300' 
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {contact.displayName}
                          </h3>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {contact.isOnline ? (
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-secondary-500 rounded-full"></span>
                              En línea
                            </span>
                          ) : (
                            'Desconectado'
                          )}
                        </p>
                      </div>
                      <HiChat className={`h-5 w-5 flex-shrink-0 ${
                        isActiveChat 
                          ? 'text-primary-500' 
                          : 'text-gray-400 dark:text-gray-500'
                      }`} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Contact Modal */}
      {showAddContact && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Agregar Contacto
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Ingresa el correo de tu contacto
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddContact(false);
                  setError('');
                  setContactEmail('');
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <HiX className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddContact} className="p-6 space-y-4">
              <div>
                <label 
                  htmlFor="contact-email" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Correo electrónico
                </label>
                <div className="relative">
                  <input
                    id="contact-email"
                    type="email"
                    placeholder="ejemplo@gmail.com"
                    value={contactEmail}
                    onChange={(e) => {
                      setContactEmail(e.target.value);
                      setError('');
                    }}
                    required
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-gray-400 rounded-full"></span>
                  Solo se permiten correos @gmail.com
                </p>
              </div>
              
              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <span className="text-red-600 dark:text-red-400 text-sm">{error}</span>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddContact(false);
                    setError('');
                    setContactEmail('');
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !contactEmail.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Agregando...
                    </span>
                  ) : (
                    'Agregar'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
