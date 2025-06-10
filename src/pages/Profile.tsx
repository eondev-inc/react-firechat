// src/pages/Profile.tsx
import React from 'react';
import { HiMail, HiUser, HiCalendar } from 'react-icons/hi';
import { useAuthStore } from '../store/authStore';

const Profile: React.FC = () => {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-500">No hay usuario autenticado</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-gray-600 mt-2">Información de tu cuenta</p>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <img
              src={user.photoURL || 'https://via.placeholder.com/128'}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover ring-4 ring-blue-50"
            />
            
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-gray-900">
                {user.displayName || 'Usuario'}
              </h2>
              <p className="text-gray-600 mt-1">{user.email}</p>
              
              <div className="flex justify-center sm:justify-start mt-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Cuenta Activa
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Información de la Cuenta
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <HiUser className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">Nombre completo</p>
                <p className="text-gray-900">{user.displayName || 'No especificado'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <HiMail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">Correo electrónico</p>
                <p className="text-gray-900">{user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <HiCalendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">Fecha de registro</p>
                <p className="text-gray-900">{formatDate(user.metadata.creationTime || null)}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <HiCalendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">Último acceso</p>
                <p className="text-gray-900">{formatDate(user.metadata.lastSignInTime || null)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Configuración
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Verificación de email</p>
                <p className="text-sm text-gray-500">
                  {user.emailVerified ? 'Tu email está verificado' : 'Email no verificado'}
                </p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.emailVerified 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {user.emailVerified ? "Verificado" : "Pendiente"}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Proveedor de autenticación</p>
                <p className="text-sm text-gray-500">Google OAuth</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Google
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
