import React, { useEffect, useState } from 'react';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
  theme?: 'light' | 'dark';
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
  theme = 'light'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300); // Match the exit animation duration
  };

  const getTypeStyles = () => {
    const baseStyles = theme === 'dark' 
      ? 'bg-gray-800 border-gray-700 text-gray-100' 
      : 'bg-white border-gray-200 text-gray-900';

    const typeStyles = {
      success: theme === 'dark' 
        ? 'border-l-green-400' 
        : 'border-l-green-500',
      error: theme === 'dark' 
        ? 'border-l-red-400' 
        : 'border-l-red-500',
      warning: theme === 'dark' 
        ? 'border-l-yellow-400' 
        : 'border-l-yellow-500',
      info: theme === 'dark' 
        ? 'border-l-blue-400' 
        : 'border-l-blue-500'
    };

    return `${baseStyles} ${typeStyles[type]}`;
  };

  const getIcon = () => {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type];
  };

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isExiting 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
        }
      `}
    >
      <div
        className={`
          p-4 rounded-lg shadow-lg border border-l-4
          ${getTypeStyles()}
        `}
        role="alert"
      >
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-3 text-lg">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm">
              {title}
            </div>
            {message && (
              <div className={`
                mt-1 text-sm
                ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}
              `}>
                {message}
              </div>
            )}
          </div>
          <button
            onClick={handleClose}
            className={`
              flex-shrink-0 ml-3 p-1 rounded-md transition-colors
              ${theme === 'dark' 
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }
            `}
            aria-label="Close notification"
          >
            <span className="text-lg">×</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;