import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark';
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  theme = 'light',
  message
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const colorClasses = theme === 'dark' 
    ? 'border-gray-600 border-t-blue-400' 
    : 'border-gray-300 border-t-blue-600';

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div
        className={`
          ${sizeClasses[size]} 
          ${colorClasses}
          border-2 border-solid rounded-full animate-spin
        `}
        role="status"
        aria-label="Loading"
      />
      {message && (
        <div className={`
          text-sm
          ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}
        `}>
          {message}
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;