// src/components/Toast.tsx
import React, { useEffect } from 'react';
import { HiCheckCircle, HiXCircle, HiInformationCircle, HiExclamation, HiX } from 'react-icons/hi';
import { type ToastType } from '../contexts/ToastContext';

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, type, message, duration = 5000, onClose }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const icons = {
    success: <HiCheckCircle className="w-5 h-5" aria-hidden="true" />,
    error: <HiXCircle className="w-5 h-5" aria-hidden="true" />,
    info: <HiInformationCircle className="w-5 h-5" aria-hidden="true" />,
    warning: <HiExclamation className="w-5 h-5" aria-hidden="true" />,
  };

  const colors = {
    success: 'bg-secondary-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-primary-500 text-white',
    warning: 'bg-yellow-500 text-white',
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        ${colors[type]}
        min-w-[300px] max-w-md px-4 py-3 rounded-lg shadow-lg 
        flex items-center gap-3 animate-slide-in-right
        backdrop-blur-sm
      `}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 hover:opacity-75 transition-opacity focus-visible-ring rounded"
        aria-label="Cerrar notificación"
      >
        <HiX className="w-5 h-5" aria-hidden="true" />
      </button>
    </div>
  );
};

export default Toast;
