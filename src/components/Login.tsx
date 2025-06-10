// src/components/Login.tsx
import React from 'react';
import { FaGoogle } from 'react-icons/fa';
import { signInWithGoogle } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      if (user) {
        setUser(user);
        navigate('/chat/general');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Bienvenido a nuestra aplicación de chat
          </p>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6 max-w-sm mx-auto">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <svg 
                className="w-10 h-10 text-blue-600" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900">
              Chat App
            </h3>
            
            <p className="text-center text-gray-500">
              Conecta con tus amigos y mantente en contacto
            </p>
            
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <FaGoogle className="mr-2" />
              Iniciar sesión con Google
            </button>
            
            <div className="text-xs text-gray-400 text-center">
              Solo se permiten cuentas @gmail.com
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
