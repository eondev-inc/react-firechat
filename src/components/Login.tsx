// src/components/Login.tsx
import React from 'react';
import { FaGoogle } from 'react-icons/fa';
import { HiChat, HiShieldCheck, HiLockClosed } from 'react-icons/hi';
import { signInWithGoogle } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import LoadingScreen from './LoadingScreen';
import ENV from '../config/environment';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setLoading, isLoading } = useAuthStore();

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const user = await signInWithGoogle();
      if (user) {
        setUser(user);
        // Simular un pequeño delay para mostrar la pantalla de carga
        setTimeout(() => {
          setLoading(false);
          navigate('/chat/general');
        }, 1500);
      }
    } catch {
      setLoading(false);
    }
  };

  // Mostrar pantalla de carga si está en proceso de login
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 dark:bg-primary-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200 dark:bg-secondary-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-70 animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent-200 dark:bg-accent-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-70 animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative max-w-md w-full space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl p-6 shadow-2xl transform group-hover:scale-105 transition-transform">
                <HiChat className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Firechat
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Conversaciones en tiempo real, seguras y modernas
          </p>
        </div>

        {/* Glassmorphism card */}
        <div className="relative backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 shadow-2xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/20">
          <div className="flex flex-col items-center space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Iniciar Sesión
            </h2>
            
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full group relative flex items-center justify-center px-6 py-4 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-95"
            >
              <FaGoogle className="mr-3 text-xl text-red-500" />
              <span>Continuar con Google</span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/10 to-secondary-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>

            {/* Features */}
            <div className="w-full space-y-3 mt-4">
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                  <HiShieldCheck className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <span>Autenticación segura con Google</span>
              </div>
              
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex-shrink-0 w-8 h-8 bg-secondary-100 dark:bg-secondary-900/30 rounded-full flex items-center justify-center">
                  <HiLockClosed className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
                </div>
                <span>Tus datos están protegidos</span>
              </div>
            </div>

            {/* Info */}
            <div className="w-full pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                Solo se permiten cuentas <span className="font-semibold">@gmail.com</span>
              </p>
              {ENV.isDevelopment && (
                <p className="text-xs text-center text-amber-600 dark:text-amber-400 mt-2">
                  🔧 Modo desarrollo
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          Al continuar, aceptas nuestros{' '}
          <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline">
            términos de servicio
          </a>{' '}
          y{' '}
          <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline">
            política de privacidad
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
