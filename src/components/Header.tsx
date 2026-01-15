// src/components/Header.tsx
import React from 'react';
import { useAuthStore } from '../store/authStore';
import { logout } from '../services/authService';
import { useNavigate, Link } from 'react-router-dom';
import { HiLogout, HiChat, HiMoon, HiSun, HiUserCircle } from 'react-icons/hi';
import { useTheme } from '../contexts/ThemeContext';

const Header: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch {
      // Error silenciado al cerrar sesión
    }
  };

  const handleLogin = () => {
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to={isAuthenticated ? "/chat/general" : "/"} 
            className="flex items-center space-x-3 group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary-500 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <HiChat className="relative h-8 w-8 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Firechat
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <HiSun className="h-5 w-5 text-yellow-500" />
              ) : (
                <HiMoon className="h-5 w-5 text-gray-600" />
              )}
            </button>

            {isAuthenticated && user ? (
              <>
                {/* Navigation Links - Hidden on mobile */}
                <div className="hidden lg:flex space-x-2">
                  <Link 
                    to="/chat/general" 
                    className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Chat General
                  </Link>
                  <Link 
                    to="/profile" 
                    className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Perfil
                  </Link>
                </div>

                {/* User Menu */}
                <div className="flex items-center space-x-3">
                  <div className="hidden md:block text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user.displayName}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {user.email}
                    </div>
                  </div>
                  
                  {/* Avatar with online status */}
                  <div className="relative">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-500 dark:ring-primary-400"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                        <HiUserCircle className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-secondary-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <HiLogout className="h-4 w-4" />
                    <span className="hidden sm:inline">Salir</span>
                  </button>
                </div>
              </>
            ) : (
              <button 
                onClick={handleLogin} 
                className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                Iniciar sesión
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
