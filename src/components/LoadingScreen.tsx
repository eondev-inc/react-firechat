// src/components/LoadingScreen.tsx
import React, { useState, useEffect } from 'react';
import { HiChat } from 'react-icons/hi';

const loadingMessages = [
  "Iniciando sesión...",
  "Verificando credenciales...",
  "Configurando tu perfil...",
  "Conectando al chat...",
  "¡Casi listo!"
];

const LoadingScreen: React.FC = () => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % loadingMessages.length);
    }, 800);

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 95 ? 95 : prev + 5));
    }, 100);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="text-center">
        {/* Logo animado con efecto de resplandor */}
        <div className="mb-8">
          <div className="relative w-24 h-24 mx-auto">
            {/* Anillos pulsantes */}
            <div className="absolute inset-0 bg-primary-500 rounded-3xl animate-ping opacity-20"></div>
            <div className="absolute inset-0 bg-secondary-500 rounded-3xl animate-pulse opacity-20" style={{ animationDelay: '0.5s' }}></div>
            
            {/* Logo principal */}
            <div className="relative bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center w-full h-full shadow-2xl animate-bounce-slow">
              <HiChat className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-64 mx-auto mb-6">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Textos de carga dinámicos */}
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2 h-8 animate-fade-in">
          {loadingMessages[currentMessage]}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
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
