// src/components/Sidebar.tsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiPlus, HiUsers, HiChat, HiX } from 'react-icons/hi';
import { ref, query, orderByChild, equalTo, get } from 'firebase/database';
import { useAuthStore } from '../store/authStore';
import { useChatStore, type Contact } from '../store/chatStore';
import { addContact, createPrivateChat, loadUserContacts } from '../services/chatService';
import { database } from '../config/firebase';

const Sidebar: React.FC = () => {
  const [showAddContact, setShowAddContact] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const location = useLocation();
  const { user } = useAuthStore();
  const { contacts, addContact: addContactToStore, setContacts } = useChatStore();

  // Cargar contactos cuando el usuario se autentica
  useEffect(() => {
    if (!user) return;

    const unsubscribe = loadUserContacts(user.uid, (loadedContacts) => {
      setContacts(loadedContacts);
    });

    return () => unsubscribe();
  }, [user, setContacts]);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail.trim() || !user) return;

    setIsLoading(true);
    setError('');

    try {
      const contact = await addContact(user.uid, contactEmail);
      if (contact) {
        addContactToStore(contact);
        setContactEmail('');
        setShowAddContact(false);
      }
    } catch (error: any) {
      setError(error.message || 'Error al agregar contacto');
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
        window.location.href = `/chat/${chatId}`;
      }
    } catch (error) {
      console.error('Error creating private chat:', error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      <div className="w-64 bg-white border-r h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Chats</h2>
            <button
              className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              onClick={() => setShowAddContact(true)}
            >
              <HiPlus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {/* General Chat */}
          <Link
            to="/chat/general"
            className={`flex items-center p-4 hover:bg-gray-50 border-b ${
              isActive('/chat/general') ? 'bg-blue-50 border-r-2 border-blue-500' : ''
            }`}
          >
            <div className="flex items-center space-x-3 w-full">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <HiUsers className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">              <div className="font-medium text-gray-900">Chat General</div>
              <div className="text-sm text-gray-500">Canal público</div>
            </div>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Online
            </span>
            </div>
          </Link>

          {/* Contacts */}
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              Contactos
            </h3>
            
            {contacts.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <HiUsers className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No tienes contactos</p>
                <p className="text-xs">Agrega contactos para chatear</p>
              </div>
            ) : (
              <div className="space-y-2">
                {contacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => handleStartPrivateChat(contact)}
                    className="w-full flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <img
                      src={contact.photoURL || 'https://via.placeholder.com/32'}
                      alt={contact.displayName}
                      className="w-8 h-8 rounded-full object-cover mr-3"
                    />
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900">
                        {contact.displayName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {contact.isOnline ? 'En línea' : 'Desconectado'}
                      </div>
                    </div>
                    <HiChat className="h-4 w-4 text-gray-400" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Contact Modal - Custom Implementation */}
      {showAddContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Agregar Contacto
              </h3>
              <button
                onClick={() => setShowAddContact(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <HiX className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddContact} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  placeholder="ejemplo@gmail.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Solo se permiten correos @gmail.com
                </p>
              </div>
              
              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={isLoading || !contactEmail.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Agregando...' : 'Agregar Contacto'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddContact(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancelar
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
