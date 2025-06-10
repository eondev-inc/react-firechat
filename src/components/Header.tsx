// src/components/Header.tsx
import React from 'react';
import { useAuthStore } from '../store/authStore';
import { logout } from '../services/authService';
import { useNavigate, Link } from 'react-router-dom';
import { HiLogout, HiChat } from 'react-icons/hi';

const Header: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
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
    <nav className="bg-white shadow-xl border-b border-gray-300 fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to={isAuthenticated ? "/chat/general" : "/"} 
            className="flex items-center space-x-2"
          >
            <HiChat className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Chat App</span>
          </Link>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                {/* Navigation Links */}
                <div className="hidden md:flex space-x-4">
                  <Link 
                    to="/chat/general" 
                    className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Chat General
                  </Link>
                  <Link 
                    to="/profile" 
                    className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Perfil
                  </Link>
                </div>

                {/* User Menu */}
                <div className="flex items-center space-x-3">
                  <div className="hidden md:block text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {user.displayName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.email}
                    </div>
                  </div>
                  <img
                    src={user.photoURL || 'https://via.placeholder.com/32'}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <HiLogout className="h-4 w-4" />
                    <span className="hidden md:inline">Cerrar sesión</span>
                  </button>
                </div>
              </>
            ) : (
              <button 
                onClick={handleLogin} 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
