// src/components/LoadingScreen.tsx
import React, { useState, useEffect } from 'react';

const loadingMessages = [
  "Iniciando sesión...",
  "Verificando credenciales...",
  "Configurando tu perfil...",
  "Conectando al chat...",
  "¡Casi listo!"
];

const LoadingScreen: React.FC = () => {
  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % loadingMessages.length);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="mb-8">
          {/* Animación del logo/icono */}
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg 
              className="w-12 h-12 text-blue-600" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
            </svg>
          </div>
        </div>

        {/* Spinner de carga */}
        <div className="flex justify-center mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>

        {/* Textos de carga dinámicos */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-2 h-8">
          {loadingMessages[currentMessage]}
        </h2>
        <p className="text-gray-600 mb-8">
          Por favor espera mientras configuramos todo para ti
        </p>

        {/* Barra de progreso animada */}
        <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full animate-pulse"></div>
        </div>

        {/* Puntos de carga animados */}
        <div className="flex justify-center mt-6 space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
